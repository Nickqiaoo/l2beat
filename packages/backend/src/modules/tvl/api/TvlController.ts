import { Logger } from '@l2beat/backend-tools'
import { bridges, layer2s } from '@l2beat/config'
import {
  AssetId,
  ChainId,
  Hash256,
  NewCanonicalAssetBreakdownData,
  NewExternalAssetBreakdownData,
  NewNativeAssetBreakdownData,
  ProjectAssetsBreakdownApiResponse,
  NewProjectAssetsBreakdownApiResponse,
  ProjectId,
  ReportType,
  Result,
  Token,
  TokenTvlApiChart,
  TokenTvlApiCharts,
  TvlApiChart,
  TvlApiCharts,
  TvlApiResponse,
  UnixTime,
  cacheAsyncFunction,
  EthereumAddress,
} from '@l2beat/shared-pure'

import { TaskQueue } from '../../../tools/queue/TaskQueue'
import { ReportProject } from '../reports/ReportProject'
import { AggregatedReportRepository } from '../repositories/AggregatedReportRepository'
import { AggregatedReportStatusRepository } from '../repositories/AggregatedReportStatusRepository'
import { BalanceRepository } from '../repositories/BalanceRepository'
import { PriceRepository } from '../repositories/PriceRepository'
import { ReportRepository } from '../repositories/ReportRepository'
import { asNumber } from './asNumber'
import { getProjectAssetChartData } from './charts'
import { generateTvlApiResponse } from './generateTvlApiResponse'
import { getHourlyMinTimestamp } from './getHourlyMinTimestamp'
import { getSixHourlyMinTimestamp } from './getSixHourlyMinTimestamp'
import {
  getCanonicalAssetsBreakdown,
  getNonCanonicalAssetsBreakdown,
  groupAndMergeBreakdowns,
} from './tvl'

interface TvlControllerOptions {
  errorOnUnsyncedTvl: boolean
}

type ProjectAssetBreakdownResult = Result<
  ProjectAssetsBreakdownApiResponse,
  'DATA_NOT_FULLY_SYNCED' | 'NO_DATA'
>

type NewProjectAssetBreakdownResult = Result<
  NewProjectAssetsBreakdownApiResponse,
  'DATA_NOT_FULLY_SYNCED' | 'NO_DATA'
>


export type TvlResult = Result<
  TvlApiResponse,
  'DATA_NOT_FULLY_SYNCED' | 'NO_DATA'
>

export type TokenTvlResult = Result<
  TokenTvlApiCharts,
  'INVALID_PROJECT_OR_ASSET' | 'NO_DATA' | 'DATA_NOT_FULLY_SYNCED'
>

export type AggregatedTvlResult = Result<
  TvlApiCharts,
  'DATA_NOT_FULLY_SYNCED' | 'NO_DATA' | 'EMPTY_SLUG'
>

export class TvlController {
  private readonly taskQueue: TaskQueue<void>

  getCachedTvlApiResponse: () => Promise<TvlResult>

  constructor(
    private readonly aggregatedReportRepository: AggregatedReportRepository,
    private readonly reportRepository: ReportRepository,
    private readonly aggregatedReportStatusRepository: AggregatedReportStatusRepository,
    private readonly balanceRepository: BalanceRepository,
    private readonly priceRepository: PriceRepository,
    private readonly projects: ReportProject[],
    private readonly tokens: Token[],
    private readonly logger: Logger,
    private readonly aggregatedConfigHash: Hash256,
    private readonly options: TvlControllerOptions,
  ) {
    this.logger = this.logger.for(this)

    const cached = cacheAsyncFunction(() => this.getTvlApiResponse())
    this.getCachedTvlApiResponse = cached.call
    this.taskQueue = new TaskQueue(
      cached.refetch,
      this.logger.for('taskQueue'),
      { metricsId: TvlController.name },
    )
  }

