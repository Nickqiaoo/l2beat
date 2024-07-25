export type AssetType = 'CBV' | 'EBV' | 'NMV' | 'BTC' 

export function isAssetType(value: string): value is AssetType {
  return value === 'CBV' || value === 'EBV' || value === 'NMV' || value === 'BTC' 
}

export function AssetType(value: string): AssetType {
  if (!isAssetType(value)) {
    throw new Error(`Invalid asset type: ${value}`)
  }
  return value
}
