export type VehicleType = "motor" | "car";

export type WeatherCondition = "normal" | "cloudy" | "rain" | "storm";

export interface VehiclePricingConfig {
  base_fare: number;
  price_per_km: number;
}

export const PRICING_CONFIG: Record<VehicleType, VehiclePricingConfig> = {
  motor: { base_fare: 5000, price_per_km: 2500 },
  car: { base_fare: 7000, price_per_km: 4000 },
};

export const WEATHER_MULTIPLIERS: Record<WeatherCondition, number> = {
  normal: 1.0,
  cloudy: 1.2,
  rain: 1.6,
  storm: 2.0,
};

export const WEATHER_LABELS: Record<WeatherCondition, string> = {
  normal: "Normal",
  cloudy: "Mendung / Gerimis",
  rain: "Hujan",
  storm: "Hujan Deras / Badai",
};

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  motor: "Motor",
  car: "Mobil (Kapasitas 4)",
};

export interface FareInput {
  vehicleType: VehicleType;
  distance: number;
  condition: WeatherCondition;
  jastipFee?: number;
}

export interface FareResult {
  totalFare: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    subtotal: number;
    multiplier: number;
    fareAfterMultiplier: number;
    jastipFee: number;
  };
}

export function calculateFare({
  vehicleType,
  distance,
  condition,
  jastipFee = 0,
}: FareInput): FareResult {
  const config = PRICING_CONFIG[vehicleType];
  const multiplier = WEATHER_MULTIPLIERS[condition];

  const baseFare = config.base_fare;
  const distanceFare = distance * config.price_per_km;
  const subtotal = baseFare + distanceFare;
  const fareAfterMultiplier = subtotal * multiplier;
  const totalFare = fareAfterMultiplier + jastipFee;

  return {
    totalFare,
    breakdown: {
      baseFare,
      distanceFare,
      subtotal,
      multiplier,
      fareAfterMultiplier,
      jastipFee,
    },
  };
}