  start() {
    this.taskQueue.addToFront()

    const fiveMinutes = 5 * 60 * 1000
    setInterval(() => {
      this.taskQueue.addIfEmpty()
    }, fiveMinutes)
  }

  async getTvlApiResponse(): Promise<TvlResult> {
    const status = await this.getTvlModuleStatus()

    if (!status.latestTimestamp) {
      return {
        type: 'error',
        error: 'NO_DATA',
      }
    }

    if (!status.isSynced && this.options.errorOnUnsyncedTvl) {
      return {
        type: 'error',
        error: 'DATA_NOT_FULLY_SYNCED',
      }
    }

    const [hourlyReports, sixHourlyReports, dailyReports, latestReports] =
      await Promise.all([
        this.aggregatedReportRepository.getHourlyWithAnyType(
          getHourlyMinTimestamp(status.latestTimestamp),
        ),

        this.aggregatedReportRepository.getSixHourlyWithAnyType(
          getSixHourlyMinTimestamp(status.latestTimestamp),
        ),

        this.aggregatedReportRepository.getDailyWithAnyType(),

        this.reportRepository.getByTimestamp(status.latestTimestamp),
      ])

    const projects = []
    for (const project of this.projects) {
      if (project.escrows.length === 0) {
        continue
      }

      const sinceTimestamp = new UnixTime(
        Math.min(
          ...project.escrows.map((escrow) => escrow.sinceTimestamp.toNumber()),
        ),
      )

      projects.push({
        id: project.projectId,
        isLayer2: project.type === 'layer2',
        sinceTimestamp,
      })
    }

    const tvlApiResponse = generateTvlApiResponse(
      hourlyReports,
      sixHourlyReports,
      dailyReports,
      latestReports,
      projects,
      status.latestTimestamp,
    )

    return { type: 'success', data: tvlApiResponse }
  }

  async getAggregatedTvlApiResponse(
    slugs: string[],
  ): Promise<AggregatedTvlResult> {
    console.time('[Aggregate endpoint]: setup')

    const projectIdsFilter = [...layer2s, ...bridges]
      .filter((project) => !project.isUpcoming)
      .filter((project) => slugs.includes(project.display.slug))
      .map((project) => project.id)

    if (projectIdsFilter.length === 0) {
      return {
        type: 'error',
        error: 'EMPTY_SLUG',
      }
    }

    const status = await this.getTvlModuleStatus()

    if (!status.latestTimestamp) {
      return {
        type: 'error',
        error: 'NO_DATA',
      }
    }

    if (!status.isSynced && this.options.errorOnUnsyncedTvl) {
      return {
        type: 'error',
        error: 'DATA_NOT_FULLY_SYNCED',
      }
    }
    console.timeEnd('[Aggregate endpoint]: setup')

    console.time('[Aggregate endpoint]: database')
    const [hourlyReports, sixHourlyReports, dailyReports] = await Promise.all([
      this.aggregatedReportRepository.getAggregateHourly(
        projectIdsFilter,
        getHourlyMinTimestamp(status.latestTimestamp),
      ),
      this.aggregatedReportRepository.getAggregateSixHourly(
        projectIdsFilter,
        getSixHourlyMinTimestamp(status.latestTimestamp),
      ),
      this.aggregatedReportRepository.getAggregateDaily(projectIdsFilter),
    ])
    console.timeEnd('[Aggregate endpoint]: database')

    console.time('[Aggregate endpoint]: aggregation')

    const data: TvlApiCharts = {
      hourly: aggregateRecordsToResponse(hourlyReports),
      sixHourly: aggregateRecordsToResponse(sixHourlyReports),
      daily: aggregateRecordsToResponse(dailyReports),
    }

    console.timeEnd('[Aggregate endpoint]: aggregation')

    return {
      type: 'success',
      data,
    }
  }

