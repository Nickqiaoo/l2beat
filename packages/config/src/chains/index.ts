import { notUndefined } from '@l2beat/shared-pure'

import { ChainConfig } from '../common/ChainConfig'
import { layer2s, layer3s } from '../projects'
import { avalanche } from './avalanche'
import { bsc } from './bsc'
import { celo } from './celo'
import { ethereum } from './ethereum'
import { gnosis } from './gnosis'
import { polygonpos } from './polygonpos'
import { bitcoin } from './bitcoin'

export const chains: ChainConfig[] = [
  ...layer2s.map((layer2) => layer2.chainConfig).filter(notUndefined),
  ...layer3s.map((layer3) => layer3.chainConfig).filter(notUndefined),
  avalanche,
  bsc,
  celo,
  ethereum,
  gnosis,
  polygonpos,
  bitcoin,
]
