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
            },
            {
                address: '3JszuRdFFEz1WbQKam4XjAtnZsYX62RLMX',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: '33uhW878fbvVxZuZ216q2XvgdajLdG4rN4',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: 'bc1p87c2auxxj372evzhd5f5huddtrladtkn3z4p94ew32qvwcsgujestjj45r',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: 'bc1ph2x0wdm7vspgdtzuhhgcsey7ahmhypxgjnwfw0p8fghdp4qrnrrsfjc062',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: 'bc1puqn6dw6etk6yg8zruvf2s94cmhxkfncsaumwhtfhu5qy3e6m94sq37eq66',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: 'bc1pvnh3zy48ml3nhzhqrtc7endhj9rrtrv5puy2775p3jwka8y99aqsz78uu2',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: 'bc1pxpp82hc4t4flkyqtjdnzr3q72qh9st78gfge50vzlrjtp9c6yn4s5zq5vk',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
        ],
        transactionApi: {
            type: 'rpc',
            defaultUrl: 'https://rpc.bitlayer.org',
            defaultCallsPerMinute: 400,
            startBlock: 2505100,
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
