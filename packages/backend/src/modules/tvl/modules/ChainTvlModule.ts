import { Logger } from '@l2beat/backend-tools'
import {
  BlockNumberProvider,
  BlockchainClient,
  BlockscoutClient,
  CoingeckoQueryService,
  EtherscanClient,
} from '@l2beat/shared'
import {
  ChainId,
  ProjectId,
  Token,
  UnixTime,
  capitalizeFirstLetter,
  notUndefined,
} from '@l2beat/shared-pure'

import { ChainTvlConfig } from '../../../config/Config'
import { Peripherals } from '../../../peripherals/Peripherals'
import { MulticallClient } from '../../../peripherals/multicall/MulticallClient'
import { RpcClient } from '../../../peripherals/rpcclient/RpcClient'
import { Clock } from '../../../tools/Clock'
import { BlockNumberUpdater } from '../BlockNumberUpdater'
import { PriceUpdater } from '../PriceUpdater'
import { CirculatingSupplyFormulaUpdater } from '../assets/CirculatingSupplyFormulaUpdater'
import { TotalSupplyFormulaUpdater } from '../assets/TotalSupplyFormulaUpdater'
import { BlockNumberRepository } from '../repositories/BlockNumberRepository'
import { CirculatingSupplyRepository } from '../repositories/CirculatingSupplyRepository'
import { ReportRepository } from '../repositories/ReportRepository'
import { ReportStatusRepository } from '../repositories/ReportStatusRepository'
import { TotalSupplyRepository } from '../repositories/TotalSupplyRepository'
import { TotalSupplyStatusRepository } from '../repositories/TotalSupplyStatusRepository'
import { CirculatingSupplyUpdater } from '../totalSupply/CirculatingSupplyUpdater'
import { TotalSupplyProvider } from '../totalSupply/TotalSupplyProvider'
import { TotalSupplyUpdater } from '../totalSupply/TotalSupplyUpdater'
import { TvlModule } from './types'

export function chainTvlModule(
  { chain, config }: ChainTvlConfig,
  tokens: Token[],
  peripherals: Peripherals,
  priceUpdater: PriceUpdater,
  coingeckoQueryService: CoingeckoQueryService,
  clock: Clock,
  logger: Logger,
): TvlModule | undefined {
  const name = `${capitalizeFirstLetter(chain)}TvlModule`
  if (!config) {
    logger.info(`${name} disabled`)
    return
  }
  logger = logger.tag(chain)

  // #region peripherals

  const blockNumberProvider: BlockNumberProvider =
  (() => {
  
    if (config.blockNumberProviderConfig.type === 'blockscout') {
      return peripherals.getClient(BlockscoutClient, {
        url: config.blockNumberProviderConfig.blockscoutApiUrl,
        minTimestamp: config.minBlockTimestamp,
        chainId: config.chainId,
      })
    } else if (config.blockNumberProviderConfig.type === 'etherscan') {
      return peripherals.getClient(EtherscanClient, {
        url: config.blockNumberProviderConfig.etherscanApiUrl,
        apiKey: config.blockNumberProviderConfig.etherscanApiKey,
        minTimestamp: config.minBlockTimestamp,
        chainId: config.chainId,
      })
    } else if (config.blockNumberProviderConfig.type === 'blockchain') {
      return peripherals.getClient(BlockchainClient, {
        chainId: config.chainId,
      })
    } else {
      throw new Error('Unsupported block number provider type')
    }
  })()

  const ethereumClient = peripherals.getClient(RpcClient, {
    url: config.providerUrl,
    callsPerMinute: config.providerCallsPerMinute,
  })
  const multicallClient = new MulticallClient(
    ethereumClient,
    config.multicallConfig,
  )

  const totalSupplyProvider = new TotalSupplyProvider(
    multicallClient,
    config.chainId,
  )

  // #endregion
  // #region updaters

  const blockNumberUpdater = new BlockNumberUpdater(
    blockNumberProvider,
    peripherals.getRepository(BlockNumberRepository),
    clock,
    logger,
    config.chainId,
    config.minBlockTimestamp,
  )

  const totalSupplyTokens = tokens
    // temporary solution - will be removed once tvl2 migration is complete
    .filter((t) => (t.symbol === 'ETH' && t.type === 'EBV') || t.symbol !== 'ETH').filter((t) => t.symbol !== 'BTC')
    .filter((t) => t.chainId === config.chainId && t.formula === 'totalSupply')

  const { totalSupplyUpdater, totalSupplyFormulaUpdater } =
    initializeTotalSupply(
      totalSupplyTokens,
      totalSupplyProvider,
      blockNumberUpdater,
      priceUpdater,
      config,
      peripherals,
      clock,
      logger,
    )

  const circulatingSupplyTokens = tokens
    // temporary solution - will be removed once tvl2 migration is complete
    .filter((t) => t.symbol !== 'ETH')
    .filter(
      (t) => t.chainId === config.chainId && t.formula === 'circulatingSupply',
    )

  const { circulatingSupplyUpdater, circulatingSupplyFormulaUpdater } =
    initializeCirculatingSupply(
      circulatingSupplyTokens,
      coingeckoQueryService,
      priceUpdater,
      config,
      peripherals,
      clock,
      logger,
    )
  // #endregion

  const start = async () => {
    logger = logger.for(name)
    logger.info('Starting')

    await blockNumberUpdater.start()
    await totalSupplyUpdater?.start()
    await totalSupplyFormulaUpdater?.start()
    circulatingSupplyUpdater?.start()
    await circulatingSupplyFormulaUpdater?.start()

    logger.info('Started')
  }

  return {
    chain,
    reportUpdaters: [
      totalSupplyFormulaUpdater,
      circulatingSupplyFormulaUpdater,
    ].filter(notUndefined),
    dataUpdaters: [
      blockNumberUpdater,
      totalSupplyUpdater,
      circulatingSupplyUpdater,
    ].filter(notUndefined),
    start,
  }
}

