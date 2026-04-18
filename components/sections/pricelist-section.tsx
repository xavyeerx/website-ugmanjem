"use client";

import { useState } from "react";
import Image from "next/image";
import { Bike, Car, Cloud, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import FadeIn from "@/components/fade-in";
import {
  usePriceCalculator,
  type MotorBreakdown,
  type CarBreakdown,
} from "@/hooks/use-price-calculator";
import type { PricingConfig } from "@/types";
import {
  WEATHER_LABELS,
  VEHICLE_LABELS,
  type VehicleType,
  type WeatherCondition,
} from "@/utils/pricing";
import MapRoutingDynamic from "@/components/map-routing-dynamic";

interface ImageItem {
  id: number;
  src: string;
  alt: string;
}

interface PricelistSectionProps {
  images: ImageItem[];
  serviceDescriptions: Record<string, string>;
  pricingConfig: PricingConfig;
  onImageClick: (images: ImageItem[], startIndex: number) => void;
}

const VEHICLE_OPTIONS: {
  value: VehicleType;
  label: string;
  icon: typeof Bike;
}[] = [
  { value: "motor", label: VEHICLE_LABELS.motor, icon: Bike },
  { value: "car", label: VEHICLE_LABELS.car, icon: Car },
];

const CAR_WEATHER_OPTIONS: { value: WeatherCondition; label: string }[] = [
  { value: "normal", label: WEATHER_LABELS.normal },
  { value: "cloudy", label: WEATHER_LABELS.cloudy },
  { value: "rain", label: WEATHER_LABELS.rain },
  { value: "storm", label: WEATHER_LABELS.storm },
];

export default function PricelistSection({
  images,
  serviceDescriptions,
  pricingConfig,
  onImageClick,
}: PricelistSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const {
    vehicleType,
    serviceType,
    distance,
    isRainy,
    isEarlyMorning,
    weatherCondition,
    setVehicleType,
    setServiceType,
    setDistance,
    toggleRainy,
    toggleEarlyMorning,
    setWeatherCondition,
    estimatedPrice,
    priceBreakdown,
  } = usePriceCalculator(pricingConfig);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");

  return (
    <section
      id="pricelist"
      className="py-16 md:py-24 bg-card relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <FadeIn direction="up">
            <h2 className="text-4xl md:text-5xl font-bold text-accent">
              PRICELIST
            </h2>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn
            direction="left"
            className="relative w-full max-w-md mx-auto lg:mx-0"
          >
            <div className="relative">
              <button
                onClick={() => onImageClick(images, currentImageIndex)}
                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-border shadow-xl hover:shadow-2xl transition-shadow cursor-zoom-in"
              >
                <Image
                  src={images[currentImageIndex]?.src ?? ""}
                  alt={images[currentImageIndex]?.alt ?? ""}
                  fill
                  className="object-cover"
                  priority
                />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-14 h-18 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-accent shadow-md"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              Klik gambar untuk memperbesar • Geser untuk melihat lainnya
            </p>
          </FadeIn>

          <FadeIn direction="right" className="flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-3xl md:text-4xl font-bold text-accent mb-2">
                Mau Ke Tujuan Lain?
              </h3>
              <h4 className="text-lg md:text-xl font-semibold text-accent/70">
                CEK RUTEMU DISINI
              </h4>
            </div>

            {/* Vehicle type selector */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Pilih Kendaraan
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setVehicleType(opt.value)}
                      className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-colors ${
                        vehicleType === opt.value
                          ? "bg-accent text-white border-accent"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service type (motor only) */}
            {vehicleType === "motor" && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Pilih Layanan
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <input
                      type="radio"
                      name="service"
                      value="antar-jemput"
                      checked={serviceType === "antar-jemput"}
                      onChange={(e) =>
                        setServiceType(
                          e.target.value as "antar-jemput" | "jastip"
                        )
                      }
                      className="w-5 h-5 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">
                      Anjem (Antar Jemput)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <input
                      type="radio"
                      name="service"
                      value="jastip"
                      checked={serviceType === "jastip"}
                      onChange={(e) =>
                        setServiceType(
                          e.target.value as "antar-jemput" | "jastip"
                        )
                      }
                      className="w-5 h-5 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">
                      Jastip (Jasa Titip)
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {serviceDescriptions[serviceType]}
                </p>
              </div>
            )}

            {/* Map Routing Input */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Cari Lokasi & Rute
              </h4>
              <MapRoutingDynamic onDistanceFound={(km) => setDistance(km)} />
              {distance && (
                <p className="text-sm text-center text-muted-foreground mt-3 bg-muted py-2 rounded-lg font-medium">
                  Jarak Total: <span className="text-accent">{distance} KM</span>
                </p>
              )}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Titik tidak ditemukan di peta? Masukkan jarak manual:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Contoh: 3.5"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                    KM
                  </span>
                </div>
              </div>
            </div>

            {/* Weather / condition — different per vehicle */}
            {vehicleType === "motor" ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Kondisi Opsional
                </h4>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={toggleRainy}
                    className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-colors w-full ${
                      isRainy
                        ? "bg-accent text-white border-accent"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <Cloud className="w-5 h-5" />
                    <span className="text-sm font-medium">Hujan (+Rp2.000)</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleEarlyMorning}
                    className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-colors w-full ${
                      isEarlyMorning
                        ? "bg-accent text-white border-accent"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Dini Hari &gt;10:00 PM (+Rp2.000)
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Kondisi Cuaca
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {CAR_WEATHER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWeatherCondition(opt.value)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        weatherCondition === opt.value
                          ? "bg-accent text-white border-accent"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={toggleEarlyMorning}
                  className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-colors w-full mt-2 ${
                    isEarlyMorning
                      ? "bg-accent text-white border-accent"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Dini Hari &gt;10:00 PM (+Rp2.000)
                  </span>
                </button>
              </div>
            )}

            {/* Price output */}
            <div className="bg-accent rounded-lg p-4 space-y-3 max-w-md">
              <div>
                <span className="text-sm text-white/90 font-semibold">
                  Estimasi Biaya
                </span>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  Rp. {fmt(estimatedPrice)}
                </p>
              </div>

              {/* Breakdown — different per vehicle */}
              {priceBreakdown.type === "motor" ? (
                <MotorBreakdownView
                  breakdown={priceBreakdown}
                  distance={distance}
                  fmt={fmt}
                />
              ) : (
                <CarBreakdownView
                  breakdown={priceBreakdown}
                  distance={distance}
                  fmt={fmt}
                />
              )}

              <p className="text-[11px] text-white/90 leading-relaxed">
                Harga ini berupa estimasi. Faktor cuaca, waktu, dan kondisi lain
                dapat mempengaruhi perubahan harga. Silakan tanyakan ke driver
                untuk detail pastinya.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function MotorBreakdownView({
  breakdown,
  distance,
  fmt,
}: {
  breakdown: MotorBreakdown;
  distance: string;
  fmt: (n: number) => string;
}) {
  return (
    <div className="text-xs text-white/80 space-y-1 border-t border-white/20 pt-2">
      <div className="flex justify-between">
        <span>Tarif jarak ({distance || "0"} km)</span>
        <span>Rp. {fmt(breakdown.basePrice)}</span>
      </div>
      {breakdown.weatherFee > 0 && (
        <div className="flex justify-between">
          <span>Biaya hujan</span>
          <span>+ Rp. {fmt(breakdown.weatherFee)}</span>
        </div>
      )}
      {breakdown.earlyMorningFee > 0 && (
        <div className="flex justify-between">
          <span>Biaya dini hari</span>
          <span>+ Rp. {fmt(breakdown.earlyMorningFee)}</span>
        </div>
      )}
      {breakdown.jastipFee > 0 && (
        <div className="flex justify-between">
          <span>Biaya jastip</span>
          <span>+ Rp. {fmt(breakdown.jastipFee)}</span>
        </div>
      )}
    </div>
  );
}

function CarBreakdownView({
  breakdown,
  distance,
  fmt,
}: {
  breakdown: CarBreakdown;
  distance: string;
  fmt: (n: number) => string;
}) {
  return (
    <div className="text-xs text-white/80 space-y-1 border-t border-white/20 pt-2">
      <div className="flex justify-between">
        <span>Tarif dasar</span>
        <span>Rp. {fmt(breakdown.baseFare)}</span>
      </div>
      <div className="flex justify-between">
        <span>Jarak ({distance || "0"} km)</span>
        <span>Rp. {fmt(breakdown.distanceFare)}</span>
      </div>
      {breakdown.multiplier !== 1 && (
        <div className="flex justify-between">
          <span>Cuaca (×{breakdown.multiplier})</span>
          <span>Rp. {fmt(breakdown.fareAfterMultiplier)}</span>
        </div>
      )}
      {breakdown.earlyMorningFee > 0 && (
        <div className="flex justify-between">
          <span>Biaya dini hari</span>
          <span>+ Rp. {fmt(breakdown.earlyMorningFee)}</span>
        </div>
      )}
    </div>
  );
}
