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


export const bsquared: Layer2 = {
    type: 'layer2',
    id: ProjectId('bsquared'),
    display: {
        name: 'Bsquared',
        slug: 'Bsquared',
        description:
            'Bsquared',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://bsquared.network/'],
            apps: [
                'https://bridge.bsquared.network/',
            ],
            documentation: ['https://docs.bsquared.network/'],
            explorers: [
                'https://explorer.bsquared.network/',
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
        name: 'bsquared',
        chainId: 223,
        explorerUrl: 'https://explorer.bsquared.network/',
        explorerApi: {
            url: 'https://explorer.bsquared.network/api/',
            type: 'etherscan',
        },
        minTimestampForTvl: new UnixTime(1713163788),
        multicallContracts: undefined,
        coingeckoPlatform: 'bsquared-network',
    },
    config: {
        escrows: [
            {
                address: '131fpYjELat58RVzPp2A9Bo8oNuKiP4vxg',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1713163788),
                chain: 'btc'
            },
        ],
        transactionApi: {
            type: 'rpc',
            defaultUrl: 'https://rpc.bsquared.network',
            defaultCallsPerMinute: 400,
            startBlock: 3331337,
        },
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
