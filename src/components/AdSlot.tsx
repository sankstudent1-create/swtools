"use client";

import { useEffect, useRef } from "react";

type AdSlotProps = {
  slotKey: string;
  label: string;
  variant?: "banner" | "inline";
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ slotKey, label, variant = "banner" }: AdSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_AD_SLOT_PREFIX
    ? `${process.env.NEXT_PUBLIC_AD_SLOT_PREFIX}-${slotKey}`
    : undefined;

  useEffect(() => {
    if (!client || !slot || !adRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore ad network boot failures and keep the slot reserved.
    }
  }, [client, slot]);

  const minHeight = variant === "banner" ? "min-h-[110px]" : "min-h-[260px]";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <div className={`my-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 ${minHeight}`}>
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/8 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Ad Slot</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</p>
        </div>
        {client && slot ? (
          <ins
            ref={adRef}
            className="adsbygoogle block h-full w-full"
            style={{ display: "block" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex h-full min-h-[72px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/15 px-4 text-center text-sm text-foreground/55">
            Reserved ad inventory for {label}. Set NEXT_PUBLIC_ADSENSE_CLIENT and NEXT_PUBLIC_AD_SLOT_PREFIX to activate live ads.
          </div>
        )}
      </div>
    </section>
  );
}
