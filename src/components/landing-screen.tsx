"use client";

import { PageFrame } from "@/components/chrome";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <img src={`/brand/${name}.svg`} alt="" width={size} height={size} />;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.18 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "reveal-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const checkLink: CSSProperties = {
  borderRadius: 999,
  background: "#000",
  color: "#fff",
  fontWeight: 600,
  fontSize: 17,
  border: "1.5px solid #D4FF4F",
  textAlign: "center",
};

function Orb({ className = "" }: { className?: string }) {
  return (
    <div className={`motion-drift ${className}`}>
      <div
        className="absolute inset-0 rounded-full blur-[6px]"
        style={{ background: "radial-gradient(circle at 38% 34%,#D4FF4F 0%,#B6FA7A 38%,#7DF0C6 72%,rgba(125,240,198,0) 100%)" }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-35 mix-blend-multiply"
        style={{
          backgroundImage: "url(/brand/grain.svg)",
          WebkitMaskImage: "radial-gradient(circle,#000 55%,transparent 72%)",
          maskImage: "radial-gradient(circle,#000 55%,transparent 72%)",
        }}
      />
    </div>
  );
}

function HeroStage() {
  const { t } = useTranslation();
  return (
    <div className="relative h-[540px] w-[500px]">
      <Orb className="absolute top-[50px] left-10 h-[440px] w-[440px]" />
      <img src="/brand/illo-capsule.svg" alt="" className="absolute top-2 left-[440px] w-[34px] -rotate-[24deg]" />
      <img src="/brand/illo-tablet-mint.svg" alt="" className="absolute top-24 left-24 w-[18px]" />
      <img src="/brand/illo-capsule-mint.svg" alt="" className="absolute top-[460px] left-[400px] w-7 rotate-[28deg]" />
      <img src="/brand/illo-tablet.svg" alt="" className="absolute top-[280px] left-[30px] w-4" />
      <div className="absolute top-[30px] left-[170px] w-[290px] rotate-[5deg] overflow-hidden rounded-[22px] bg-white px-[18px] pt-4 pb-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="pb-1 text-[14px] font-bold">{t("landing.medicines")}</div>
        <HeroRow illo="illo-bag.svg" height={24} name={t("landing.tylenol")} place={t("landing.family")} dot="#FF9500" line />
        <HeroRow illo="illo-box.svg" width={27} name={t("landing.coldShort")} place={t("landing.pharmacy")} dot="#FF3B30" line />
        <HeroRow illo="illo-bottle.svg" height={24} name={t("landing.selegiline")} place={t("landing.neuro")} dot="#FF3B30" />
        <div className="motion-scan absolute inset-x-0 top-0 h-[1.5px] bg-[#C6F53A] shadow-[0_0_0_0.5px_rgba(198,245,58,0.4)]" />
      </div>
      <div className="absolute top-[170px] left-[60px] w-80 -rotate-3 overflow-hidden rounded-[22px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.10)]">
        <div className="h-1 bg-[linear-gradient(90deg,#D4FF4F,#7DF0C6)]" />
        <div className="flex flex-col gap-2.5 px-[18px] py-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-[#A05A00] uppercase">
            <Icon name="copy-amber" size={14} />
            {t("alerts.duplicate.label")}
          </div>
          <div className="text-[18px] font-bold tracking-[-0.01em]">{t("landing.both")}</div>
          <div className="flex flex-col items-start gap-1.5">
            <span className="rounded-full bg-[#F2F2F7] px-2.5 py-[5px] text-[12px] font-semibold">
              {t("landing.tylenol")} · {t("landing.family")}
            </span>
            <span className="rounded-full bg-[#F2F2F7] px-2.5 py-[5px] text-[12px] font-semibold">
              {t("landing.coldShort")} · {t("landing.pharmacy")}
            </span>
          </div>
        </div>
      </div>
      <div className="motion-float absolute top-[340px] left-5 w-[300px]">
        <div className="flex rotate-[1.5deg] flex-col gap-3 rounded-3xl bg-white px-[22px] py-5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-medium text-[rgba(60,60,67,0.6)]">{t("landing.checked")}</div>
            <div className="h-2 w-2 rounded-full bg-[#FF3B30]" />
          </div>
          <div className="text-[26px] font-bold tracking-[-0.02em]">{t("landing.issues")}</div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgba(255,59,48,0.12)] px-3 py-1.5 text-[13px] font-semibold text-[#D70015]">{t("landing.doNot")}</span>
            <span className="rounded-full bg-[rgba(255,149,0,0.16)] px-3 py-1.5 text-[13px] font-semibold text-[#A05A00]">{t("alerts.duplicate.label")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroRow({
  illo,
  name,
  place,
  dot,
  line,
  width,
  height,
}: {
  illo: string;
  name: string;
  place: string;
  dot: string;
  line?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 py-[9px]" style={{ borderBottom: line ? "0.5px solid rgba(60,60,67,0.2)" : undefined }}>
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#F5F5F7]">
        <img src={`/brand/${illo}`} alt="" style={{ width, height }} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="text-[13px] font-semibold">{name}</div>
        <div className="text-[11px] text-[rgba(60,60,67,0.6)]">{place}</div>
      </div>
      <div className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />
    </div>
  );
}

function StepBadge({ n }: { n: string }) {
  return <div className="rounded-full border border-black bg-[#D4FF4F] px-[11px] py-[3px] text-[13px] font-bold">{n}</div>;
}

function Chip({ children, tone }: { children: ReactNode; tone: "amber" | "red" }) {
  const style =
    tone === "red"
      ? { background: "rgba(255,59,48,0.12)", color: "#D70015" }
      : { background: "rgba(255,149,0,0.16)", color: "#A05A00" };
  return (
    <span className="inline-flex w-fit max-w-full self-start rounded-full px-3 py-1.5 text-[13px] leading-none font-semibold whitespace-nowrap" style={style}>
      {children}
    </span>
  );
}

export function LandingScreen() {
  const { t } = useTranslation();
  return (
    <PageFrame flush>
      <section className="px-5 pt-[88px] lg:grid lg:grid-cols-[minmax(0,1fr)_500px] lg:items-center lg:gap-10 lg:px-20 lg:pt-24 lg:pr-[72px] lg:pb-16">
        <Reveal>
          <div className="flex flex-col gap-5 lg:gap-7">
            <div>
              <h1 className="text-[38px] leading-[1.06] font-bold tracking-[-0.03em] text-balance lg:text-[64px] lg:leading-[1.04] lg:tracking-[-0.035em]">
                {t("landing.hero1")}
              </h1>
              <p className="text-[38px] leading-[1.06] font-bold tracking-[-0.03em] text-balance text-[#A1A1A6] lg:text-[64px] lg:leading-[1.04] lg:tracking-[-0.035em]">
                {t("landing.hero2")}
              </p>
            </div>
            <p className="max-w-[520px] text-[17px] leading-[1.45] text-pretty text-[rgba(60,60,67,0.75)] lg:text-[19px]">{t("landing.heroBody")}</p>
            <div className="flex flex-col gap-3 lg:gap-4">
              <div className="flex flex-col items-stretch gap-1 md:items-center lg:flex-row lg:items-center lg:justify-start lg:gap-6">
                <Link href="/scan?fresh=1" className="w-full px-7 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:w-fit md:max-w-full" style={checkLink}>
                  {t("landing.check")}
                </Link>
                <Link href="/scan?sample=1" className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-[17px] font-semibold">
                  {t("landing.trySample")} <Icon name="arrow" />
                </Link>
              </div>
              <div className="text-center text-[13px] text-[rgba(60,60,67,0.6)] lg:pl-1 lg:text-left">{t("landing.free")}</div>
            </div>
          </div>
        </Reveal>
        <div className="relative mx-auto mt-7 h-[378px] w-[350px] max-w-full overflow-hidden md:h-[540px] md:w-[500px] lg:mx-0 lg:mt-0">
          <div className="origin-top-left scale-[0.7] md:scale-100">
            <HeroStage />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-7 px-5 py-[72px] lg:gap-14 lg:px-20 lg:py-24">
        <Reveal>
          <h2 className="text-center text-[32px] leading-[1.1] font-bold tracking-[-0.03em] text-balance lg:text-[48px] lg:leading-[1.08]">
            {t("landing.problem")}
          </h2>
        </Reveal>
        <div className="hidden w-full items-stretch lg:flex">
          <ProblemCard
            illo="illo-bag.svg"
            height={124}
            kicker={t("landing.family")}
            title={t("landing.tylenol")}
            detail={t("landing.tylenolDose")}
            chip={t("landing.acetaminophen")}
            amount={t("landing.mg1500")}
          />
          <Join mark="+" />
          <ProblemCard
            illo="illo-box.svg"
            height={116}
            kicker={t("landing.pharmacy")}
            title={t("landing.cold")}
            detail={t("landing.coldDose")}
            chip={t("landing.alsoAcetaminophen")}
            amount={t("landing.mg1300")}
          />
          <Join mark="=" lime />
          <div className="flex flex-1 flex-col gap-4 rounded-[28px] bg-white p-6 shadow-[0_0_0_1.5px_#FF9500]">
            <div className="flex h-40 flex-col items-center justify-center rounded-[20px] bg-[rgba(255,149,0,0.10)]">
              <div className="text-center text-[36px] leading-none font-bold tracking-[-0.03em] whitespace-nowrap text-[#A05A00] xl:text-[52px]">{t("landing.perDay")}</div>
              <div className="text-[15px] font-semibold text-[#A05A00]">{t("landing.aDay")}</div>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[rgba(60,60,67,0.6)]">{t("landing.together")}</div>
              <div className="text-[22px] font-bold tracking-[-0.01em]">{t("landing.closeLimit")}</div>
              <div className="text-[15px] text-[rgba(60,60,67,0.7)]">{t("landing.sameIngredient")}</div>
            </div>
            <Chip tone="amber">{t("alerts.duplicate.label")}</Chip>
          </div>
        </div>
        <div className="flex w-full flex-col lg:hidden">
          <MiniMed illo="illo-bag.svg" height={72} kicker={t("landing.family")} title={t("landing.tylenol")} detail={t("landing.mobileTylenol")} />
          <Join mark="+" vertical />
          <MiniMed illo="illo-box.svg" width={70} kicker={t("landing.pharmacy")} title={t("landing.cold")} detail={t("landing.mobileCold")} />
          <Join mark="=" lime vertical />
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_0_0_1.5px_#FF9500]">
            <div className="text-[12px] font-semibold text-[rgba(60,60,67,0.6)]">{t("landing.together")}</div>
            <div className="text-[40px] leading-none font-bold tracking-[-0.03em] text-[#A05A00]">{t("landing.mobileTogether")}</div>
            <div className="text-[16px] font-semibold">{t("landing.closeLimit")}</div>
            <Chip tone="amber">{t("alerts.duplicate.label")}</Chip>
          </div>
        </div>
        <Reveal>
          <p className="max-w-[620px] text-center text-[18px] leading-[1.45] text-balance text-[rgba(60,60,67,0.75)] lg:text-[21px]">
            {t("landing.problemClose")}
          </p>
        </Reveal>
      </section>

      <section className="flex flex-col gap-6 px-5 py-[72px] lg:gap-12 lg:px-20 lg:py-24">
        <Reveal>
          <h2 className="text-center text-[32px] leading-[1.1] font-bold tracking-[-0.03em] lg:text-[48px]">{t("landing.how")}</h2>
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          <Reveal delay={0} className="rounded-[28px] bg-white p-5 lg:rounded-[28px] lg:px-5 lg:pt-5 lg:pb-7">
            <div className="relative mb-5 h-[180px] overflow-hidden rounded-[18px] bg-[#F5F5F7] lg:h-[220px] lg:rounded-[20px]">
              <img src="/brand/illo-bag.svg" alt="" className="absolute top-[34px] left-10 w-[84px] -rotate-[7deg] lg:top-[46px] lg:left-[34px] lg:w-24" />
              <img src="/brand/illo-bottle.svg" alt="" className="absolute top-10 left-[220px] w-[62px] rotate-[8deg] lg:top-14 lg:left-[210px] lg:w-[70px]" />
              <img src="/brand/illo-box.svg" alt="" className="absolute top-[72px] left-[110px] w-[110px] -rotate-3 lg:top-[90px] lg:left-[104px] lg:w-[124px]" />
              <Corners />
              <div className="motion-scan-s absolute inset-x-7 top-[22px] hidden h-9 lg:block">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(212,255,79,0),rgba(212,255,79,0.5))]" />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#C6F53A]" />
              </div>
            </div>
            <StepCopy n="1" title={t("landing.scan")} body={t("landing.scanBody")} />
          </Reveal>
          <Reveal delay={60} className="rounded-3xl bg-white px-5 py-6 lg:rounded-[28px] lg:px-5 lg:pt-5 lg:pb-7">
            <div className="mb-4 hidden h-[220px] flex-col justify-center gap-2 rounded-[20px] bg-[#F5F5F7] p-5 lg:flex">
              <CheckRow illo="illo-bag.svg" width={20} name={t("landing.tylenol")} chip={t("landing.acetaminophen")} amber />
              <CheckRow illo="illo-box.svg" width={24} name={t("landing.coldShort")} chip={t("landing.acetaminophen")} amber />
              <CheckRow illo="illo-bottle.svg" width={16} name={t("landing.selegiline")} chip="Selegiline" />
              <div className="flex items-center gap-2 px-1 pt-1 text-[12px] text-[rgba(60,60,67,0.6)]">
                <div className="h-1 flex-1 overflow-hidden rounded-sm bg-[#E5E5EA]">
                  <div className="h-full w-[68%] rounded-sm bg-black" />
                </div>
                {t("landing.comparing")}
              </div>
            </div>
            <StepCopy n="2" title={t("landing.checkStep")} body={t("landing.checkBody")} />
          </Reveal>
          <Reveal delay={120} className="rounded-3xl bg-white px-5 py-6 lg:rounded-[28px] lg:px-5 lg:pt-5 lg:pb-7">
            <div className="relative mb-4 hidden h-[220px] overflow-hidden rounded-[20px] bg-[#F5F5F7] lg:block">
              <div className="absolute top-[26px] left-1/2 ml-[-84px] flex h-44 w-[140px] -rotate-[4deg] flex-col gap-2 rounded-xl border-[1.5px] border-black bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                <div className="h-[7px] w-[70%] rounded bg-black" />
                <div className="h-[5px] w-1/2 rounded bg-[#C7C7CC]" />
                <div className="mt-1.5 h-[22px] rounded-[7px] bg-[rgba(255,59,48,0.12)]" />
                <div className="h-[22px] rounded-[7px] bg-[rgba(255,149,0,0.16)]" />
                <div className="mt-1 h-[5px] w-[80%] rounded bg-[#C7C7CC]" />
                <div className="h-[5px] w-[60%] rounded bg-[#C7C7CC]" />
              </div>
              <div className="absolute top-[140px] left-1/2 ml-[-20px] flex items-center gap-[7px] rounded-full bg-white px-3.5 py-[9px] text-[13px] font-semibold whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <Icon name="share" size={16} />
                {t("landing.send")}
              </div>
            </div>
            <StepCopy n="3" title={t("landing.share")} body={t("landing.shareBody")} />
          </Reveal>
        </div>
      </section>

      <section className="flex flex-col gap-6 px-5 py-[72px] lg:gap-12 lg:px-20 lg:py-24">
        <Reveal>
          <h2 className="text-center text-[32px] leading-[1.1] font-bold tracking-[-0.03em] lg:text-[48px]">{t("landing.what")}</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-5">
          <Reveal className="col-span-2 flex flex-col gap-3.5 rounded-3xl bg-white p-[22px] lg:col-span-7 lg:gap-6 lg:rounded-[28px] lg:p-8">
            <BlockTitle title={t("landing.dupTitle")} body={t("landing.dupBody")} />
            <div className="hidden flex-col gap-2.5 rounded-[20px] bg-[#F5F5F7] p-[18px] text-[15px] font-semibold lg:flex">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">{t("landing.tylenol")}<span className="font-medium whitespace-nowrap text-[#A05A00]">{t("landing.acetaminophen")}</span></div>
              <div className="h-px bg-[rgba(60,60,67,0.2)]" />
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">{t("landing.coldShort")}<span className="font-medium whitespace-nowrap text-[#A05A00]">{t("landing.acetaminophen")}</span></div>
            </div>
            <Chip tone="amber">{t("alerts.duplicate.label")}</Chip>
          </Reveal>
          <Reveal delay={60} className="flex flex-col gap-3 rounded-3xl bg-white p-5 lg:col-span-5 lg:gap-6 lg:rounded-[28px] lg:p-8">
            <BlockTitle title={t("landing.doseTitle")} body={t("landing.doseBody")} small />
            <div className="mt-auto hidden flex-col gap-2.5 lg:flex">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[15px] font-semibold"><span className="whitespace-nowrap">{t("landing.acetaminophen")}</span><span className="whitespace-nowrap">2,800 mg / day</span></div>
              <div className="h-2.5 overflow-hidden rounded-[5px] bg-[#F2F2F7]"><div className="h-full w-[70%] rounded-[5px] bg-[#FF9500]" /></div>
            </div>
            <div className="mt-auto h-2 overflow-hidden rounded bg-[#F2F2F7] lg:hidden"><div className="h-full w-[70%] bg-[#FF9500]" /></div>
            <span className="hidden lg:inline-flex"><Chip tone="amber">{t("landing.near")}</Chip></span>
          </Reveal>
          <Reveal className="flex flex-col gap-3 rounded-3xl bg-white p-5 lg:col-span-5 lg:gap-6 lg:rounded-[28px] lg:p-8">
            <BlockTitle title={t("landing.pairTitle")} body={t("landing.pairBody")} small />
            <div className="mt-auto flex items-center gap-2.5">
              <Chip tone="red">{t("landing.doNot")}</Chip>
              <span className="hidden text-[13px] text-[rgba(60,60,67,0.6)] lg:inline">Source: MFDS DUR</span>
            </div>
          </Reveal>
          <Reveal delay={60} className="col-span-2 flex flex-col gap-3.5 rounded-3xl bg-white p-[22px] lg:col-span-7 lg:gap-6 lg:rounded-[28px] lg:p-8">
            <BlockTitle title={t("landing.cautionTitle")} body={t("landing.cautionBody")} />
            <div className="mt-auto flex items-center gap-2.5">
              <Chip tone="amber">{t("alerts.caution.label")}</Chip>
              <span className="hidden text-[13px] text-[rgba(60,60,67,0.6)] lg:inline">Source: FDA</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="flex flex-col items-center gap-6 px-5 py-[72px] lg:gap-10 lg:px-20 lg:py-24">
        <Reveal>
          <h2 className="text-center text-[32px] leading-[1.1] font-bold tracking-[-0.03em] lg:text-[48px]">{t("landing.live")}</h2>
        </Reveal>
        <Reveal className="flex w-full flex-col gap-3 rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.08)] lg:gap-5 lg:rounded-[32px] lg:p-7 lg:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="text-[17px] font-bold lg:text-[20px]">{t("landing.yourResults")}</div>
              <div className="rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[11px] font-semibold text-[rgba(60,60,67,0.7)] lg:text-[12px]">{t("landing.sampleData")}</div>
            </div>
            <div className="hidden gap-2 lg:flex">
              <span className="flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3.5 py-2 text-[13px] font-semibold"><Icon name="download" size={15} />{t("results.savePdf")}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3.5 py-2 text-[13px] font-semibold"><Icon name="share" size={15} />{t("results.share")}</span>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-4">
            <div className="relative flex min-h-[120px] flex-col gap-2.5 overflow-hidden rounded-[20px] bg-[#F5F5F7] p-5 lg:min-h-60 lg:gap-3 lg:rounded-3xl lg:p-6">
              <div className="absolute -top-[60px] -right-[60px] h-[170px] w-[170px] rounded-full lg:-top-[70px] lg:-right-[70px] lg:h-[220px] lg:w-[220px]" style={{ background: "radial-gradient(circle at 40% 40%,#D4FF4F 0%,#7DF0C6 70%,rgba(125,240,198,0) 100%)" }} />
              <div className="relative text-[13px] text-[rgba(60,60,67,0.7)]">{t("landing.checked")}</div>
              <div className="relative text-[28px] font-bold tracking-[-0.02em] lg:text-[34px]">{t("landing.issues")}</div>
              <div className="relative mt-auto hidden flex-col gap-1.5 text-[14px] lg:flex">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF3B30]" />{t("landing.onePair")}</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF9500]" />{t("landing.oneDup")}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SampleAlert icon="octagon-red" tone="red" label={t("landing.doNot")} title={t("landing.coldSelegiline")} detail={t("landing.pseudo")} />
              <SampleAlert icon="copy-amber" tone="amber" label={t("alerts.duplicate.label")} title={t("landing.tylenolCold")} detail={t("landing.bothDetail")} />
            </div>
          </div>
        </Reveal>
        <Link href="/scan?sample=1" className="w-full px-7 py-4 md:w-fit md:max-w-full" style={checkLink}>{t("landing.tryPhotos")}</Link>
      </section>

      <section className="flex flex-col items-center gap-6 px-5 py-[72px] lg:gap-12 lg:px-20 lg:py-24">
        <Reveal><h2 className="text-[32px] leading-[1.1] font-bold tracking-[-0.03em] lg:text-[48px]">{t("landing.trust")}</h2></Reveal>
        <div className="hidden w-full grid-cols-3 gap-5 lg:grid">
          <Trust icon="eyeoff" label={t("landing.photos")} />
          <Trust icon="userx" label={t("landing.noAccount")} />
          <Trust icon="book" label={t("landing.sources")} />
        </div>
        <div className="flex w-full flex-col rounded-3xl bg-white px-5 lg:hidden">
          <TrustRow icon="eyeoff" label={t("landing.photos")} />
          <TrustRow icon="userx" label={t("landing.noAccount")} />
          <TrustRow icon="book" label={t("landing.sources")} last />
        </div>
        <p className="text-center text-[14px] leading-[1.5] text-[rgba(60,60,67,0.7)] lg:text-[15px]">{t("landing.trustNote")}</p>
      </section>

      <section className="flex flex-col items-center gap-6 px-5 py-[72px] lg:gap-12 lg:px-20 lg:py-24">
        <Reveal><h2 className="text-[32px] leading-[1.1] font-bold tracking-[-0.03em] lg:text-[48px]">{t("landing.who")}</h2></Reveal>
        <div className="hidden w-full grid-cols-3 gap-5 lg:grid">
          <Who icon="pill" label={t("landing.several")} />
          <Who icon="users" label={t("landing.caregivers")} />
          <div className="flex flex-col gap-5 rounded-3xl bg-white p-7">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F2F2F7]"><Icon name="languages" size={24} /></span>
              <span className="flex gap-1.5">
                <span className="rounded-full bg-[#D4FF4F] px-2.5 py-1 text-[12px] font-bold">EN</span>
                <span className="rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[12px] font-bold">KO</span>
              </span>
            </div>
            <div className="text-[20px] leading-[1.3] font-semibold">{t("landing.visitors")}</div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 lg:hidden">
          <WhoRow icon="pill" label={t("landing.several")} />
          <WhoRow icon="users" label={t("landing.caregivers")} />
          <div className="flex items-center gap-3.5 rounded-[20px] bg-white p-[18px]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2F2F7]"><Icon name="languages" size={22} /></span>
            <div className="text-[17px] leading-[1.3] font-semibold">
              {t("landing.visitors")} <span className="ml-1 rounded-full bg-[#D4FF4F] px-2 py-0.5 text-[12px] font-bold whitespace-nowrap">EN/KO</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-6 pb-[72px] lg:px-20 lg:pt-12 lg:pb-24">
        <div className="relative flex h-[380px] flex-col items-center justify-center gap-7 overflow-hidden rounded-[32px] bg-white px-6 lg:h-[440px] lg:gap-8 lg:rounded-[40px]">
          <div className="motion-drift absolute top-1/2 left-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 lg:h-[560px] lg:w-[560px]">
            <div className="absolute inset-0 rounded-full blur-[8px]" style={{ background: "radial-gradient(circle at 42% 38%,#D4FF4F 0%,#B6FA7A 38%,#7DF0C6 72%,rgba(125,240,198,0) 100%)" }} />
            <div className="absolute inset-0 rounded-full opacity-35 mix-blend-multiply" style={{ backgroundImage: "url(/brand/grain.svg)", WebkitMaskImage: "radial-gradient(circle,#000 55%,transparent 72%)", maskImage: "radial-gradient(circle,#000 55%,transparent 72%)" }} />
          </div>
          <h2 className="relative max-w-[760px] text-center text-[36px] leading-[1.08] font-bold tracking-[-0.03em] lg:text-[60px] lg:leading-[1.05] lg:tracking-[-0.035em]">{t("landing.cta")}</h2>
          <Link href="/scan?fresh=1" className="relative w-full px-7 py-4 md:w-fit md:max-w-full" style={checkLink}>{t("landing.check")}</Link>
        </div>
      </section>

      <footer className="grid gap-6 border-t border-[rgba(60,60,67,0.2)] px-5 py-8 text-[13px] leading-[1.55] text-[rgba(60,60,67,0.7)] lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-10 lg:px-20 lg:pt-12 lg:pb-14">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="h-[9px] w-5 border-[1.5px] border-black lg:h-2.5 lg:w-[22px]" style={{ borderRadius: 999, background: "linear-gradient(90deg,#000 50%,#D4FF4F 50%)", transform: "rotate(-35deg)" }} />
            <span className="text-[16px] font-bold tracking-[-0.02em] text-black lg:text-[17px]">PillCheck</span>
          </div>
          <div className="max-w-[320px]">{t("landing.blurb")}</div>
        </div>
        <div className="hidden flex-col gap-2 lg:flex">
          <div className="font-semibold text-black">{t("landing.data")}</div>
          <div>{t("landing.dataList")}</div>
          <div>{t("landing.fda")}</div>
          <div>{t("landing.nih")}</div>
        </div>
        <div className="hidden flex-col gap-2 lg:flex">
          <div className="font-semibold text-black">{t("landing.built")}</div>
          <div>{t("landing.advice")}</div>
        </div>
        <div className="lg:hidden"><span className="font-semibold text-black">{t("landing.data")}</span> · {t("landing.dataList")} · {t("landing.fda")} · {t("landing.nih")}</div>
        <div className="lg:hidden"><span className="font-semibold text-black">{t("landing.built")}.</span> {t("landing.advice")}</div>
      </footer>
    </PageFrame>
  );
}

function ProblemCard({
  illo, height, kicker, title, detail, chip, amount,
}: { illo: string; height: number; kicker: string; title: string; detail: string; chip: string; amount: string }) {
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-[28px] bg-white p-6">
      <div className="flex h-40 items-center justify-center rounded-[20px] bg-[#F5F5F7]">
        <img src={`/brand/${illo}`} alt="" style={{ height, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.10))" }} />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-[rgba(60,60,67,0.6)]">{kicker}</div>
        <div className="text-[22px] font-bold tracking-[-0.01em]">{title}</div>
        <div className="text-[15px] text-[rgba(60,60,67,0.7)]">{detail}</div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="shrink-0 rounded-full bg-[#F2F2F7] px-3 py-1.5 text-[13px] leading-none font-semibold whitespace-nowrap">{chip}</span>
        <span className="shrink-0 text-[15px] font-semibold whitespace-nowrap">{amount}</span>
      </div>
    </div>
  );
}

function Join({ mark, lime = false, vertical = false }: { mark: string; lime?: boolean; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="relative flex h-11 items-center justify-center">
        <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-black" />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-black text-[18px] font-semibold" style={{ background: lime ? "#D4FF4F" : "#fff" }}>{mark}</div>
      </div>
    );
  }
  return (
    <div className="relative flex w-16 items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-[1.5px] bg-black" />
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-black text-[20px] font-semibold" style={{ background: lime ? "#D4FF4F" : "#fff" }}>{mark}</div>
    </div>
  );
}

