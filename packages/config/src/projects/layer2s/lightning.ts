import {
    EthereumAddress,
    ProjectId,
    UnixTime,
} from '@l2beat/shared-pure'

import {

    TECHNOLOGY,
    UPCOMING_RISK_VIEW,

} from '../../common'
import { Layer2 } from './types'


export const lightning: Layer2 = {
    type: 'layer2',
    id: ProjectId('lightning'),
    display: {
        name: 'lightning-network',
        slug: 'lightning-network',
        description:
            'lightning-network',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://lightning.network/'],
            apps: [
                '',
            ],
            documentation: [''],
            explorers: [
                '',
            ],
            repositories: [

            ],
            socialMedia: [

            ],
            rollupCodes: '',
        },
        activityDataSource: 'Blockchain RPC',

    },
    riskView: UPCOMING_RISK_VIEW,
    technology: TECHNOLOGY.UPCOMING,
    stage: {
        stage: 'NotApplicable',
    },
    chainConfig: {
        name: 'lightning',
        chainId: 10100006,
        explorerUrl: '',
        explorerApi: {
            url: '',
            type: 'blockchain',
        },
        minTimestampForTvl: new UnixTime(1710055920),
    },
    config: {
        escrows: [
            {
                address: 'defillama:lightning-network',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1710055920),
                chain: 'btc'
            },
        ],
       
        trackedTxs: [

        ],
    },
    contracts: {
        addresses: [

        ],
        risks: [],
    },
    permissions: [

    ],
    milestones: [

    ],
}
