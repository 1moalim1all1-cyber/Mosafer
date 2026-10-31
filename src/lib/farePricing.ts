/** Advisory fare estimate for one seat; distances use straight-line coordinates, not road routing. */
export interface FareConfig {
  pricingEnabled: boolean
  pricingBaseFare: number
  pricingPerKm: number
  pricingTolerancePercent: number
}
export function getFareQuote(distanceKm: number, config: FareConfig) {
  if (!config.pricingEnabled || !Number.isFinite(distanceKm) || distanceKm <= 0 ||
    !Number.isFinite(config.pricingBaseFare) || config.pricingBaseFare < 0 ||
    !Number.isFinite(config.pricingPerKm) || config.pricingPerKm < 0 ||
    !Number.isFinite(config.pricingTolerancePercent) || config.pricingTolerancePercent < 0 ||
    config.pricingTolerancePercent > 100) return null
  const raw = config.pricingBaseFare + config.pricingPerKm * distanceKm
  if (!Number.isFinite(raw) || raw <= 0) return null
  const suggested = Math.max(1, Math.round(raw))
  const spread = config.pricingTolerancePercent / 100
  return {
    suggested,
    minimum: Math.max(1, Math.ceil(raw * (1 - spread))),
    maximum: Math.max(1, Math.floor(raw * (1 + spread))),
  }
}