function MiniMed({ illo, kicker, title, detail, width, height }: { illo: string; kicker: string; title: string; detail: string; width?: number; height?: number }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-4">
      <div className="flex h-24 w-[84px] shrink-0 items-center justify-center rounded-2xl bg-[#F5F5F7]">
        <img src={`/brand/${illo}`} alt="" style={{ width, height }} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-[rgba(60,60,67,0.6)]">{kicker}</div>
        <div className="text-[18px] font-bold">{title}</div>
        <div className="text-[14px] break-keep text-[rgba(60,60,67,0.7)]">{detail}</div>
      </div>
    </div>
  );
}

function Corners() {
  const corner = "absolute h-[18px] w-[18px] border-black border-[3px] lg:h-[22px] lg:w-[22px]";
  return (
    <>
      <div className={`${corner} top-[18px] left-[18px] rounded-tl-[7px] border-r-0 border-b-0 lg:top-[22px] lg:left-[22px] lg:rounded-tl-lg`} />
      <div className={`${corner} top-[18px] right-[18px] rounded-tr-[7px] border-b-0 border-l-0 lg:top-[22px] lg:right-[22px] lg:rounded-tr-lg`} />
      <div className={`${corner} bottom-[18px] left-[18px] rounded-bl-[7px] border-t-0 border-r-0 lg:bottom-[22px] lg:left-[22px] lg:rounded-bl-lg`} />
      <div className={`${corner} right-[18px] bottom-[18px] rounded-br-[7px] border-t-0 border-l-0 lg:right-[22px] lg:bottom-[22px] lg:rounded-br-lg`} />
    </>
  );
}