  async getAssetTvlApiResponse(
    projectId: ProjectId,
    chainId: ChainId,
    assetId: AssetId,
    assetType: ReportType,
  ): Promise<TokenTvlResult> {
    const asset = this.tokens.find((t) => t.id === assetId)
    const project = this.projects.find((p) => p.projectId === projectId)

    if (!asset || !project) {
      return {
        type: 'error',
        error: 'INVALID_PROJECT_OR_ASSET',
      }
    }

    const status = await this.getTvlModuleStatus()

    if (!status.latestTimestamp) {
      return {
        type: 'error',
        error: 'NO_DATA',
      }
    }

    if (!status.isSynced && this.options.errorOnUnsyncedTvl) {
      return {
        type: 'error',
        error: 'DATA_NOT_FULLY_SYNCED',
      }
    }

    const [hourlyReports, sixHourlyReports, dailyReports] = await Promise.all([
      this.reportRepository.getHourly(
        projectId,
        chainId,
        assetId,
        assetType,
        getHourlyMinTimestamp(status.latestTimestamp),
      ),
      this.reportRepository.getSixHourly(
        projectId,
        chainId,
        assetId,
        assetType,
        getSixHourlyMinTimestamp(status.latestTimestamp),
      ),
      this.reportRepository.getDaily(projectId, chainId, assetId, assetType),
    ])
    const assetSymbol = asset.symbol.toLowerCase()

    const types: TokenTvlApiChart['types'] = ['timestamp', assetSymbol, 'usd']

    return {
      type: 'success',
      data: {
        hourly: {
          types,
          data: getProjectAssetChartData(hourlyReports, asset.decimals, 1),
        },
        sixHourly: {
          types,
          data: getProjectAssetChartData(sixHourlyReports, asset.decimals, 6),
        },
        daily: {
          types,
          data: getProjectAssetChartData(dailyReports, asset.decimals, 24),
        },
      },
    }
  }

  async getProjectTokenBreakdownApiResponse(): Promise<NewProjectAssetBreakdownResult> {
    const status = await this.getTvlModuleStatus()

    if (!status.latestTimestamp) {
      return {
        type: 'error',
        error: 'NO_DATA',
      }
    }

    if (!status.isSynced && this.options.errorOnUnsyncedTvl) {
      return {
        type: 'error',
        error: 'DATA_NOT_FULLY_SYNCED',
      }
    }

    const [latestReports, balances, prices] = await Promise.all([
      this.reportRepository.getByTimestamp(status.latestTimestamp),
      this.balanceRepository.getByTimestamp(status.latestTimestamp),
      this.priceRepository.getByTimestamp(status.latestTimestamp),
    ])

    const externalAssetsBreakdown = getNonCanonicalAssetsBreakdown(this.logger)(
      latestReports,
      this.tokens,
      'EBV',
    )

    const nativeAssetsBreakdown = getNonCanonicalAssetsBreakdown(this.logger)(
      latestReports,
      this.tokens,
      'NMV',
    )

    const canonicalAssetsBreakdown = getCanonicalAssetsBreakdown(this.logger)(
      balances,
      prices,
      this.projects,
    )

    const breakdowns = groupAndMergeBreakdowns(this.projects, {
      external: externalAssetsBreakdown,
      native: nativeAssetsBreakdown,
      canonical: canonicalAssetsBreakdown,
    })
    const newBreakdowns = this.processBreakdowns(breakdowns, this.projects, this.tokens)

    return {
      type: 'success',
      data: {
        dataTimestamp: status.latestTimestamp,
        breakdowns: newBreakdowns,
      },
    }
  }

