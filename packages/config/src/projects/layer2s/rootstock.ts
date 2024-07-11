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


export const rootstock: Layer2 = {
    type: 'layer2',
    id: ProjectId('rootstock'),
    display: {
        name: 'RootStock',
        slug: 'RootStock',
        description:
            'RootStock',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://rootstock.io/'],
            apps: [
                'https://www.bevm.io/bridge-mainnet',
            ],
            documentation: ['https://dev.rootstock.io/'],
            explorers: [
                'https://rootstock.blockscout.com/',
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
        name: 'rootstock',
        chainId: 30,
        explorerUrl: 'https://rootstock.blockscout.com/',
        explorerApi: {
            url: 'https://rootstock.blockscout.com/api/',
            type: 'blockscout',
        },
        minTimestampForTvl: new UnixTime(1710055920),
        multicallContracts: undefined,
        coingeckoPlatform: 'rootstock',
    },
    config: {
        escrows: [
            {
                address: '3LxPz39femVBL278mTiBvgzBNMVFqXssoH',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1710055920),
                chain: 'btc'
            },
        ],
        transactionApi: {
            type: 'rpc',
            defaultUrl: 'https://rpc.mainnet.rootstock.io/rnRc6lzHt5Op8w6GHgJ9A1JXKy0fgc-M',
            defaultCallsPerMinute: 60,
            startBlock: 6480261,
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
