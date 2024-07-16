import { HttpClient } from '../HttpClient'
import { RateLimiter, ChainId, UnixTime } from '@l2beat/shared-pure'
import { BlockNumberProvider } from '../providers'
import { getEnv } from '@l2beat/backend-tools'
import { AddressTransactionResult, BlockInfo, BalanceInfo, BalanceResult, BalanceTokenInfo, BlockstreamAddress, GetBlockHistory } from './model'

const API_URL = 'https://blockchain.info'
const DEFILLAMA_API_URL = 'https://api.llama.fi/protocol/'
const BLOCKSTREAM_API_URL = 'https://blockstream.info/api/address/'
const delay = 1 * 60 * 60 

export class BlockchainClient implements BlockNumberProvider {
  private readonly timeoutMs = 20000
  private readonly getblockKey: string | undefined
  constructor(
    private readonly httpClient: HttpClient,
    private readonly chainId: ChainId
  ) {
    // const rateLimiter = new RateLimiter({
    //   callsPerMinute: 3000,
    // })
    // this.getBalanceHistory = rateLimiter.wrap(this.getBalanceHistory.bind(this))
     const env = getEnv()
     this.getblockKey = env.optionalString('GETBLOCK_API_KEY')
  }

  static create(
    services: { httpClient: HttpClient},
    options: {
      chainId: ChainId
    },
  ) {
    return new BlockchainClient(services.httpClient, options.chainId)
  }

  getChainId(): ChainId {
    return this.chainId
  }

  async getBlockNumberAtOrBefore(timestamp: UnixTime): Promise<number> {
    if (this.chainId != ChainId.BITCOIN) {
        return timestamp.toNumber()
    }
    const blockInfo = await this.getBlockInfo(timestamp)

    if (blockInfo.length === 0) {
      throw new Error(`No blocks found for timestamp: ${timestamp.toNumber()}`)
    }

    let closestBlock = blockInfo[0]
    return closestBlock.height
  }

  async getAddressTransactions(address: string, n: number = 50, offset: number = 0): Promise<AddressTransactionResult> {
    const endpoint = `/rawaddr/${address}`
    const params = {
      limit: n.toString(),
      offset: offset.toString(),
    }
    const data = await this.query(API_URL, endpoint, params)
    return data as AddressTransactionResult
  }

  async getBlockInfo(timeInMilliseconds: UnixTime): Promise<BlockInfo[]> {
    const endpoint = `/blocks/${timeInMilliseconds.toNumber()*1000}`
    const params = {
      format: 'json',
    }
    const data = await this.query(API_URL, endpoint, params)
    return data as BlockInfo[]
  }

  public async getDefiLlamaProtocol(protocol: string): Promise<BalanceInfo[]> {
    const endpoint = protocol
    const data  = await this.query(DEFILLAMA_API_URL, endpoint, {}) as BalanceResult
    return data.tokens.map((item: BalanceTokenInfo) => ({
      time: new UnixTime(item.date),
      balance: Object.values(item.tokens)[0], 
    }));
  }

  async getBalanceHistory(addr: string, timestamp: UnixTime, balancenow:number): Promise<number> {
    const now = Date.now() / 1e3;
    if (!timestamp || (now - timestamp.toNumber()) < delay) return balancenow;
   
    let endpoint = `https://go.getblock.io/${this.getblockKey}/api/v2/balancehistory/${addr}?fiatcurrency=btc&groupBy=86400&from=${timestamp}`;
  
    const response = await this.query(endpoint,'',{}) as GetBlockHistory[];
    response.forEach(({ sent, received }) => balancenow += sent- received);
    //console.log('bitcoin balance', addr, timestamp, balancenow);
    return balancenow;
  }

  async getBalanceNow(addr: string) : Promise<number> {
    const endpoint = addr
    const data  = await this.query(BLOCKSTREAM_API_URL, endpoint, {}) as BlockstreamAddress
    const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;

    return balance
  }

  private async query(api:string, endpoint: string, params: Record<string, string>) {
    const query = new URLSearchParams(params).toString()
    let url = `${api}${endpoint}`
    if (query) {
      url += `?${query}`
    }
    console.log(`timeout: ${this.timeoutMs} api:${api} endpoint:${endpoint}`);
    const res = await this.httpClient.fetch(url, { timeout: this.timeoutMs })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(
        `Server responded with non-2XX result: ${api}  ${endpoint} ${res.status} ${res.statusText} ${body}`,
      )
    }
    return res.json() as unknown
  }
}
