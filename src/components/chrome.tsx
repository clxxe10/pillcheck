"use client";

import {
  BackIcon,
  CalendarIcon,
  HomeIcon,
  ListIcon,
  ScanIcon,
} from "@/components/icons";
import { useDemoOnly } from "@/components/demo-mode";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

export type NavKey = "home" | "list" | null;

const pillShadow = "0 8px 24px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.9)";
const navShadow = "0 8px 24px rgba(0,0,0,.08)";

export function LogoMark({
  width,
  height,
  bar,
}: {
  width: number;
  height: number;
  bar: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        width,
        height,
        flex: "none",
        border: "1.5px solid #D4FF4F",
        borderRadius: 9999,
        background: "#111",
        display: "flex",
        alignItems: "center",
        padding: "0 3px",
      }}
    >
      <span
        style={{
          width: "45%",
          height: bar,
          borderRadius: 9999,
          background: "#D4FF4F",
        }}
      />
    </span>
  );
}

export function LangToggle({ wide = false, solid = false }: { wide?: boolean; solid?: boolean }) {
  const { lang, setLang } = useTranslation();
  const minWidth = wide ? 52 : 48;

  const item = (code: "en" | "ko"): CSSProperties => ({
    height: 38,
    minWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    background: lang === code ? "#111" : "transparent",
    color: lang === code ? "#fff" : "#555",
    fontWeight: lang === code ? 600 : 500,
    fontSize: 15,
  });

  return (
    <div
      style={{
        display: "flex",
        padding: 3,
        borderRadius: 9999,
        background: solid ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.6)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 2px 8px rgba(0,0,0,.06)",
      }}
    >
      <button type="button" style={item("en")} onClick={() => setLang("en")}>
        EN
      </button>
      <button type="button" style={item("ko")} onClick={() => setLang("ko")}>
        KO
      </button>
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p
      className={cn(
        "mx-2 mt-6 text-center text-[14px] leading-[1.45] font-normal text-[#6B6B72] [text-wrap:balance]",
        className,
      )}
    >
      {t("disclaimer")}
    </p>
  );
}

