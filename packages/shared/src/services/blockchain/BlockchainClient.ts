import { HttpClient } from '../HttpClient'
import { RateLimiter, ChainId, UnixTime } from '@l2beat/shared-pure'
import { BlockNumberProvider } from '../providers'

const API_URL = 'https://blockchain.info'

export interface AddressTransaction {
  hash: string
  time: number
  block_height: number
  inputs: Array<{
    prev_out: {
      value: number
      addr: string
    }
  }>
  out: Array<{
    value: number
    addr: string
  }>
  balance:number
}

export interface AddressTransactionResult {
  address: string
  n_tx: number
  total_received: number
  total_sent: number
  final_balance: number
  txs: AddressTransaction[]
}

export interface BlockInfo {
  hash: string
  height: number
  time: number
}

export interface BlockResult {
  blocks: BlockInfo[]
}

export class BlockchainClient implements BlockNumberProvider {
  private readonly timeoutMs = 20000
  private readonly chainId: ChainId

  constructor(
    private readonly httpClient: HttpClient,
  ) {
    this.chainId = ChainId(0)
    const rateLimiter = new RateLimiter({
      callsPerMinute: 10,
    })
    this.query = rateLimiter.wrap(this.query.bind(this))
  }

  static create(
    services: { httpClient: HttpClient },
  ) {
    return new BlockchainClient(services.httpClient)
  }

  getChainId(): ChainId {
    return this.chainId
  }

  async getBlockNumberAtOrBefore(timestamp: UnixTime): Promise<number> {
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
    const data = await this.query(endpoint, params)
    return data as AddressTransactionResult
  }

  async getBlockInfo(timeInMilliseconds: UnixTime): Promise<BlockInfo[]> {
    const endpoint = `/blocks/${timeInMilliseconds.toNumber()*1000}`
    const params = {
      format: 'json',
    }
    const data = await this.query(endpoint, params)
    return data as BlockInfo[]
  }

  private async query(endpoint: string, params: Record<string, string>) {
    const query = new URLSearchParams(params).toString()
    let url = `${API_URL}${endpoint}`
    if (query) {
      url += `?${query}`
    }
    console.log('timeout: endpoint:', this.timeoutMs, endpoint);
    const res = await this.httpClient.fetch(url, { timeout: this.timeoutMs })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(
        `Server responded with non-2XX result: ${res.status} ${res.statusText} ${body}`,
      )
    }
    return res.json() as unknown
  }
}
