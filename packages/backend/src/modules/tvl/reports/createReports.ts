import { assert, AssetId, ChainId, ReportType, UnixTime } from '@l2beat/shared-pure'

import { BalanceRecord } from '../repositories/BalanceRepository'
import { PriceRecord } from '../repositories/PriceRepository'
import { ReportRecord } from '../repositories/ReportRepository'
import { ReportProject } from './ReportProject'
import { BalancePerProject, createReport } from './createReport'

export function createReports(
  prices: PriceRecord[],
  balances: BalanceRecord[],
  projects: ReportProject[],
  chainId: ChainId,
): ReportRecord[] {
  const priceMap = new Map(prices.map((p) => [p.assetId, p]))
  const ethPrice = priceMap.get(AssetId.ETH)?.priceUsd

  if (!ethPrice) {
    return []
  }

  const balancesPerProject = aggregateBalancesPerProject(
    projects,
    balances,
    chainId,
  )

  const reports: ReportRecord[] = []
  for (const balance of balancesPerProject) {
    const price = priceMap.get(balance.assetId)
    if (!price) {
      continue
    }
    reports.push(createReport(price, balance, ethPrice))
    if (balance.assetId === AssetId.BTC || balance.assetId === AssetId.WBTC || balance.assetId === AssetId.TBTC) {
      const btcBalance = { ...balance, type: ReportType("BTC") };
      reports.push(createReport(price, btcBalance, ethPrice));
    }
  }

  return reports
}

export interface TokenDetails {
  decimals: number
  sinceTimestamp: UnixTime
}

export function aggregateBalancesPerProject(
  projects: ReportProject[],
  balances: BalanceRecord[],
  chainId: ChainId,
): BalancePerProject[] {
  const balancesPerProject: BalancePerProject[] = []

  for (const { projectId, escrows } of projects) {
    const projectBalances = balances.filter((balance) =>
      escrows.some(
        (escrow) =>
          escrow.address === balance.holderAddress &&
          escrow.sinceTimestamp.lte(balance.timestamp),
      ),
    )

    const assets = new Map<AssetId, TokenDetails>()
    for (const escrow of escrows) {
      for (const token of escrow.tokens) {
        assets.set(token.id, {
          decimals: token.decimals,
          sinceTimestamp: token.sinceTimestamp,
        })
      }
    }

    for (const [assetId, { decimals, sinceTimestamp }] of assets) {
      const assetBalances = projectBalances.filter(
        (balance) =>
          balance.assetId === assetId && balance.timestamp.gte(sinceTimestamp),
      )

      const chainIdsMatch = assetBalances.every((b) => b.chainId === chainId)
      assert(chainIdsMatch, 'ChainIds do not match for a given asset balanace')

      balancesPerProject.push({
        projectId,
        chainId: chainId,
        balance: assetBalances.reduce((acc, { balance }) => acc + balance, 0n),
        assetId: assetId,
        type: 'CBV',
        decimals,
      })
    }
  }

  return balancesPerProject
}