function initializeCirculatingSupply(
  circulatingSupplyTokens: Token[],
  coingeckoQueryService: CoingeckoQueryService,
  priceUpdater: PriceUpdater,
  config: {
    projectId: ProjectId
    chainId: ChainId
    minBlockTimestamp: UnixTime
  },
  peripherals: Peripherals,
  clock: Clock,
  logger: Logger,
) {
  if (circulatingSupplyTokens.length === 0) {
    return {
      circulatingSupplyUpdater: undefined,
      circulatingSupplyFormulaUpdater: undefined,
    }
  }

  const circulatingSupplyUpdater = new CirculatingSupplyUpdater(
    coingeckoQueryService,
    peripherals.getRepository(CirculatingSupplyRepository),
    clock,
    circulatingSupplyTokens,
    config.chainId,
    logger,
    config.minBlockTimestamp,
  )

  const circulatingSupplyFormulaUpdater = new CirculatingSupplyFormulaUpdater(
    priceUpdater,
    circulatingSupplyUpdater,
    peripherals.getRepository(ReportRepository),
    peripherals.getRepository(ReportStatusRepository),
    config.projectId,
    config.chainId,
    clock,
    circulatingSupplyTokens,
    logger,
    config.minBlockTimestamp,
  )
  return { circulatingSupplyUpdater, circulatingSupplyFormulaUpdater }
}

function initializeTotalSupply(
  totalSupplyTokens: Token[],
  totalSupplyProvider: TotalSupplyProvider,
  blockNumberUpdater: BlockNumberUpdater,
  priceUpdater: PriceUpdater,
  config: {
    projectId: ProjectId
    chainId: ChainId
    minBlockTimestamp: UnixTime
  },
  peripherals: Peripherals,
  clock: Clock,
  logger: Logger,
) {
  if (totalSupplyTokens.length === 0) {
    return {
      totalSupplyUpdater: undefined,
      totalSupplyFormulaUpdater: undefined,
    }
  }

  const totalSupplyUpdater = new TotalSupplyUpdater(
    totalSupplyProvider,
    blockNumberUpdater,
    peripherals.getRepository(TotalSupplyRepository),
    peripherals.getRepository(TotalSupplyStatusRepository),
    clock,
    totalSupplyTokens,
    logger,
    config.chainId,
    config.minBlockTimestamp,
  )

  const totalSupplyFormulaUpdater = new TotalSupplyFormulaUpdater(
    priceUpdater,
    totalSupplyUpdater,
    peripherals.getRepository(ReportRepository),
    peripherals.getRepository(ReportStatusRepository),
    config.projectId,
    config.chainId,
    clock,
    totalSupplyTokens,
    logger,
    config.minBlockTimestamp,
  )
  return { totalSupplyUpdater, totalSupplyFormulaUpdater }
}
