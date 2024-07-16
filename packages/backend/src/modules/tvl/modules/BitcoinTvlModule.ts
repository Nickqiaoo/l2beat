import { assert, Logger } from '@l2beat/backend-tools'
import { BlockchainClient, EtherscanClient } from '@l2beat/shared'
import { ChainId } from '@l2beat/shared-pure'

import { Config } from '../../../config'
import { Peripherals } from '../../../peripherals/Peripherals'

import { Clock } from '../../../tools/Clock'
import { BlockNumberUpdater } from '../BlockNumberUpdater'
import { PriceUpdater } from '../PriceUpdater'
import { CBVUpdater } from '../assets'

import { BalanceUpdater } from '../balances/BalanceUpdater'
import { BalanceRepository } from '../repositories/BalanceRepository'
import { BalanceStatusRepository } from '../repositories/BalanceStatusRepository'
import { BlockNumberRepository } from '../repositories/BlockNumberRepository'
import { ReportRepository } from '../repositories/ReportRepository'
import { ReportStatusRepository } from '../repositories/ReportStatusRepository'
import { TvlModule } from './types'
import { BitcoinBalanceProvider } from '../balances/BitcoinBalanceProvider'

export function createBitcoinTvlModule(
  peripherals: Peripherals,
  priceUpdater: PriceUpdater,
  config: Config,
  logger: Logger,
  clock: Clock,
): TvlModule | undefined {
  const tvlConfig = config.tvl.bitcoin.config
  if (!tvlConfig) {
    logger.info('BitcoinTvlModule disabled')
    return
  }

  logger = logger.tag('bitcoin')

  // #region peripherals

  assert(tvlConfig.blockNumberProviderConfig.type === 'blockchain')

  const bitcoinClient = peripherals.getClient(BlockchainClient, {chainId: ChainId(0)})
  

  const balanceProvider = new BitcoinBalanceProvider(
    bitcoinClient,
  )

  const bitcoinBlockNumberUpdater = new BlockNumberUpdater(
    bitcoinClient,
    peripherals.getRepository(BlockNumberRepository),
    clock,
    logger,
    ChainId(0),
    tvlConfig.minBlockTimestamp,
  )

  const balanceUpdater = new BalanceUpdater(
    balanceProvider,
    bitcoinBlockNumberUpdater,
    peripherals.getRepository(BalanceRepository),
    peripherals.getRepository(BalanceStatusRepository),
    clock,
    config.projects,
    logger,
    ChainId(0),
    tvlConfig.minBlockTimestamp,
  )

  const cbvUpdater = new CBVUpdater(
    priceUpdater,
    balanceUpdater,
    peripherals.getRepository(ReportRepository),
    peripherals.getRepository(ReportStatusRepository),
    clock,
    config.projects,
    logger,
    tvlConfig.minBlockTimestamp,
    ChainId.BITCOIN
  )


  const start = async () => {
    logger = logger.for('BitcoinTvlModule')
    logger.info('Starting')

    await bitcoinBlockNumberUpdater.start()
    await balanceUpdater.start()
    await cbvUpdater.start()

    logger.info('Started')
  }

  return {
    chain: config.tvl.bitcoin.chain,
    reportUpdaters: [cbvUpdater],
    dataUpdaters: [bitcoinBlockNumberUpdater, balanceUpdater],
    start,
  }
}
