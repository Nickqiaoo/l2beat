import { BalanceInfo, BlockchainClient } from '@l2beat/shared'
import { BalanceRecord } from '../repositories/BalanceRepository'
import { UnixTime, ChainId, EthereumAddress, AssetId } from '@l2beat/shared-pure'
import { BalanceProvider, BalanceQuery } from './BalanceProvider'

export interface BitcoinBalanceQuery {
  address: string
}

type CacheEntry = {
  timestamp: number,
  data: any
};

export class BitcoinBalanceProvider implements BalanceProvider {
  private cache: Map<string, CacheEntry>;
  private defiLlamaCache: Map<string, BalanceInfo[]>;
  private cacheTimeout: number;

  constructor(
    private readonly blockchainClient: BlockchainClient,
  ) {
    this.cache = new Map<string, CacheEntry>();
    this.defiLlamaCache = new Map<string, BalanceInfo[]>();
    this.cacheTimeout = 3600;
    this.getDefiLlamaCache().then(data => {
      this.defiLlamaCache = data;
    });
  }

  public getChainId(): ChainId {
    return ChainId(0)
  }

  async getDefiLlamaCache(): Promise<Map<string, BalanceInfo[]>> {
    const cache = new Map<string, BalanceInfo[]>()
    const protocols = ['lightning-network', 'ckbtc'];

    for (const protocol of protocols) {
      if (!cache.has(protocol)) {
        const defiLlamaBalances = await this.blockchainClient.getDefiLlamaProtocol(protocol);
        if (defiLlamaBalances.length === 0) {
          console.error(`No DeFi Llama balance found for protocol ${protocol}`);
          process.exit(1); // 直接终止进程
        }
        cache.set(protocol, defiLlamaBalances);
      }
    }
    return cache
  }


  async fetchDefiLlamaBalances(
    balanceQueries: BalanceQuery[],
    timestamp: UnixTime,
    blockHeight: number,
  ): Promise<BalanceRecord[]> {
    const balances: BalanceRecord[] = [];
    for (const query of balanceQueries) {
      const protocol = query.holder.toString().split(':')[1];
      const protocolCache = this.defiLlamaCache.get(protocol);

      if (protocolCache) {
        //当前时间比缓存里最大的时间要大，直接请求一次接口取最新的数据
        if (protocolCache[protocolCache.length - 1].time < timestamp) {
          try {
            const defiLlamaBalances = await this.blockchainClient.getDefiLlamaProtocol(protocol);
            if (defiLlamaBalances.length > 0) {
              balances.push({
                assetId: AssetId('btc-bitcoin'),
                timestamp,
                holderAddress: query.holder,
                chainId: ChainId(0),
                balance: this.toBigInt(defiLlamaBalances[defiLlamaBalances.length - 1].balance),
              });
            }
          } catch (error) {
            console.error(`Error fetching DeFi Llama balance for protocol ${protocol}:`, error);
          }
        } else {
          for (let i = protocolCache.length - 1; i >= 0; i--) {
            const balance = protocolCache[i];
            if (balance.time <= timestamp) {
              balances.push({
                assetId: AssetId('btc-bitcoin'),
                timestamp,
                holderAddress: query.holder,
                chainId: ChainId(0),
                balance: this.toBigInt(balance.balance),
              });
              break; // 找到就退出循环
            }
          }
        }
      } else {
        console.error(`No DeFi Llama balance found for protocol ${protocol} at timestamp ${timestamp.toNumber()}`);
      }
    }

    return balances;
  }
  public toBigInt(num: number): bigint {
    const [integerPart, fractionalPart] = num.toString().split(".");
    const fractionalPartPadded = (fractionalPart + "0".repeat(8)).slice(0, 8);

    return BigInt(integerPart + fractionalPartPadded);
  }

  public async fetchBalances(
    balanceQueries: BalanceQuery[],
    timestamp: UnixTime,
    blockHeight: number,
  ): Promise<BalanceRecord[]> {
    const [normalQueries, defiLlamaQueries] = balanceQueries.reduce(
      (acc, query) => {
        if (query.holder.toString().startsWith('defillama')) {
          acc[1].push(query);
        } else {
          acc[0].push(query);
        }
        return acc;
      },
      [[], []] as [BalanceQuery[], BalanceQuery[]]
    );

    const normalBalances = await this.fetchNormalBalances(normalQueries, timestamp, blockHeight);
    const defiLlamaBalances = await this.fetchDefiLlamaBalances(defiLlamaQueries, timestamp, blockHeight);

    return [...normalBalances, ...defiLlamaBalances];
  }

