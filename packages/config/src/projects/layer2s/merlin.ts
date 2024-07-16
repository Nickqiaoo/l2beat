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


export const merlin: Layer2 = {
    type: 'layer2',
    id: ProjectId('merlin'),
    display: {
        name: 'Merlin',
        slug: 'Merlin',
        description:
            'Merlin',
        purposes: ['Universal'],
        category: 'ZK Rollup',
        links: {
            websites: ['https://merlinchain.io/'],
            apps: [
                'https://merlinchain.io/bridge',
            ],
            documentation: ['https://docs.merlinchain.io/'],
            explorers: [
                'https://scan.merlinchain.io/',
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
        name: 'merlin',
        chainId: 4200,
        explorerUrl: 'https://scan.merlinchain.io/',
        explorerApi: {
            url: 'https://scan.merlinchain.io/api',
            type: 'etherscan',
        },
        minTimestampForTvl: new UnixTime(1710000000),
        multicallContracts: [
            {
                address: EthereumAddress('0x46063722c010AF39E465d286B84936A12aFb81F0'),
                batchSize: 150,
                sinceBlock: 11396486,
                version: '3',
            },
        ],
        coingeckoPlatform: 'merlin-chain',
    },
    config: {
        escrows: [
            {
                address: 'bc1qtu66zfqxj6pam6e0zunwnggh87f5pjr7vdr5cd',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1710000000),
                chain: 'btc'
            },
            {
                address: '15zVuow5e9Zwj4nTrxSH3Rvupk32wiKEsr',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1710000000),
                chain: 'btc'
            },
            {
                address: "bc1q4gfsheqz7ll2wdgfwjh2l5hhr45ytc4ekgxaex",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qua5y9yhknpysslxypd4dahagj9jamf90x4v90x",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qm64dsdz853ntzwleqsrdt5p53w75zfrtnmyzcx",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "1EEU18ZvWrbMxdXEuqdii6goDKbAbaXiA1",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "16LDby5cWxzQqTFJrA1DDmbwABumCQHteG",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qq3c6kehun66sdek3q0wmu540n3vg0hgrekkjce",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "124SzTv3bBXZVPz2Li9ADs9oz4zCfT3VmM",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qyqt9zs42qmyf373k7yvy0t3askxd927v304xlv",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qgxdqf7837dxe8xkhvctgc499kwh5xw7ap3uwhs",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1pruhkl5exjt0z824cafauf750f5g08azuvgcjctv0enz5csayaj7ss3j5wc",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1q97vmervc8x9hzr4z4yvzn3x4rk74se6e8x8sgy",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1q2lzqzjcq472x8v0kgdcn4m5y8cq95ysnxm6vemu0qsuqgzyge06sqmqdal",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qcmj5lkumeycyn35lxc3yr32k3fzue87yrjrna6",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1qq76dy32nnk5sha36etg6pdj94vl5zrskavux2f",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "36n825H7orW1u8yWmvR4zs2CWfmkY2rkpK",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
            {
                address: "bc1p35l88j3ashhktg75tjctt6pacrgpyr93ldt7yw484dm4expq073qk4n0a0",
                tokens: ["BTC"],
                sinceTimestamp: new UnixTime(1710000000),
                chain: "btc"
            },
        ],
        transactionApi: {
            type: 'rpc',
            defaultUrl: 'https://rpc.merlinchain.io',
            defaultCallsPerMinute: 400,
            startBlock: 12630847,
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
