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


export const bitlayer: Layer2 = {
    type: 'layer2',
    id: ProjectId('bitlayer'),
    display: {
        name: 'BitLayer',
        slug: 'bitlayer',
        description:
            'BitLayer',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://bitlayer.io'],
            apps: [
                'https://www.bitlayer.org/bridge',
            ],
            documentation: ['https://docs.bitlayer.org/docs/Learn/Introduction'],
            explorers: [
                'https://www.btrscan.com/',
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
        name: 'bitlayer',
        chainId: 200901,
        explorerUrl: 'https://www.btrscan.com/',
        explorerApi: {
            url: 'https://api.btrscan.com/scan/api',
            type: 'etherscan',
        },
        minTimestampForTvl: new UnixTime(1712247832),
        multicallContracts: [
            {
                address: EthereumAddress('0xc8818aaeaBF0dF9f3f3ffF54Ab185705177A6234'),
                batchSize: 150,
                sinceBlock: 69,
                version: '1',
            },
        ],
        coingeckoPlatform: 'bitlayer',
    },
    config: {
        escrows: [
            {
                address: '132Cka5Vdw9FcFX3eb28xikKAMvhuMJGwi',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            }
        ],
        transactionApi: {
            type: 'rpc',
            defaultUrl: 'https://rpc.bitlayer.org',
            defaultCallsPerMinute: 400,
            startBlock: 2566443,
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
