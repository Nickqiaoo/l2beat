import z from 'zod'

import { UnixTime } from '../UnixTime'
import { branded } from '../branded'

export const ActivityApiChartPoint = z.tuple([
  branded(z.number(), (n) => new UnixTime(n)),
  z.number().int(),
  z.number().int(),
  z.number().int(),
])
export type ActivityApiChartPoint = z.infer<typeof ActivityApiChartPoint>

export const ActivityApiChart = z.object({
  types: z.tuple([
    z.literal('timestamp'),
    z.literal('transactions'),
    z.literal('ethereumTransactions'),
    z.literal('tps'),
  ]),
  data: z.array(ActivityApiChartPoint),
})
export type ActivityApiChart = z.infer<typeof ActivityApiChart>

export const ActivityApiCharts = z.object({
  daily: ActivityApiChart,
  summary:z.object({
    tps:  z.number(),
    change: z.number(),
    max_day: z.string()
  }),
})
export type ActivityApiCharts = z.infer<typeof ActivityApiCharts>

export const ActivityApiChartsWithEstimation = z.object({
  daily: ActivityApiChart,
  estimatedSince: branded(z.number(), (n) => new UnixTime(n)),
  estimatedImpact: z.number(),
})
export type ActivityApiChartsWithEstimation = z.infer<
  typeof ActivityApiChartsWithEstimation
>

export const ActivityApiResponse = z.object({
  combined: ActivityApiChartsWithEstimation,
  projects: z.record(z.string(), z.optional(ActivityApiCharts)),
})
export type ActivityApiResponse = z.infer<typeof ActivityApiResponse>
