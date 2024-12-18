import z from 'zod'

import { AssetId } from '../AssetId'
import { AssetType } from '../AssetType'
import { ChainId } from '../ChainId'
import { EthereumAddress } from '../EthereumAddress'
import { UnixTime } from '../UnixTime'
import { branded } from '../branded'

const TvlApiChartPoint = z.tuple([
  branded(z.number(), (n) => new UnixTime(n)),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
])
export type TvlApiChartPoint = z.infer<typeof TvlApiChartPoint>

const TvlApiChart = z.object({
  types: z.tuple([
    z.literal('timestamp'),
    z.literal('valueUsd'),
    z.literal('cbvUsd'),
    z.literal('ebvUsd'),
    z.literal('nmvUsd'),
    z.literal('valueEth'),
    z.literal('cbvEth'),
    z.literal('ebvEth'),
    z.literal('nmvEth'),
    z.literal('btcUsd'),
  ]),
  data: z.array(TvlApiChartPoint),
})
export type TvlApiChart = z.infer<typeof TvlApiChart>

export const TvlApiCharts = z.object({
  hourly: TvlApiChart,
  sixHourly: TvlApiChart,
  daily: TvlApiChart,
})
export type TvlApiCharts = z.infer<typeof TvlApiCharts>

export const TvlApiToken = z.object({
  assetId: branded(z.string(), AssetId),
  chainId: branded(z.number(), ChainId),
  // TODO(L2B-5614): Make both required
  address: z.string().optional(),
  chain: z.string().optional(),
  assetType: branded(z.string(), AssetType),
  usdValue: z.number(),
})

export type TvlApiToken = z.infer<typeof TvlApiToken>

export const TvlApiProject = z.object({
  tokens: z.object({
    CBV: z.array(TvlApiToken),
    EBV: z.array(TvlApiToken),
    NMV: z.array(TvlApiToken),
  }),
  charts: TvlApiCharts,
  summary:z.object({
    tvl:  z.number(),
    change:  z.number(),
    canonical_tvl:  z.number(),
    canonical_perc:  z.number(),
    external_tvl:  z.number(),
    external_perc:  z.number(),
    native_tvl:  z.number(),
    native_perc:  z.number(),
    btc_perc:  z.number(),
    stable_perc:  z.number(),
    other_perc:  z.number(),
  }),
})
export type TvlApiProject = z.infer<typeof TvlApiProject>

export const TvlApiResponse = z.object({
  //bridges: TvlApiCharts,
  layers2s: TvlApiCharts,
  //combined: TvlApiCharts,
  projects: z.record(z.string(), TvlApiProject.optional()),
})
export type TvlApiResponse = z.infer<typeof TvlApiResponse>

const BaseAssetBreakdownData = z.object({
  assetId: branded(z.string(), AssetId),
  chainId: branded(z.number(), ChainId),
  amount: z.string(),
  usdValue: z.string(),
  usdPrice: z.string(),
})

export const CanonicalAssetBreakdownData = BaseAssetBreakdownData.extend({
  escrows: z.array(
    z.object({
      amount: z.string(),
      usdValue: z.string(),
      escrowAddress: z.union([branded(z.string(), EthereumAddress), z.string()]),
    }),
  ),
})

export type CanonicalAssetBreakdownData = z.infer<
  typeof CanonicalAssetBreakdownData
>

export const ExternalAssetBreakdownData = BaseAssetBreakdownData.extend({
  tokenAddress: z.optional(branded(z.string(), EthereumAddress)),
})

export type ExternalAssetBreakdownData = z.infer<
  typeof ExternalAssetBreakdownData
>

export const NativeAssetBreakdownData = BaseAssetBreakdownData.extend({
  tokenAddress: z.optional(branded(z.string(), EthereumAddress)),
})

export type NativeAssetBreakdownData = z.infer<typeof NativeAssetBreakdownData>

export const ProjectAssetsBreakdownApiResponse = z.object({
  dataTimestamp: branded(z.number(), (n) => new UnixTime(n)),
  breakdowns: z.record(
    z.string(), // Project Id
    z.object({
      // escrow -> asset[]
      canonical: z.array(CanonicalAssetBreakdownData),
      external: z.array(ExternalAssetBreakdownData),
      native: z.array(NativeAssetBreakdownData),
    }),
  ),
})

export type ProjectAssetsBreakdownApiResponse = z.infer<
  typeof ProjectAssetsBreakdownApiResponse
>


export const NewCanonicalAssetBreakdownData = BaseAssetBreakdownData.extend({
  image: z.string(),
  escrows: z.array(
    z.object({
      amount: z.string(),
      usdValue: z.string(),
      escrowAddress: z.union([branded(z.string(), EthereumAddress), z.string()]),
      contract: z.string(),
    }),
  ),
})

export type NewCanonicalAssetBreakdownData = z.infer<
  typeof NewCanonicalAssetBreakdownData
>

export const NewExternalAssetBreakdownData = BaseAssetBreakdownData.extend({
  image: z.string(),
  contract: z.string(),
  tokenAddress: z.optional(branded(z.string(), EthereumAddress)),
})

export type NewExternalAssetBreakdownData = z.infer<
  typeof NewExternalAssetBreakdownData
>

export const NewNativeAssetBreakdownData = BaseAssetBreakdownData.extend({
  image: z.string(),
  contract: z.string(),
  tokenAddress: z.optional(branded(z.string(), EthereumAddress)),
})

export type NewNativeAssetBreakdownData = z.infer<typeof NewNativeAssetBreakdownData>

export const NewProjectAssetsBreakdownApiResponse = z.object({
  dataTimestamp: branded(z.number(), (n) => new UnixTime(n)),
  breakdowns: z.record(
    z.string(), // Project Id
    z.object({
      // escrow -> asset[]
      canonical: z.array(NewCanonicalAssetBreakdownData),
      external: z.array(NewExternalAssetBreakdownData),
      native: z.array(NewNativeAssetBreakdownData),
    }),
  ),
})

export type NewProjectAssetsBreakdownApiResponse = z.infer<
  typeof NewProjectAssetsBreakdownApiResponse
>