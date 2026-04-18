"use client";

import { useState, useMemo } from "react";
import type { ServiceType, PricingConfig } from "@/types";
import {
  calculateMotorFare,
  calculateCarFare,
  type VehicleType,
  type WeatherCondition,
} from "@/utils/pricing";
import { JASTIP_FEE, RAINY_FEE } from "@/lib/constants";

export interface PriceCalculatorState {
  vehicleType: VehicleType;
  serviceType: ServiceType;
  distance: string;
  isRainy: boolean;
  isEarlyMorning: boolean;
  weatherCondition: WeatherCondition;
}

export type MotorBreakdown = {
  type: "motor";
  basePrice: number;
  weatherFee: number;
  earlyMorningFee: number;
  jastipFee: number;
};

export type CarBreakdown = {
  type: "car";
  baseFare: number;
  distanceFare: number;
  subtotal: number;
  multiplier: number;
  fareAfterMultiplier: number;
  earlyMorningFee: number;
};

export type PriceBreakdown = MotorBreakdown | CarBreakdown;

export function usePriceCalculator(config?: PricingConfig) {
  const jastipFee = config?.jastip_fee ?? JASTIP_FEE;
  const rainyFee = config?.rainy_fee ?? RAINY_FEE;

  const [state, setState] = useState<PriceCalculatorState>({
    vehicleType: "motor",
    serviceType: "antar-jemput",
    distance: "",
    isRainy: false,
    isEarlyMorning: false,
    weatherCondition: "normal",
  });

  const setVehicleType = (vehicleType: VehicleType) => {
    setState((prev) => ({ ...prev, vehicleType }));
  };

  const setServiceType = (type: ServiceType) => {
    setState((prev) => ({ ...prev, serviceType: type }));
  };

  const setDistance = (distance: string) => {
    setState((prev) => ({ ...prev, distance }));
  };

  const setIsRainy = (isRainy: boolean) => {
    setState((prev) => ({ ...prev, isRainy }));
  };

  const toggleRainy = () => {
    setState((prev) => ({ ...prev, isRainy: !prev.isRainy }));
  };

  const toggleEarlyMorning = () => {
    setState((prev) => ({ ...prev, isEarlyMorning: !prev.isEarlyMorning }));
  };

  const setWeatherCondition = (weatherCondition: WeatherCondition) => {
    setState((prev) => ({ ...prev, weatherCondition }));
  };

  const { estimatedPrice, priceBreakdown } = useMemo(() => {
    const normalizedDistance = state.distance.replace(",", ".");
    const distanceNum = parseFloat(normalizedDistance) || 0;

    if (state.vehicleType === "motor") {
      const applicableJastipFee =
        state.serviceType === "jastip" ? jastipFee : 0;

      const result = calculateMotorFare({
        distance: distanceNum,
        isRainy: state.isRainy,
        isEarlyMorning: state.isEarlyMorning,
        jastipFee: applicableJastipFee,
      });

      const breakdown: MotorBreakdown = {
        type: "motor",
        ...result.breakdown,
      };

      return { estimatedPrice: result.totalFare, priceBreakdown: breakdown };
    }

    const result = calculateCarFare({
      distance: distanceNum,
      condition: state.weatherCondition,
      isEarlyMorning: state.isEarlyMorning,
    });

    const breakdown: CarBreakdown = {
      type: "car",
      ...result.breakdown,
    };

    return { estimatedPrice: result.totalFare, priceBreakdown: breakdown };
  }, [state, jastipFee, rainyFee]);

  return {
    ...state,
    setVehicleType,
    setServiceType,
    setDistance,
    setIsRainy,
    toggleRainy,
    toggleEarlyMorning,
    setWeatherCondition,
    estimatedPrice,
    priceBreakdown,
  };
}