  private processBreakdowns(
    breakdowns: ProjectAssetsBreakdownApiResponse['breakdowns'],
    projects: ReportProject[],
    tokens: Token[]
  ): NewProjectAssetsBreakdownApiResponse['breakdowns'] {
    // 创建 assetId 到 iconUrl 的映射
    const tokenMap: Record<string, string> = {};
    tokens.forEach(token => {
      tokenMap[token.id.toString()] = token.iconUrl ?? "";
    });

    // 创建 chainId 到 explorerUrl 和 address 的映射
    const contractMap: Record<number, string> = {};
    projects.forEach(project => {
      const conf = project.chainConfig;
      contractMap[project.chainConfig?.chainId as number] = `${conf?.explorerUrl}address/`;
    });
    const newBreakdowns: NewProjectAssetsBreakdownApiResponse['breakdowns'] = {};
    // 处理 breakdowns 数据
    for (const key in breakdowns) {
      const breakdown = breakdowns[key];
      newBreakdowns[key] = {
        canonical: breakdown.canonical.map(item => ({
          ...item,
          image: tokenMap[item.assetId.toString()],
          escrows: item.escrows.map(escrow => (
            {
              usdValue: escrow.usdValue,
              amount:escrow.amount,
              escrowAddress: this.getAddress(item.chainId, escrow.escrowAddress),
              contract: this.getContract(item.chainId, escrow.escrowAddress)
            }))
        })),
        external: breakdown.external.map(item => ({
          ...item,
          image: tokenMap[item.assetId.toString()],
          contract: contractMap[item.chainId as unknown as number] + item.tokenAddress
        })),
        native: breakdown.native.map(item => ({
          ...item,
          image: tokenMap[item.assetId.toString()],
          contract: contractMap[item.chainId as unknown as number] + item.tokenAddress
        }))
      };
    }

    return newBreakdowns;
  }
  private getContract(chainid:ChainId, escrowAddress: string | EthereumAddress):string{
    switch (chainid) {
      case ChainId.ETHEREUM:
        return "https://etherscan.io/address/" + escrowAddress;
      case ChainId.BITCOIN:
        if (escrowAddress.startsWith("defillama")){
          switch (escrowAddress.toString().split(':')[1]){
            case "lightning-network":
              return "https://mempool.space/lightning"; 
            case "ckbtc":
              return "https://dashboard.internetcomputer.org/bitcoin";
          }
        }
        return "https://www.blockchain.com/explorer/addresses/btc/" + escrowAddress;
      default:
        return "";
    }
  }

  private getAddress(chainid:ChainId, escrowAddress: string | EthereumAddress):string | EthereumAddress{
    switch (chainid) {
      case ChainId.ETHEREUM:
        return  escrowAddress;
      case ChainId.BITCOIN:
        if (escrowAddress.startsWith("defillama")){
          return "- -"
        }else {
          return escrowAddress
        }
      default:
        return "- -";
    }
  }

  private async getTvlModuleStatus() {
    const { matching: syncedReportsAmount, different: unsyncedReportsAmount } =
      await this.aggregatedReportStatusRepository.findCountsForHash(
        this.aggregatedConfigHash,
      )

    const latestTimestamp =
      await this.aggregatedReportStatusRepository.findLatestTimestamp()

    const isSynced = unsyncedReportsAmount === 0

    const result = {
      syncedReportsAmount,
      unsyncedReportsAmount,
      isSynced,
      latestTimestamp,
    }

    return result
  }
}

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

function aggregateRecordsToResponse(
  hourlyReports: {
    timestamp: UnixTime
    cbvUsdValue: bigint
    cbvEthValue: bigint
    ebvUsdValue: bigint
    ebvEthValue: bigint
    nmvUsdValue: bigint
    nmvEthValue: bigint
    tvlUsdValue: bigint
    tvlEthValue: bigint
    btcUsdValue: bigint
  }[],
): TvlApiChart {
  return {
    types: TYPE_LABELS,
    data: hourlyReports.map((report) => [
      report.timestamp,
      asNumber(report.tvlUsdValue, 2),
      asNumber(report.cbvUsdValue, 2),
      asNumber(report.ebvUsdValue, 2),
      asNumber(report.nmvUsdValue, 2),
      asNumber(report.tvlEthValue, 6),
      asNumber(report.cbvEthValue, 6),
      asNumber(report.ebvEthValue, 6),
      asNumber(report.nmvEthValue, 6),
      asNumber(report.btcUsdValue, 2),
    ]),
  }
}
