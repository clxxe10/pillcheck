import type { CSSProperties } from "react";

/** Grain copied from the design file (feTurbulence + radial mask). */
export const GRAIN =
  "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3CfeColorMatrix values=%270 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')";

type Box = { top: number; right: number; width: number; height: number };

export function BackdropOrb({ box, className }: { box: Box; className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        top: box.top,
        right: box.right,
        width: box.width,
        height: box.height,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#D4FF4F,#7DF0C6)",
          opacity: 0.6,
          filter: "blur(48px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -20,
          backgroundImage: GRAIN,
          mixBlendMode: "multiply",
          opacity: 0.35,
          WebkitMaskImage: "radial-gradient(closest-side,#000 30%,transparent)",
          maskImage: "radial-gradient(closest-side,#000 30%,transparent)",
        }}
      />
    </div>
  );
}

/** Pair of orbs: mobile frame and desktop frame, same grain as the artboards. */
export function SummaryOrb({
  mobile,
  desktop,
}: {
  mobile: Box;
  desktop: Box;
}) {
  return (
    <>
      <BackdropOrb box={mobile} className="lg:hidden" />
      <BackdropOrb box={desktop} className="hidden lg:block" />
    </>
  );
}

export function PulseOrb({ size }: { size: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#D4FF4F,#7DF0C6)",
          filter: "blur(36px)",
          animation: "pcPulse 3.2s cubic-bezier(.32,.72,0,1) infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -30,
          backgroundImage: GRAIN,
          mixBlendMode: "multiply",
          opacity: 0.35,
          WebkitMaskImage: "radial-gradient(closest-side,#000 35%,transparent)",
          maskImage: "radial-gradient(closest-side,#000 35%,transparent)",
        }}
      />
    </div>
  );
}

export function Spinner() {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 9999,
        border: "3px solid #E3E3E7",
        borderTopColor: "#111",
        animation: "pcSpin .9s linear infinite",
        display: "block",
      }}
    />
  );
}

export function LimeRule() {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: -1,
        left: 0,
        right: 0,
        height: 2,
        borderRadius: 2,
        background: "linear-gradient(90deg,#D4FF4F,#7DF0C6)",
      }}
    />
  );
}

export function photoStripe(soft = false): CSSProperties {
  return {
    background: soft
      ? "repeating-linear-gradient(135deg,#DCDCE0 0 6px,#E8E8EC 6px 12px)"
      : "repeating-linear-gradient(135deg,#E4E4E8 0 6px,#EDEDF0 6px 12px)",
  };
}
