import {
  ProjectId,
  TvlApiChart,
  TvlApiChartPoint,
  TvlApiCharts,
  TvlApiProject,
  TvlApiResponse,
  UnixTime,
} from '@l2beat/shared-pure'

import { AggregatedReportRecord } from '../repositories/AggregatedReportRepository'
import { ReportRecord } from '../repositories/ReportRepository'
import { asNumber } from './asNumber'
import { getProjectTokensCharts, groupByProjectIdAndAssetType } from './tvl'
import { number } from 'zod'

export const TYPE_LABELS: TvlApiChart['types'] = [
  'timestamp',
  'valueUsd',
  'cbvUsd',
  'ebvUsd',
  'nmvUsd',
  'valueEth',
  'cbvEth',
  'ebvEth',
  'nmvEth',
  'btcUsd',
]

const USD_INDEX = {
  TVL: 1,
  CBV: 2,
  EBV: 3,
  NMV: 4,
}

const ETH_INDEX = {
  TVL: 5,
  CBV: 6,
  EBV: 7,
  NMV: 8,
}

const BTC_INDEX = {
  BTC: 9,
}

const PERIODS = [
  ['hourly', 60 * 60],
  ['sixHourly', 6 * 60 * 60],
  ['daily', 24 * 60 * 60],
] as const

export function generateTvlApiResponse(
  hourlyReports: AggregatedReportRecord[],
  sixHourlyReports: AggregatedReportRecord[],
  dailyReports: AggregatedReportRecord[],
  latestReports: ReportRecord[],
  projects: { id: ProjectId; isLayer2: boolean; sinceTimestamp: UnixTime }[],
  untilTimestamp: UnixTime,
): TvlApiResponse {
  const charts = new Map<ProjectId, TvlApiCharts>()

  const extendedProjects = getExtendedProjects(projects, untilTimestamp)

  for (const { id, sinceTimestamp } of extendedProjects.concat(projects)) {
    charts.set(id, {
      hourly: {
        types: TYPE_LABELS,
        data: generateZeroes(
          UnixTime.max(
            sinceTimestamp,
            untilTimestamp.add(-7, 'days').add(1, 'hours'),
          ),
          untilTimestamp,
          1,
        ),
      },
      sixHourly: {
        types: TYPE_LABELS,
        data: generateZeroes(
          UnixTime.max(
            sinceTimestamp,
            untilTimestamp.add(-30, 'days').add(6, 'hours'),
          ),
          untilTimestamp,
          6,
        ),
      },
      daily: {
        types: TYPE_LABELS,
        data: generateZeroes(sinceTimestamp, untilTimestamp, 24),
      },
    })
  }

  fillCharts(charts, hourlyReports, sixHourlyReports, dailyReports)

  const groupedLatestReports = groupByProjectIdAndAssetType(latestReports)
  const projectsResult = projects.reduce<TvlApiResponse['projects']>(
    (acc, project) => {
      acc[project.id.toString()] = {
        // biome-ignore lint/style/noNonNullAssertion: we know it's there
        charts: charts.get(project.id)!,
        tokens: getProjectTokensCharts(groupedLatestReports, project.id),
        summary: {
          tvl: 0,
          change: 0,
          canonical_tvl: 0,
          canonical_perc: 0,
          external_tvl: 0,
          external_perc: 0,
          native_tvl: 0,
          native_perc: 0,
          btc_perc: 0,
          stable_perc: 0,
          other_perc: 0
        }
      }
      return acc
    },
    {},
  )
  Object.keys(projectsResult).forEach((key) => {
    const project = projectsResult[key];
    if (project) {
      calculateSummary(project);
      calculateChange(project);
    }
  });

  return {
    // biome-ignore lint/style/noNonNullAssertion: we know it's there
    layers2s: charts.get(ProjectId.LAYER2S)!,
    // biome-ignore lint/style/noNonNullAssertion: we know it's there
    // bridges: charts.get(ProjectId.BRIDGES)!,
    // biome-ignore lint/style/noNonNullAssertion: we know it's there
    // combined: charts.get(ProjectId.ALL)!,
    projects: projectsResult,
  }
}

function calculateChange(project: TvlApiProject) {
  const len = project.charts.daily.data.length
  var today = project.charts.daily.data[len-1][1]
  var last = project.charts.daily.data[len-8][1]
  project.summary.change = parseFloat(((today - last) / last * 100).toFixed(2));
}

