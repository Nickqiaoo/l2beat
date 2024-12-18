import { Logger } from '@l2beat/backend-tools'
import { BlockchainClient, BlockscoutClient, EtherscanClient } from '@l2beat/shared'
import {
  AmountConfigEntry,
  EscrowEntry,
  ProjectId,
  TotalSupplyEntry,
  UnixTime,
  capitalizeFirstLetter,
  notUndefined,
} from '@l2beat/shared-pure'
import { groupBy } from 'lodash'

import { z } from 'zod'
import { ChainTvlConfig, Tvl2Config } from '../../../config/Config'
import { Peripherals } from '../../../peripherals/Peripherals'
import { KnexMiddleware } from '../../../peripherals/database/KnexMiddleware'
import { MulticallClient } from '../../../peripherals/multicall/MulticallClient'
import { RpcClient } from '../../../peripherals/rpcclient/RpcClient'
import { IndexerService } from '../../../tools/uif/IndexerService'
import { Configuration } from '../../../tools/uif/multi/types'
import { HourlyIndexer } from '../../tracked-txs/HourlyIndexer'
import { BlockTimestampIndexer } from '../indexers/BlockTimestampIndexer'
import { ChainAmountIndexer } from '../indexers/ChainAmountIndexer'
import { ValueIndexer } from '../indexers/ValueIndexer'
import { AmountRepository } from '../repositories/AmountRepository'
import { BlockTimestampRepository } from '../repositories/BlockTimestampRepository'
import { PriceRepository } from '../repositories/PriceRepository'
import { ValueRepository } from '../repositories/ValueRepository'
import { AmountService, ChainAmountConfig } from '../services/AmountService'
import { BlockTimestampService } from '../services/BlockTimestampService'
import { ValueService } from '../services/ValueService'
import { IdConverter } from '../utils/IdConverter'
import { SyncOptimizer } from '../utils/SyncOptimizer'
import { createAmountId } from '../utils/createAmountId'
import { PriceModule } from './PriceModule'

interface ChainModule {
  start: () => Promise<void> | void
}

export function createChainModules(
  config: Tvl2Config,
  peripherals: Peripherals,
  logger: Logger,
  hourlyIndexer: HourlyIndexer,
  syncOptimizer: SyncOptimizer,
  indexerService: IndexerService,
  priceModule: PriceModule,
  idConverter: IdConverter,
): ChainModule[] {
  return config.chains
    .map((chain) =>
      createChainModule(
        config,
        chain,
        config.amounts,
        peripherals,
        logger,
        hourlyIndexer,
        syncOptimizer,
        indexerService,
        priceModule,
        idConverter,
      ),
    )
    .filter(notUndefined)
    .flat()
}