function StepCopy({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1.5 px-1 lg:gap-2 lg:px-2">
      <div className="flex items-center gap-2.5"><StepBadge n={n} /><div className="text-[20px] font-bold lg:text-[22px]">{title}</div></div>
      <div className="text-[16px] leading-[1.45] text-[rgba(60,60,67,0.75)]">{body}</div>
    </div>
  );
}

function CheckRow({ illo, width, name, chip, amber = false }: { illo: string; width: number; name: string; chip: string; amber?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-[14px] bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="flex shrink-0 items-center gap-2.5">
        <img src={`/brand/${illo}`} alt="" className="shrink-0" style={{ width }} />
        <div className="text-[14px] font-semibold whitespace-nowrap">{name}</div>
      </div>
      <div className="shrink-0 rounded-full px-2 py-[3px] text-[11px] leading-none font-semibold whitespace-nowrap" style={amber ? { background: "rgba(255,149,0,0.16)", color: "#A05A00" } : { background: "#F2F2F7" }}>{chip}</div>
    </div>
  );
}

function BlockTitle({ title, body, small = false }: { title: string; body: string; small?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={small ? "text-[17px] leading-[1.25] font-bold lg:text-[26px] lg:tracking-[-0.01em]" : "text-[19px] font-bold lg:text-[26px] lg:tracking-[-0.01em]"}>{title}</div>
      <div className="text-[14px] text-[rgba(60,60,67,0.75)] lg:text-[16px]">{body}</div>
    </div>
  );
}