function calculateSummary(project: TvlApiProject) {
  const cbvTotal = project.tokens.CBV.reduce((sum, token) => sum + token.usdValue, 0);
  const ebvTotal = project.tokens.EBV.reduce((sum, token) => sum + token.usdValue, 0);
  const nmvTotal = project.tokens.NMV.reduce((sum, token) => sum + token.usdValue, 0);
  const tvl = cbvTotal + ebvTotal + nmvTotal;

  const btcTotal = project.tokens.CBV
    .filter(token => token.assetId.includes('btc'))
    .reduce((sum, token) => sum + token.usdValue, 0);

  const stableTotal = project.tokens.EBV.concat(project.tokens.NMV, project.tokens.CBV)
    .filter(token => token.assetId.includes('usdt') || token.assetId.includes('usdc'))
    .reduce((sum, token) => sum + token.usdValue, 0);

  const otherTotal = tvl - btcTotal - stableTotal;
  project.summary.tvl = tvl;
  project.summary.canonical_tvl = parseFloat(cbvTotal.toFixed(2));
  project.summary.canonical_perc = parseFloat((cbvTotal / tvl * 100).toFixed(2));
  project.summary.external_tvl = parseFloat(ebvTotal.toFixed(2));
  project.summary.external_perc =  parseFloat((ebvTotal / tvl * 100).toFixed(2));
  project.summary.native_tvl = parseFloat(nmvTotal.toFixed(2));
  project.summary.native_perc =  parseFloat((nmvTotal / tvl * 100).toFixed(2));
  project.summary.btc_perc =  parseFloat((btcTotal / tvl * 100).toFixed(2));
  project.summary.stable_perc =  parseFloat((stableTotal / tvl * 100).toFixed(2));
  project.summary.other_perc =  parseFloat((otherTotal / tvl * 100).toFixed(2));
}

function fillCharts(
  charts: Map<ProjectId, TvlApiCharts>,
  hourlyReports: AggregatedReportRecord[],
  sixHourlyReports: AggregatedReportRecord[],
  dailyReports: AggregatedReportRecord[],
) {
  const reports = {
    hourly: hourlyReports,
    sixHourly: sixHourlyReports,
    daily: dailyReports,
  }

  for (const [period, singleOffset] of PERIODS) {
    for (const report of reports[period]) {
      const apiCharts = charts.get(report.projectId)
      if (!apiCharts) {
        continue
      }

      const minTimestamp = apiCharts[period].data[0][0]
      const index =
        (report.timestamp.toNumber() - minTimestamp.toNumber()) / singleOffset

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= apiCharts[period].data.length
      ) {
        continue
      }

      const point = apiCharts[period].data[index]
      if (report.reportType == "BTC"){
        point[BTC_INDEX[report.reportType]] = asNumber(report.usdValue, 2)
      }else {
        point[USD_INDEX[report.reportType]] = asNumber(report.usdValue, 2)
        point[ETH_INDEX[report.reportType]] = asNumber(report.ethValue, 6)
      }
    }
  }
}

function getExtendedProjects(
  projects: { id: ProjectId; isLayer2: boolean; sinceTimestamp: UnixTime }[],
  untilTimestamp: UnixTime,
) {
  const minLayer2Timestamp = projects
    .filter((p) => p.isLayer2)
    .map((x) => x.sinceTimestamp)
    .reduce((min, current) => UnixTime.min(min, current), untilTimestamp)

  const minBridgeTimestamp = projects
    .filter((p) => !p.isLayer2)
    .map((x) => x.sinceTimestamp)
    .reduce((min, current) => UnixTime.min(min, current), untilTimestamp)

  const minTimestamp = UnixTime.min(minLayer2Timestamp, minBridgeTimestamp)

  return [
    { id: ProjectId.LAYER2S, sinceTimestamp: minLayer2Timestamp },
    { id: ProjectId.BRIDGES, sinceTimestamp: minBridgeTimestamp },
    { id: ProjectId.ALL, sinceTimestamp: minTimestamp },
  ]
}

function generateZeroes(
  since: UnixTime,
  until: UnixTime,
  offsetHours: number,
): TvlApiChartPoint[] {
  const adjusted = new UnixTime(
    since.toNumber() - (since.toNumber() % (offsetHours * 60 * 60)),
  )

  const zeroes: TvlApiChartPoint[] = []
  for (
    let timestamp = adjusted;
    timestamp.lte(until);
    timestamp = timestamp.add(offsetHours, 'hours')
  ) {
    zeroes.push([timestamp, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  }
  return zeroes
}
