"use client";

import { useState, useMemo } from "react";
import type {
  ServiceType,
  PriceCalculatorState,
  PriceCalculatorResult,
  PricingConfig,
} from "@/types";
import {
  PRICE_PER_KM,
  MINIMUM_PRICE,
  JASTIP_FEE,
  RAINY_FEE,
  EARLY_MORNING_FEE,
} from "@/lib/constants";

export function usePriceCalculator(config?: PricingConfig) {
  const pricePerKm = config?.price_per_km ?? PRICE_PER_KM;
  const minimumPrice = config?.minimum_price ?? MINIMUM_PRICE;
  const jastipFee = config?.jastip_fee ?? JASTIP_FEE;
  const rainyFee = config?.rainy_fee ?? RAINY_FEE;
  const earlyMorningFee = config?.early_morning_fee ?? EARLY_MORNING_FEE;

  const [state, setState] = useState<PriceCalculatorState>({
    serviceType: "antar-jemput",
    distance: "",
    isRainy: false,
    isEarlyMorning: false,
  });

  const setServiceType = (type: ServiceType) => {
    setState((prev) => ({ ...prev, serviceType: type }));
  };

  const setDistance = (distance: string) => {
    setState((prev) => ({ ...prev, distance }));
  };

  const setIsRainy = (isRainy: boolean) => {
    setState((prev) => ({ ...prev, isRainy }));
  };

  const setIsEarlyMorning = (isEarlyMorning: boolean) => {
    setState((prev) => ({ ...prev, isEarlyMorning }));
  };

  const toggleRainy = () => {
    setState((prev) => ({ ...prev, isRainy: !prev.isRainy }));
  };

  const toggleEarlyMorning = () => {
    setState((prev) => ({ ...prev, isEarlyMorning: !prev.isEarlyMorning }));
  };

  const result: PriceCalculatorResult = useMemo(() => {
    const normalizedDistance = state.distance.replace(",", ".");
    const distanceNum = parseFloat(normalizedDistance) || 0;

    let basePrice = distanceNum * pricePerKm;

    if (basePrice < minimumPrice) {
      basePrice = minimumPrice;
    }

    const serviceFee = state.serviceType === "jastip" ? jastipFee : 0;
    const weatherFee = state.isRainy ? rainyFee : 0;
    const timeFee = state.isEarlyMorning ? earlyMorningFee : 0;

    const estimatedPrice = basePrice + serviceFee + weatherFee + timeFee;

    return {
      estimatedPrice,
      breakdown: {
        basePrice,
        serviceFee,
        weatherFee,
        timeFee,
      },
    };
  }, [state, pricePerKm, minimumPrice, jastipFee, rainyFee, earlyMorningFee]);

  return {
    ...state,
    setServiceType,
    setDistance,
    setIsRainy,
    setIsEarlyMorning,
    toggleRainy,
    toggleEarlyMorning,
    estimatedPrice: result.estimatedPrice,
    priceBreakdown: result.breakdown,
  };
}