function SampleAlert({ icon, tone, label, title, detail }: { icon: string; tone: "red" | "amber"; label: string; title: string; detail: string }) {
  const color = tone === "red" ? "#D70015" : "#A05A00";
  const box = tone === "red" ? "rgba(255,59,48,0.06)" : "rgba(255,149,0,0.07)";
  const ring = tone === "red" ? "rgba(255,59,48,0.25)" : "rgba(255,149,0,0.3)";
  return (
    <div className="flex gap-3 rounded-[18px] px-4 py-3.5 lg:gap-3.5 lg:rounded-[20px] lg:px-5 lg:py-[18px]" style={{ background: box, boxShadow: `inset 0 0 0 1px ${ring}` }}>
      <Icon name={icon} size={20} />
      <div className="flex flex-col gap-1">
        <div className="text-[11px] font-bold tracking-[0.04em] uppercase lg:text-[12px]" style={{ color }}>{label}</div>
        <div className="text-[15px] font-semibold lg:text-[17px]">{title}</div>
        <div className="hidden text-[14px] text-[rgba(60,60,67,0.7)] lg:block">{detail}</div>
      </div>
    </div>
  );
}

function Trust({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] bg-white p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4FF4F]"><Icon name={icon} size={26} /></div>
      <div className="text-center text-[20px] font-semibold">{label}</div>
    </div>
  );
}

function TrustRow({ icon, label, last = false }: { icon: string; label: string; last?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5" style={{ borderBottom: last ? undefined : "0.5px solid rgba(60,60,67,0.2)" }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4FF4F]"><Icon name={icon} size={20} /></div>
      <div className="text-[17px] font-semibold">{label}</div>
    </div>
  );
}

function Who({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F2F2F7]"><Icon name={icon} size={24} /></span>
      <div className="text-[20px] leading-[1.3] font-semibold">{label}</div>
    </div>
  );
}

function WhoRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] bg-white p-[18px]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2F2F7]"><Icon name={icon} size={22} /></span>
      <div className="text-[17px] font-semibold">{label}</div>
    </div>
  );
}