function createChainModule(
  config: Tvl2Config,
  chainConfig: ChainTvlConfig,
  amounts: AmountConfigEntry[],
  peripherals: Peripherals,
  logger: Logger,
  hourlyIndexer: HourlyIndexer,
  syncOptimizer: SyncOptimizer,
  indexerService: IndexerService,
  priceModule: PriceModule,
  idConverter: IdConverter,
): ChainModule | undefined {
  const chain = chainConfig.chain

  const name = `${capitalizeFirstLetter(chain)}TvlModule`
  if (!chainConfig.config) {
    logger.info(`${name} disabled`)
    return
  }
  logger = logger.tag(chain)

  const blockTimestampProvider =
  (() => {
  
    if (chainConfig.config.blockNumberProviderConfig.type === 'blockscout') {
      return peripherals.getClient(BlockscoutClient, {
        url: chainConfig.config.blockNumberProviderConfig.blockscoutApiUrl,
        minTimestamp: chainConfig.config.minBlockTimestamp,
        chainId: chainConfig.config.chainId,
      })
    } else if (chainConfig.config.blockNumberProviderConfig.type === 'etherscan') {
      return peripherals.getClient(EtherscanClient, {
        url: chainConfig.config.blockNumberProviderConfig.etherscanApiUrl,
        apiKey: chainConfig.config.blockNumberProviderConfig.etherscanApiKey,
        minTimestamp: chainConfig.config.minBlockTimestamp,
        chainId: chainConfig.config.chainId,
      })
    } else if (chainConfig.config.blockNumberProviderConfig.type === 'blockchain') {
      return peripherals.getClient(BlockchainClient, {
        chainId: chainConfig.config.chainId,
      })
    } else {
      throw new Error('Unsupported block number provider type')
    }
  })()

  const rpcClient = peripherals.getClient(RpcClient, {
    url: chainConfig.config.providerUrl,
    callsPerMinute: chainConfig.config.providerCallsPerMinute,
  })

  const blockTimestampService = new BlockTimestampService({
    blockTimestampProvider,
    rpcClient,
    logger,
  })

  const blockTimestampIndexer = new BlockTimestampIndexer({
    logger,
    tag: chain,
    parents: [hourlyIndexer],
    minHeight: chainConfig.config.minBlockTimestamp.toNumber(),
    indexerService,
    chain,
    blockTimestampService,
    blockTimestampRepository: peripherals.getRepository(
      BlockTimestampRepository,
    ),
    syncOptimizer,
  })

  const amountService = new AmountService({
    rpcClient: rpcClient,
    multicallClient: new MulticallClient(
      rpcClient,
      chainConfig.config.multicallConfig,
    ),
    logger: logger.tag(chain),
  })

  const escrowsAndTotalSupplies = amounts
    .filter((a) => a.chain === chain)
    .filter(
      (a): a is ChainAmountConfig =>
        a.type === 'escrow' || a.type === 'totalSupply',
    )

  const chainMinTimestamp = chainConfig.config.minBlockTimestamp

  const configurations: Configuration<EscrowEntry | TotalSupplyEntry>[] =
    escrowsAndTotalSupplies.map((a) => ({
      id: createAmountId(a),
      properties: a,
      minHeight: a.sinceTimestamp.lt(chainMinTimestamp)
        ? chainMinTimestamp.toNumber()
        : a.sinceTimestamp.toNumber(),
      maxHeight: a.untilTimestamp?.toNumber() ?? null,
    }))

  const chainAmountIndexer = new ChainAmountIndexer({
    logger,
    tag: chain,
    parents: [blockTimestampIndexer],
    indexerService,
    configurations,
    chain,
    amountService,
    amountRepository: peripherals.getRepository(AmountRepository),
    blockTimestampRepository: peripherals.getRepository(
      BlockTimestampRepository,
    ),
    serializeConfiguration,
    deserializeConfiguration,
    syncOptimizer,
    createDatabaseMiddleware: async () =>
      new KnexMiddleware(peripherals.getRepository(AmountRepository)),
  })

  const perProject = groupBy(escrowsAndTotalSupplies, 'project')

  const valueIndexers: ValueIndexer[] = []
  const parents = [priceModule.descendant, chainAmountIndexer]
  for (const [project, amountConfigs] of Object.entries(perProject)) {
    const priceConfigs = new Set(
      amountConfigs.map((c) => idConverter.getPriceConfigFromAmountConfig(c)),
    )

    const valueService = new ValueService({
      amountRepository: peripherals.getRepository(AmountRepository),
      priceRepository: peripherals.getRepository(PriceRepository),
    })

    const indexer = new ValueIndexer({
      valueService,
      valueRepository: peripherals.getRepository(ValueRepository),
      priceConfigs: [...priceConfigs],
      amountConfigs,
      project: ProjectId(project),
      dataSource: chain,
      syncOptimizer,
      parents,
      tag: `${project}_${chain}`,
      indexerService,
      logger,
      minHeight: amountConfigs
        .reduce(
          (prev, curr) => UnixTime.min(prev, curr.sinceTimestamp),
          amountConfigs[0].sinceTimestamp,
        )
        .toNumber(),
      maxTimestampsToProcessAtOnce: config.maxTimestampsToAggregateAtOnce,
    })

    valueIndexers.push(indexer)
  }

  return {
    start: async () => {
      await blockTimestampIndexer.start()
      await chainAmountIndexer.start()

      for (const indexer of valueIndexers) {
        await indexer.start()
      }
    },
  }
}

function serializeConfiguration(value: EscrowEntry | TotalSupplyEntry): string {
  switch (value.type) {
    case 'escrow':
      return JSON.stringify({
        ...value,
        address: value.address.toString(),
        escrowAddress: value.escrowAddress.toString(),
        chain: value.chain,
        project: value.project.toString(),
        source: value.source,
        sinceTimestamp: value.sinceTimestamp.toNumber(),
        ...({ untilTimestamp: value.untilTimestamp?.toNumber() } ?? {}),
        includeInTotal: value.includeInTotal,
      })
    case 'totalSupply':
      return JSON.stringify({
        ...value,
        address: value.address.toString(),
        chain: value.chain,
        project: value.project.toString(),
        source: value.source,
        sinceTimestamp: value.sinceTimestamp.toNumber(),
        ...({ untilTimestamp: value.untilTimestamp?.toNumber() } ?? {}),
        includeInTotal: value.includeInTotal,
      })
  }
}

function deserializeConfiguration(
  value: string,
): EscrowEntry | TotalSupplyEntry {
  return z.union([EscrowEntry, TotalSupplyEntry]).parse(JSON.parse(value))
}
