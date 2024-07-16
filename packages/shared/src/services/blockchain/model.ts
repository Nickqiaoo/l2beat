import { UnixTime } from "@l2beat/shared-pure"

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

export interface BalanceResult {
  tokens: BalanceTokenInfo[];
}

export interface BalanceTokenInfo {
  date: number;
  tokens: {
    [key: string]: number; // Allows for dynamic token keys
  };
}

export interface BalanceInfo {
  time: UnixTime;
  balance: number;
}

export interface BlockstreamAddress {
    chain_stats: BlockstreamChainStats;
}
export interface BlockstreamChainStats {
    funded_txo_sum: number;
    spent_txo_sum: number;
}


export interface GetBlockHistory {
    sent: number;
    received: number;
}