function NavGlyph({
  href,
  label,
  active,
  children,
  desktop = false,
}: {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
  desktop?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      style={{
        width: desktop ? 48 : 56,
        height: 48,
        borderRadius: 9999,
        background: active ? "#F0F0F2" : "transparent",
        color: active ? "#111" : "#86868D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Link>
  );
}

export function ScanCapsule({ labeled = false }: { labeled?: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      href="/scan"
      aria-label={t("scan")}
      style={{
        height: labeled ? 64 : 80,
        width: labeled ? undefined : 56,
        marginTop: labeled ? 0 : 6,
        padding: labeled ? "0 22px" : 0,
        border: "1.5px solid #D4FF4F",
        borderRadius: 9999,
        background: "#111",
        boxShadow: labeled ? "0 8px 24px rgba(0,0,0,.18)" : "0 8px 20px rgba(0,0,0,.18)",
        color: "#D4FF4F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontWeight: 600,
        fontSize: 17,
      }}
    >
      <ScanIcon />
      {labeled ? <span style={{ color: "#fff" }}>{t("scan")}</span> : null}
    </Link>
  );
}

export function DesktopNav({
  active,
  showLogo = true,
}: {
  active: NavKey;
  showLogo?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <aside className="relative hidden pt-5 pr-0 pb-5 pl-5 lg:sticky lg:top-0 lg:block lg:self-start">
      <div
        style={{
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderRadius: 9999,
          padding: showLogo ? "16px 8px 12px" : "12px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          boxShadow: navShadow,
        }}
      >
        {showLogo ? (
          <Link href="/" aria-label={t("nav.home")} style={{ height: 40, display: "flex", alignItems: "center" }}>
            <LogoMark width={40} height={24} bar={15} />
          </Link>
        ) : null}
        <NavGlyph href="/" label={t("nav.home")} active={active === "home"} desktop>
          <HomeIcon />
        </NavGlyph>
        <NavGlyph href="/results" label={t("nav.list")} active={active === "list"} desktop>
          <ListIcon />
        </NavGlyph>
        <NavGlyph href="/results#schedule" label={t("nav.schedule")} active={false} desktop>
          <CalendarIcon />
        </NavGlyph>
        <ScanCapsule />
      </div>
    </aside>
  );
}

export function MobileDock({ active }: { active: NavKey }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center justify-center gap-3.5 lg:hidden"
      style={{
        position: "sticky",
        bottom: 0,
        marginTop: "auto",
        padding: "20px 20px 26px",
        background: "linear-gradient(rgba(242,242,244,0), #F2F2F4 45%)",
        zIndex: 20,
      }}
    >
      <div
        style={{
          height: 64,
          padding: "0 10px",
          borderRadius: 9999,
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          boxShadow: pillShadow,
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <NavGlyph href="/" label={t("nav.home")} active={active === "home"}>
          <HomeIcon />
        </NavGlyph>
        <NavGlyph href="/results" label={t("nav.list")} active={active === "list"}>
          <ListIcon />
        </NavGlyph>
        <NavGlyph href="/results#schedule" label={t("nav.schedule")} active={false}>
          <CalendarIcon />
        </NavGlyph>
      </div>
      <ScanCapsule labeled />
    </div>
  );
}

function useScrolled(px = 8) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const update = () => setOn(window.scrollY > px);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [px]);
  return on;
}

export function SiteHeader() {
  const { t, lang, setLang } = useTranslation();
  const scanHref = useDemoOnly() ? "/scan?sample=1" : "/scan?fresh=1";
  const glass = useScrolled(8);
  const langStyle = (code: "en" | "ko"): CSSProperties => ({
    borderRadius: 999,
    background: lang === code ? "#fff" : "transparent",
    boxShadow: lang === code ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
    color: lang === code ? "#000" : "rgba(60,60,67,0.6)",
    fontWeight: lang === code ? 600 : 500,
  });
  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 h-[60px] lg:h-[72px]">
      {glass ? (
        <div
          className="absolute inset-0 border-b border-[rgba(60,60,67,0.2)] bg-[rgba(255,255,255,0.72)] backdrop-blur-[24px]"
          style={{ backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
        />
      ) : null}
      <div className="relative flex h-full items-center justify-between px-4 lg:px-12">
        <Link href="/" className="flex items-center gap-[7px] lg:gap-2.5">
          <span
            aria-hidden
            className="h-[9px] w-5 border-[1.5px] border-black lg:h-3 lg:w-[26px]"
            style={{ borderRadius: 999, background: "linear-gradient(90deg,#000 50%,#D4FF4F 50%)", transform: "rotate(-35deg)" }}
          />
          <span className="text-[16px] font-bold tracking-[-0.02em] lg:text-[19px]">PillCheck</span>
        </Link>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex rounded-full p-0.5" style={{ background: "rgba(120,120,128,0.12)" }}>
            <button type="button" className="px-2 py-1 text-[12px] lg:px-3 lg:py-[5px] lg:text-[13px]" style={langStyle("en")} onClick={() => setLang("en")}>
              EN
            </button>
            <button type="button" className="px-2 py-1 text-[12px] lg:px-3 lg:py-[5px] lg:text-[13px]" style={langStyle("ko")} onClick={() => setLang("ko")}>
              KO
            </button>
          </div>
          <Link
            href={scanHref}
            className="!text-white rounded-full border-[1.5px] border-[#D4FF4F] bg-black px-3 py-[7px] text-[12px] font-semibold whitespace-nowrap lg:px-4 lg:py-2 lg:text-[14px]"
          >
            {t("landing.check")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PageFrame({
  children,
  overlay,
  flush = false,
}: {
  children: ReactNode;
  overlay?: ReactNode;
  flush?: boolean;
}) {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#F5F5F7] text-black">
      <SiteHeader />
      <div className={flush ? "print:bg-white" : "px-4 pt-[84px] pb-12 lg:px-20 lg:pt-[112px] lg:pb-16 print:bg-white print:p-0"}>{children}</div>
      {overlay}
    </div>
  );
}

export function BackButton() {
  const { t } = useTranslation();
  return (
    <Link
      href="/"
      aria-label={t("back")}
      style={{
        width: 44,
        height: 44,
        borderRadius: 9999,
        background: "rgba(255,255,255,.6)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 2px 8px rgba(0,0,0,.06)",
        color: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BackIcon />
    </Link>
  );
}

export function Wordmark() {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: "-0.01em",
      }}
    >
      <LogoMark width={38} height={22} bar={13} />
      PillCheck
    </span>
  );
}

export function TitleBlock({
  kicker,
  line1,
  line2,
}: {
  kicker?: string;
  line1: string;
  line2?: string;
}) {
  return (
    <div>
      {kicker ? (
        <p className="text-[16px] lg:text-[17px]" style={{ margin: "0 0 6px", fontWeight: 400, color: "#6B6B72" }}>
          {kicker}
        </p>
      ) : null}
      <h1
        className="text-[36px] lg:text-[44px]"
        style={{
          margin: 0,
          fontWeight: 500,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          textWrap: "balance",
        }}
      >
        {line1}
        {line2 ? (
          <>
            <br />
            <span style={{ color: "#86868D" }}>{line2}</span>
          </>
        ) : null}
      </h1>
    </div>
  );
}

export function BlackBadge({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        height: 28,
        padding: "0 12px",
        borderRadius: 9999,
        background: "#111",
        color: "#fff",
        fontWeight: 600,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        flex: "none",
      }}
    >
      {children}
    </span>
  );
}

export function SoftChip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        minHeight: 34,
        padding: "6px 12px",
        borderRadius: 9999,
        background: "#F2F2F4",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1.3,
        color: "#333",
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({
  tone,
  children,
}: {
  tone: "danger" | "warning";
  children: ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <span
      style={{
        height: 28,
        padding: "0 12px",
        borderRadius: 9999,
        background: danger ? "#FDE9E7" : "#FFF1D9",
        color: danger ? "#B42318" : "#8A4D00",
        fontWeight: 600,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );
}
