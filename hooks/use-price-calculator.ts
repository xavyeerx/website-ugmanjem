"use client";

import { useState, useMemo } from "react";
import type {
  ServiceType,
  PriceCalculatorState,
  PriceCalculatorResult,
} from "@/types";
import {
  PRICE_PER_KM,
  MINIMUM_PRICE,
  JASTIP_FEE,
  RAINY_FEE,
  EARLY_MORNING_FEE,
} from "@/lib/constants";

export function usePriceCalculator() {
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
    // Handle comma input (e.g., "2,4" -> "2.4")
    const normalizedDistance = state.distance.replace(",", ".");
    const distanceNum = parseFloat(normalizedDistance) || 0;

    // Calculate base price (1 km = Rp 2.500)
    let basePrice = distanceNum * PRICE_PER_KM;

    // Apply minimum price
    if (basePrice < MINIMUM_PRICE) {
      basePrice = MINIMUM_PRICE;
    }

    // Calculate fees
    const serviceFee = state.serviceType === "jastip" ? JASTIP_FEE : 0;
    const weatherFee = state.isRainy ? RAINY_FEE : 0;
    const timeFee = state.isEarlyMorning ? EARLY_MORNING_FEE : 0;

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
  }, [state]);

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
