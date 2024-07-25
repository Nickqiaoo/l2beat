export interface AssetId extends String {
  _AssetIdBrand: string
}

export function AssetId(value: string) {
  if (value === '') {
    throw new TypeError('Invalid AssetId')
  }
  return value as unknown as AssetId
}

AssetId.WETH = AssetId('weth-wrapped-ether')
AssetId.DAI = AssetId('dai-dai-stablecoin')
AssetId.USDT = AssetId('usdt-tether-usd')
AssetId.USDC = AssetId('usdc-usd-coin')
AssetId.USDC_ON_ARBITRUM = AssetId('arbitrum:usdc-usd-coin')
AssetId.USDC_ON_OPTIMISM = AssetId('optimism:usdc-usd-coin')
AssetId.USDC_ON_BASE = AssetId('base:usdc-usd-coin')
AssetId.USDC_ON_LYRA = AssetId('lyra:usdc-usd-coin')
AssetId.ETH = AssetId('eth-ether')
AssetId.OP = AssetId('op-optimism')
AssetId.ARB = AssetId('arb-arbitrum')

AssetId.BTC = AssetId('btc-bitcoin')
AssetId.WBTC = AssetId('wbtc-wrapped-btc')
AssetId.TBTC = AssetId('tbtc-tbtc-v2')

AssetId.fake = function fake(name?: string) {
  if (name) {
    return AssetId(`fake-${name}`)
  }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const letter = () => letters[Math.floor(Math.random() * letters.length)]
  return AssetId('fake-' + Array.from({ length: 10 }).map(letter).join(''))
}
