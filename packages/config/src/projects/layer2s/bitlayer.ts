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
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'

const discovery = new ProjectDiscovery('bitlayer')

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
                address: '32a7u8tM45GPSdjzy7PbRvuncEvHFxnYR4',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1712247832),
                chain: 'btc'
            },
            {
                address: '3D3a4fPJ5HKw43Qd6QHtoJ6RvMUL7UBDT5',
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
            {
                address: '18vdapRrE6R2qv6hEjW7gAWR6XjfMo1zUA',
                tokens:['BTC'],
                sinceTimestamp: new UnixTime(1718886413),
                chain: 'btc'
            },
            discovery.getEscrowDetails({
                // Custom ERC20 Gateway
                address: EthereumAddress('0xA4252F2A68b2A078c86E0569eB7Fb872A37864AF'),
                tokens: ['USDT','ETH','USDC','wstETH'],
                description:
                  'Main entry point for users depositing ERC20 tokens that require minting custom token on L2.',
              }),
            discovery.getEscrowDetails({
                // Custom ERC20 Gateway
                address: EthereumAddress('0x3111653DB0e7094b111b8e435Df9193b62C2C576'),
                tokens: ['USDT','STONE','USDC'],
                description:
                  'Main entry point for users depositing ERC20 tokens that require minting custom token on L2.',
              }),
              {
                address: EthereumAddress('0x92221E8Bc4E1D9a3E5D1cC39A524E90Cd4bdF8b1'),
                sinceTimestamp: new UnixTime(1714533203),
                tokens: ['USDT'],
              },
              {
                address: EthereumAddress('0x0CA2a8900b8140E1e70dc96F32857732f5F67B31'),
                sinceTimestamp: new UnixTime(1716371375),
                tokens: ['ETH'],
              },
              {
                address: EthereumAddress('0x6bc2b644A0D124F1e5dDf5a9BDd922e65a961343'),
                sinceTimestamp: new UnixTime(1716372959),
                tokens: ['USDT'],
              },
              {
                address: EthereumAddress('0x6ac1108461189F1569e1D4dEdc9940a0395d3423'),
                sinceTimestamp: new UnixTime(1721635055),
                tokens: ['wstETH'],
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
