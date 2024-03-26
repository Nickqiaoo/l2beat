import { bugless } from './bugless'
import { deri } from './deri'
import { mxc } from './mxc'
import { orb3 } from './orb3'
import { popapex } from './popapex'
import { rari } from './rari'
import { stack } from './stack'
import { syndicateframe } from './syndicateframe'
import { Layer3 } from './types'
import { xai } from './xai'
import { zklinknova } from './zklinknexus'

export * from './types'

export const layer3s: Layer3[] = [
  bugless,
  deri,
  rari,
  zklinknova,
  xai,
  orb3,
  popapex,
  syndicateframe,
  mxc,
  stack,
]
