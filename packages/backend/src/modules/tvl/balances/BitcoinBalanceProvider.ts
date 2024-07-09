import { BlockchainClient } from '@l2beat/shared'
import { BalanceRecord } from '../repositories/BalanceRepository'
import { UnixTime, ChainId, EthereumAddress, AssetId } from '@l2beat/shared-pure'
import { BalanceProvider, BalanceQuery } from './BalanceProvider'

export interface BitcoinBalanceQuery {
  address: string
}

type CacheEntry = {
  timestamp: number,
  transactions: any[]
};

export class BitcoinBalanceProvider implements BalanceProvider {
  private cache: Map<string, CacheEntry>;
  private cacheTimeout: number;
  constructor(
    private readonly blockchainClient: BlockchainClient,
  ) {
    this.cache = new Map<string, CacheEntry>();
    this.cacheTimeout = 3600 * 1000; // 缓存超时设置为1小时
  }

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
        const transactions = await this.getCachedAddressTransactions(query.holder.toString(), page*50);
        const balanceAtBlock = this.calculateBalanceAtBlock(transactions, blockHeight);
  
        if (balanceAtBlock !== null) {
          finalBalance = balanceAtBlock;
          break; // 找到指定区块高度的余额后退出循环
        }
        
        hasMorePages = transactions.length > 0; // 假设API在没有更多交易时返回空数组
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

  private async getCachedAddressTransactions(holder: string, offset: number): Promise<any[]> {
    const cacheKey = `${holder}-${offset}`;
    const currentTime = Date.now();

    // 检查缓存是否存在且未超时
    if (this.cache.has(cacheKey)) {
      const cacheEntry = this.cache.get(cacheKey)!;
      if (currentTime - cacheEntry.timestamp < this.cacheTimeout) {
        return cacheEntry.transactions;
      } else {
        this.cache.delete(cacheKey); // 删除超时的缓存
      }
    }

    // 调用实际的API获取数据
    const transactions = await this.blockchainClient.getAddressTransactions(holder, 50, offset);

    // 将结果缓存
    if (offset !== 0) {
      this.cache.set(cacheKey, {
          timestamp: currentTime,
          transactions: transactions.txs
        });
    }

    return transactions.txs;
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
