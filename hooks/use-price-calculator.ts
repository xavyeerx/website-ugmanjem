"use client";

import { useState, useMemo } from "react";
import type {
  ServiceType,
  PriceCalculatorState,
  PriceCalculatorResult,
  PricingConfig,
} from "@/types";
import {
  calculateFare,
  type VehicleType,
  type WeatherCondition,
} from "@/utils/pricing";
import { JASTIP_FEE } from "@/lib/constants";

export function usePriceCalculator(config?: PricingConfig) {
  const jastipFee = config?.jastip_fee ?? JASTIP_FEE;

  const [state, setState] = useState<PriceCalculatorState>({
    vehicleType: "motor",
    serviceType: "antar-jemput",
    distance: "",
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

  const setWeatherCondition = (weatherCondition: WeatherCondition) => {
    setState((prev) => ({ ...prev, weatherCondition }));
  };

  const result: PriceCalculatorResult = useMemo(() => {
    const normalizedDistance = state.distance.replace(",", ".");
    const distanceNum = parseFloat(normalizedDistance) || 0;

    const applicableJastipFee =
      state.vehicleType === "motor" && state.serviceType === "jastip"
        ? jastipFee
        : 0;

    const fareResult = calculateFare({
      vehicleType: state.vehicleType,
      distance: distanceNum,
      condition: state.weatherCondition,
      jastipFee: applicableJastipFee,
    });

    return {
      estimatedPrice: fareResult.totalFare,
      breakdown: fareResult.breakdown,
    };
  }, [state, jastipFee]);

  return {
    ...state,
    setVehicleType,
    setServiceType,
    setDistance,
    setWeatherCondition,
    estimatedPrice: result.estimatedPrice,
    priceBreakdown: result.breakdown,
  };
}
