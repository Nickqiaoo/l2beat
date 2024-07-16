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


export const ckbtc: Layer2 = {
    type: 'layer2',
    id: ProjectId('ckbtc'),
    display: {
        name: 'ckbtc',
        slug: 'ckbtc',
        description:
            'ckbtc',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://dashboard.internetcomputer.org/bitcoin'],
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
        name: 'ckbtc',
        chainId: 10100003,
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
                address: 'defillama:ckbtc',
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
