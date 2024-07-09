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


export const bevm: Layer2 = {
    type: 'layer2',
    id: ProjectId('bevm'),
    display: {
        name: 'BEVM',
        slug: 'BEVM',
        description:
            'BEVM',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://www.bevm.io/'],
            apps: [
                'https://www.bevm.io/bridge-mainnet',
            ],
            documentation: ['https://documents.bevm.io/'],
            explorers: [
                'https://scan-mainnet.bevm.io/',
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
        name: 'bevm',
        chainId: 11501,
        explorerUrl: 'https://scan-mainnet.bevm.io/',
        explorerApi: {
            url: 'https://scan-mainnet-api.bevm.io/api/',
            type: 'blockscout',
        },
        minTimestampForTvl: new UnixTime(1710055920),
        multicallContracts: [
            {
                address: EthereumAddress('0xa7487A536968Be0D563901aeb3Fc07B099e2fb04'),
                batchSize: 150,
                sinceBlock: 129086,
                version: '3',
            },
        ],
        coingeckoPlatform: 'bevm',
    },
    config: {
        escrows: [
            {
                address: 'bc1pych5yegawx5ua7te4um68c09uam7wtv80x87hm7w8ljmqxqwh6js73p2f0',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1710055920),
                chain: 'btc'
            },
        ],
        transactionApi: {
            type: 'rpc',
            defaultUrl: 'https://rpc-mainnet-1.bevm.io',
            defaultCallsPerMinute: 400,
            startBlock: 1607194,
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
