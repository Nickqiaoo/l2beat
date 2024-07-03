import { EthereumAddress, UnixTime } from '@l2beat/shared-pure'

import { ChainConfig } from '../common/ChainConfig'

export const bitcoin: ChainConfig = {
  name: 'bitcoin',
  chainId: 0,
  explorerUrl: 'https://etherscan.io',
  explorerApi: {
    url: 'https://api.etherscan.io/api',
    type: 'blockchain',
  },
  blockscoutV2ApiUrl: 'https://eth.blockscout.com/api/v2',
  // Deployment of the first L2
  minTimestampForTvl: new UnixTime(1712247832),

  coingeckoPlatform: 'bitcoin',
}