  async getBalanceNow(addr: string): Promise<number> {
    const cacheKey = addr;
    const currentTime = Date.now();

    // 检查缓存是否存在且未超时
    if (this.cache.has(cacheKey)) {
      const cacheEntry = this.cache.get(cacheKey)!;
      if (currentTime - cacheEntry.timestamp < this.cacheTimeout) {
        return cacheEntry.data;
      }
    }
    const balance = await this.blockchainClient.getBalanceNow(addr)
    this.cache.set(cacheKey, {
      timestamp: currentTime,
      data: balance
    });
    return balance
  }

  async fetchNormalBalances(
    balanceQueries: BalanceQuery[],
    timestamp: UnixTime,
    blockHeight: number,
  ): Promise<BalanceRecord[]> {
    const balances: BalanceRecord[] = []

    for (const query of balanceQueries) {
      try {
        const balancenow = await this.getBalanceNow(`${query.holder}`);
        const balance = await this.blockchainClient.getBalanceHistory(`${query.holder}`, timestamp, balancenow);
        balances.push({
          assetId: AssetId('btc-bitcoin'),
          timestamp,
          holderAddress: query.holder,
          chainId: ChainId(0),
          balance: BigInt(balance),
        });
      } catch (error) {
        console.error(`Error fetching balance history for address ${query.holder}:`, error);
      }
    }
    return balances
  }
  // use blockchain.com api
  // private async getCachedAddressTransactions(holder: string, offset: number): Promise<any[]> {
  //   const cacheKey = `${holder}-${offset}`;
  //   const currentTime = Date.now();

  //   // 检查缓存是否存在且未超时
  //   if (this.cache.has(cacheKey)) {
  //     const cacheEntry = this.cache.get(cacheKey)!;
  //     if (currentTime - cacheEntry.timestamp < this.cacheTimeout) {
  //       return cacheEntry.transactions;
  //     } else {
  //       this.cache.delete(cacheKey); // 删除超时的缓存
  //     }
  //   }

  //   // 调用实际的API获取数据
  //   const transactions = await this.blockchainClient.getAddressTransactions(holder, 50, offset);

  //   // 将结果缓存
  //   if (offset !== 0) {
  //     this.cache.set(cacheKey, {
  //         timestamp: currentTime,
  //         transactions: transactions.txs
  //       });
  //   }

  //   return transactions.txs;
  // }

  // private calculateBalanceAtBlock(txs: any[], blockHeight: number): number | null {
  //   for (const tx of txs) {
  //     if (tx.block_height <= blockHeight && tx.block_height != null) {
  //       return tx.balance; // 使用交易中的balance字段
  //     }
  //   }

  //   return null; // 如果没有找到合适的交易，返回null
  // }

  // async fetchNormalBalances(
  //   balanceQueries: BalanceQuery[],
  //   timestamp: UnixTime,
  //   blockHeight: number,
  // ): Promise<BalanceRecord[]> {
  //   const balances: BalanceRecord[] = []

  //   for (const query of balanceQueries) {
  //     let page = 0;
  //     let hasMorePages = true;
  //     let finalBalance = 0;

  //     while (hasMorePages) {
  //       const transactions = await this.getCachedAddressTransactions(query.holder.toString(), page*50);
  //       const balanceAtBlock = this.calculateBalanceAtBlock(transactions, blockHeight);

  //       if (balanceAtBlock !== null) {
  //         finalBalance = balanceAtBlock;
  //         break; // 找到指定区块高度的余额后退出循环
  //       }

  //       hasMorePages = transactions.length > 0; // 假设API在没有更多交易时返回空数组
  //       page++;
  //     }

  //     balances.push({
  //       assetId: AssetId('btc-bitcoin'),
  //       timestamp,
  //       holderAddress: query.holder,
  //       chainId: ChainId(0),
  //       balance: BigInt(finalBalance),
  //     });
  //   }

  //   return balances
  // }
}
