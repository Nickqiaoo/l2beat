import { BlockchainClient } from '@l2beat/shared'
import { BalanceRecord } from '../repositories/BalanceRepository'
import { UnixTime, ChainId, EthereumAddress, AssetId } from '@l2beat/shared-pure'
import { BalanceProvider, BalanceQuery } from './BalanceProvider'

export interface BitcoinBalanceQuery {
  address: string
}

export class BitcoinBalanceProvider implements BalanceProvider {
  constructor(
    private readonly blockchainClient: BlockchainClient,
  ) {}

  public getChainId(): ChainId {
    return ChainId(0)
  }

  public async fetchBalances(
    balanceQueries: BalanceQuery[],
    timestamp: UnixTime,
    blockHeight: number,
  ): Promise<BalanceRecord[]> {
    const balances: BalanceRecord[] = []

    for (const query of balanceQueries) {
      let page = 0;
      let hasMorePages = true;
      let finalBalance = 0;
  
      while (hasMorePages) {
        const transactions = await this.blockchainClient.getAddressTransactions(query.holder.toString(), 50, page*50);
        const balanceAtBlock = this.calculateBalanceAtBlock(transactions.txs, blockHeight);
  
        if (balanceAtBlock !== null) {
          finalBalance = balanceAtBlock;
          break; // 找到指定区块高度的余额后退出循环
        }
  
        hasMorePages = transactions.txs.length > 0; // 假设API在没有更多交易时返回空数组
        page++;
      }
  
      balances.push({
        assetId: AssetId('btc-bitcoin'),
        timestamp,
        holderAddress: query.holder,
        chainId: ChainId(0),
        balance: BigInt(finalBalance),
      });
    }
  

    return balances
  }

  private calculateBalanceAtBlock(txs: any[], blockHeight: number): number | null {
    for (const tx of txs) {
      if (tx.block_height <= blockHeight && tx.block_height != null) {
        return tx.balance; // 使用交易中的balance字段
      }
    }
  
    return null; // 如果没有找到合适的交易，返回null
  }
}
