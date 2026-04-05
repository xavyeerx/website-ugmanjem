"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapRouting = dynamic(() => import("./map-routing"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/40 rounded-xl border border-dashed">
      <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
      <p className="text-sm text-muted-foreground font-medium">Memuat Peta...</p>
    </div>
  ),
});

export default MapRouting;
