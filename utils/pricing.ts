export type VehicleType = "motor" | "car";

export type WeatherCondition = "normal" | "cloudy" | "rain" | "storm";

export interface VehiclePricingConfig {
  base_fare: number;
  price_per_km: number;
}

export const PRICING_CONFIG: Record<VehicleType, VehiclePricingConfig> = {
  motor: { base_fare: 0, price_per_km: 2500 },
  car: { base_fare: 7000, price_per_km: 4000 },
};

export const MOTOR_MINIMUM_PRICE = 5000;
export const MOTOR_RAINY_FEE = 2000;
export const EARLY_MORNING_FEE = 2000;

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

// --- Motor fare: original additive formula ---

export interface MotorFareInput {
  distance: number;
  isRainy: boolean;
  isEarlyMorning?: boolean;
  jastipFee?: number;
}

export interface MotorFareResult {
  totalFare: number;
  breakdown: {
    basePrice: number;
    weatherFee: number;
    earlyMorningFee: number;
    jastipFee: number;
  };
}

export function calculateMotorFare({
  distance,
  isRainy,
  isEarlyMorning = false,
  jastipFee = 0,
}: MotorFareInput): MotorFareResult {
  let basePrice = distance * PRICING_CONFIG.motor.price_per_km;
  if (basePrice < MOTOR_MINIMUM_PRICE) {
    basePrice = MOTOR_MINIMUM_PRICE;
  }

  const weatherFee = isRainy ? MOTOR_RAINY_FEE : 0;
  const earlyMorningFee = isEarlyMorning ? EARLY_MORNING_FEE : 0;
  const totalFare = basePrice + weatherFee + earlyMorningFee + jastipFee;

  return {
    totalFare,
    breakdown: { basePrice, weatherFee, earlyMorningFee, jastipFee },
  };
}

// --- Car fare: multiplier-based formula ---

export interface CarFareInput {
  distance: number;
  condition: WeatherCondition;
  isEarlyMorning?: boolean;
}

export interface CarFareResult {
  totalFare: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    subtotal: number;
    multiplier: number;
    fareAfterMultiplier: number;
    earlyMorningFee: number;
  };
}

export function calculateCarFare({
  distance,
  condition,
  isEarlyMorning = false,
}: CarFareInput): CarFareResult {
  const config = PRICING_CONFIG.car;
  const multiplier = WEATHER_MULTIPLIERS[condition];

  const baseFare = config.base_fare;
  const distanceFare = distance * config.price_per_km;
  const subtotal = baseFare + distanceFare;
  const fareAfterMultiplier = subtotal * multiplier;
  const earlyMorningFee = isEarlyMorning ? EARLY_MORNING_FEE : 0;

  return {
    totalFare: fareAfterMultiplier + earlyMorningFee,
    breakdown: { baseFare, distanceFare, subtotal, multiplier, fareAfterMultiplier, earlyMorningFee },
  };
}
