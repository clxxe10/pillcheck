"use client";

import { Disclaimer, PageFrame, TitleBlock } from "@/components/chrome";
import { useDemoOnly } from "@/components/demo-mode";
import {
  CameraIcon,
  ChevronIcon,
  CloseIcon,
  ImageIcon,
  InfoIcon,
  PencilIcon,
  PinIcon,
  RefreshIcon,
  UploadIcon,
} from "@/components/icons";
import { photoStripe } from "@/components/orb";
import { analyzeLabel, photoCountLabel, photoPlaceLabel } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import {
  addFiles,
  groupPhotos,
  loadSamplePhotos,
  removePhoto,
  resetScan,
  replacePhoto,
  setClinic,
  ungroupPhotos,
  showSampleError,
  startAnalysis,
  useScan,
  type ScanNotice,
} from "@/lib/scan-store";
import type { ScanPhoto } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const mono = 'ui-monospace, "SF Mono", Menlo, monospace';

export function ScanScreen({
  initialError = false,
  initialSample = false,
  initialFresh = false,
}: {
  initialError?: boolean;
  initialSample?: boolean;
  initialFresh?: boolean;
}) {
  const { t, lang } = useTranslation();
  const demoOnly = useDemoOnly();
  const router = useRouter();
  const { photos, notice } = useScan();
  const libraryRef = useRef<HTMLInputElement>(null);
  const retakeRef = useRef<HTMLInputElement>(null);
  const retakeId = useRef<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) {
      loadSamplePhotos();
      showSampleError();
      return;
    }
    if (initialSample) {
      loadSamplePhotos();
      return;
    }
    if (initialFresh) resetScan();
  }, [initialError, initialSample, initialFresh]);

  const readable = photos.filter((photo) => !photo.unreadable).length;
  const errorPhotos = photos.filter((photo) => photo.unreadable);

  function addList(list: FileList | null) {
    if (list && list.length > 0) addFiles(Array.from(list));
  }

  function remove(id: string) {
    removePhoto(id);
    if (editingId === id) setEditingId(null);
  }

  function retake(id: string) {
    retakeId.current = id;
    retakeRef.current?.click();
  }

  function analyze() {
    const fallback = (index: number) => (lang === "ko" ? `사진 ${index + 1}` : `Photo ${index + 1}`);
    if (startAnalysis(fallback)) router.push("/analyzing");
  }

  return (
    <PageFrame>
      {demoOnly ? null : (
        <>
          <input
            ref={libraryRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="sr-only"
            onChange={(event) => {
              addList(event.target.files);
              event.target.value = "";
            }}
          />
          <input
            ref={retakeRef}
            type="file"
            accept="image/*,.heic,.heif"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file && retakeId.current) replacePhoto(retakeId.current, file);
              retakeId.current = null;
              event.target.value = "";
            }}
          />
        </>
      )}

      <div className="flex flex-1 flex-col">
        <TitleBlock line1={t("scanScreen.line1")} line2={t("scanScreen.line2")} />

        <div className="mt-6 lg:mt-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
          <Dropzone
            demoOnly={demoOnly}
            onBrowse={() => libraryRef.current?.click()}
            onFiles={addList}
            onSamples={loadSamplePhotos}
          />

          <div className="flex flex-col">
            <div className="order-1 mx-0.5 mt-[30px] mb-3 flex items-center justify-between lg:hidden">
              <h2 style={{ margin: 0, fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em" }}>
                {photoCountLabel(photos.length, lang)}
              </h2>
              <span style={{ fontWeight: 400, fontSize: 16, color: "#6B6B72" }}>{t("scanScreen.tapEdit")}</span>
            </div>

            {notice ? (
              <div className="order-2 mb-3 lg:order-1">
                <NoticeCard
                  notice={notice}
                  onRetry={analyze}
                  onSamples={loadSamplePhotos}
                  disabled={readable === 0}
                />
              </div>
            ) : null}

            {errorPhotos.map((photo) => (
              <div key={photo.id} className="order-2 mb-3 lg:order-1">
                <ErrorCard
                  photo={photo}
                  index={photos.indexOf(photo) + 1}
                  onRetake={() => retake(photo.id)}
                  onRemove={() => remove(photo.id)}
                  allowRetake={!demoOnly}
                />
              </div>
            ))}

            <div
              className="order-3 lg:order-2 lg:bg-white lg:px-6"
              style={{ borderRadius: 24 }}
            >
              <div className="hidden items-center justify-between border-b border-[#EDEDF0] py-[18px] pb-3.5 lg:flex">
                <h2 style={{ margin: 0, fontWeight: 500, fontSize: 22 }}>{photoCountLabel(photos.length, lang)}</h2>
                <span style={{ fontWeight: 400, fontSize: 15, color: "#6B6B72" }}>{t("scanScreen.clickEdit")}</span>
              </div>

              <div className="lg:py-[18px]">
                {photos.length === 0 ? (
                  <EmptyArt />
                ) : (
                  <PhotoGrid
                    photos={photos}
                    editingId={editingId}
                    onEdit={setEditingId}
                    onClinic={setClinic}
                    onRemove={remove}
                    onGroup={groupPhotos}
                    onUngroup={ungroupPhotos}
                  />
                )}
              </div>

              <div className="mt-[18px] lg:mt-0 lg:border-t lg:border-[#EDEDF0] lg:py-3.5">
                <Hint />
              </div>

              <div className="hidden pt-1 pb-[22px] lg:block">
                <AnalyzeButton label={analyzeLabel(readable, lang)} disabled={readable === 0} onClick={analyze} />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden h-8 lg:block" />
        <Disclaimer className="lg:mx-0 lg:mt-auto" />
        <div
          className="sticky bottom-0 z-20 -mx-4 mt-4 px-4 pt-5 pb-7 lg:hidden"
          style={{ background: "linear-gradient(rgba(245,245,247,0), #F5F5F7 35%)" }}
        >
          <AnalyzeButton label={analyzeLabel(readable, lang)} disabled={readable === 0} onClick={analyze} />
        </div>
      </div>
    </PageFrame>
  );
}

const dropzoneBox = {
  border: "2px dashed #C7C7CC",
  borderRadius: 24,
  background: "rgba(255,255,255,.6)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
} as const;

function Dropzone({
  demoOnly,
  onBrowse,
  onFiles,
  onSamples,
}: {
  demoOnly: boolean;
  onBrowse: () => void;
  onFiles: (files: FileList | null) => void;
  onSamples: () => void;
}) {
  const { t } = useTranslation();
  if (demoOnly) {
    return (
      <div className="gap-4 px-5 py-[26px] lg:min-h-[460px] lg:gap-5 lg:p-10" style={dropzoneBox}>
        <p className="max-w-[360px] text-[16px] leading-[1.45] text-pretty text-[#4A4A50] lg:text-[17px]">
          {t("scanScreen.demoPaused")}
        </p>
        <button
          type="button"
          onClick={onSamples}
          className="h-12 px-5 text-[16px] lg:h-[52px] lg:px-6 lg:text-[17px]"
          style={{
            borderRadius: 9999,
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
          }}
        >
          {t("scanScreen.trySamples")}
        </button>
      </div>
    );
  }
  return (
    <div
      className="gap-3 px-5 py-[26px] lg:min-h-[460px] lg:gap-3.5 lg:p-10"
      style={dropzoneBox}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFiles(event.dataTransfer.files);
      }}
    >
      <span
        className="h-14 w-14 lg:h-[72px] lg:w-[72px]"
        style={{
          borderRadius: 9999,
          background: "#111",
          color: "#D4FF4F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="lg:hidden">
          <CameraIcon />
        </span>
        <span className="hidden lg:block">
          <UploadIcon />
        </span>
      </span>
      <div className="text-[20px] font-semibold lg:text-[26px] lg:font-medium lg:tracking-[-0.01em]">
        <span className="lg:hidden">{t("scanScreen.takePhoto")}</span>
        <span className="hidden lg:inline">{t("scanScreen.drop")}</span>
      </div>
      <div className="text-[16px] lg:text-[17px]" style={{ fontWeight: 400, lineHeight: 1.4, color: "#6B6B72" }}>
        <span className="lg:hidden">{t("scanScreen.oneEach")}</span>
        <span className="hidden lg:inline">{t("scanScreen.dropHint")}</span>
      </div>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-1 h-12 px-5 text-[16px] lg:mt-1.5 lg:h-[52px] lg:px-6 lg:text-[17px]"
        style={{
          border: "1px solid #E3E3E7",
          borderRadius: 9999,
          background: "#fff",
          fontWeight: 500,
          color: "#111",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ImageIcon />
        <span className="lg:hidden">{t("scanScreen.choosePhotos")}</span>
        <span className="hidden lg:inline">{t("scanScreen.chooseFiles")}</span>
      </button>
      <button
        type="button"
        onClick={onSamples}
        className="text-[15px] lg:text-[16px]"
        style={{
          border: 0,
          background: "transparent",
          fontWeight: 500,
          color: "#111",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        {t("scanScreen.trySamples")}
      </button>
    </div>
  );
}

function EmptyArt() {
  const { t } = useTranslation();
  return (
    <div className="relative flex h-[280px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px] bg-white lg:h-[320px]">
      <div
        className="absolute top-6 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-75 lg:h-[200px] lg:w-[200px]"
        style={{ background: "radial-gradient(circle at 40% 38%,#D4FF4F 0%,#B6FA7A 38%,#7DF0C6 72%,rgba(125,240,198,0) 100%)" }}
      />
      <div className="relative h-[140px] w-[220px] lg:h-[170px] lg:w-[260px]">
        <img src="/brand/illo-bag.svg" alt="" className="absolute top-1 left-2 w-[84px] -rotate-[8deg] lg:w-24" />
        <img src="/brand/illo-bottle.svg" alt="" className="absolute top-2 left-[148px] w-[58px] rotate-[9deg] lg:left-[170px] lg:w-[70px]" />
        <img src="/brand/illo-box.svg" alt="" className="absolute top-12 left-14 w-[100px] -rotate-[4deg] lg:top-16 lg:w-[124px]" />
        <img src="/brand/illo-capsule.svg" alt="" className="absolute top-[108px] left-[176px] w-8 -rotate-[20deg] lg:top-[132px] lg:left-[210px] lg:w-[38px]" />
      </div>
      <div className="relative px-6 text-center">
        <div className="text-[19px] font-semibold">{t("landing.emptyTitle")}</div>
        <div className="text-[14px] text-[rgba(60,60,67,0.7)]">{t("landing.emptyBody")}</div>
      </div>
    </div>
  );
}

function photoClusters(photos: ScanPhoto[]) {
  const seen = new Set<string>();
  const clusters: ScanPhoto[][] = [];
  for (const photo of photos) {
    if (photo.groupId) {
      if (seen.has(photo.groupId)) continue;
      seen.add(photo.groupId);
      clusters.push(photos.filter((item) => item.groupId === photo.groupId));
    } else {
      clusters.push([photo]);
    }
  }
  return clusters;
}

function PhotoGrid({
  photos,
  editingId,
  onEdit,
  onClinic,
  onRemove,
  onGroup,
  onUngroup,
}: {
  photos: ScanPhoto[];
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onClinic: (id: string, clinic: string) => void;
  onRemove: (id: string) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (groupId: string) => void;
}) {
  const { t, lang } = useTranslation();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const hold = useRef<number | null>(null);
  const held = useRef(false);

  const clusters = photoClusters(photos);
  const selectedIds = selected.filter((id) => photos.some((photo) => photo.id === id));
  const selectedGroups = new Set(
    photos.filter((photo) => selectedIds.includes(photo.id)).map((photo) => photo.groupId ?? photo.id),
  );

  function toggle(ids: string[]) {
    setSelected((current) => {
      const present = ids.every((id) => current.includes(id));
      return present ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])];
    });
  }

  function beginSelect(ids: string[]) {
    held.current = true;
    setSelecting(true);
    setSelected((current) => [...new Set([...current, ...ids])]);
  }

  return (
    <div>
      {photos.length >= 2 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelecting((value) => !value);
              setSelected([]);
            }}
            className="h-11 rounded-full border border-[#E3E3E7] bg-white px-4 text-[15px] font-medium"
          >
            {selecting ? t("scanScreen.selectingDone") : t("scanScreen.select")}
          </button>
          {selecting && selectedIds.length >= 2 && selectedGroups.size > 1 ? (
            <button
              type="button"
              onClick={() => {
                onGroup(selectedIds);
                setSelecting(false);
                setSelected([]);
              }}
              className="h-11 rounded-full bg-black px-4 text-[15px] font-medium text-white"
            >
              {t("scanScreen.group")}
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-2.5">
        {clusters.map((group) => {
          const lead = group[0];
          const ids = group.map((photo) => photo.id);
          const grouped = group.length > 1 && Boolean(lead.groupId);
          const isSelected = ids.every((id) => selectedIds.includes(id));
          return (
            <div key={lead.groupId ?? lead.id} className="flex min-w-0 flex-col gap-2">
              <div
                style={{
                  position: "relative",
                  aspectRatio: "3 / 4",
                  borderRadius: 18,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 8,
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: 11,
                  color: "#6B6B72",
                  boxShadow: isSelected || group.some((photo) => photo.unreadable) ? "inset 0 0 0 2px #111" : undefined,
                  ...photoStripe(),
                }}
                onPointerDown={() => {
                  held.current = false;
                  if (hold.current) window.clearTimeout(hold.current);
                  hold.current = window.setTimeout(() => beginSelect(ids), 450);
                }}
                onPointerUp={() => {
                  if (hold.current) window.clearTimeout(hold.current);
                }}
                onPointerLeave={() => {
                  if (hold.current) window.clearTimeout(hold.current);
                }}
                onContextMenu={(event) => event.preventDefault()}
                onClick={() => {
                  if (held.current) {
                    held.current = false;
                    return;
                  }
                  if (selecting) toggle(ids);
                }}
              >
                {group.slice(0, 3).map((photo, index) =>
                  photo.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                    <img
                      key={photo.id}
                      src={photo.previewUrl}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: grouped ? 10 : 0,
                        width: grouped ? undefined : "100%",
                        height: grouped ? undefined : "100%",
                        objectFit: "cover",
                        borderRadius: grouped ? 12 : 0,
                        transform: grouped ? `rotate(${(index - 1) * 7}deg)` : undefined,
                        zIndex: index + 1,
                        boxShadow: grouped ? "0 6px 14px rgba(0,0,0,.16)" : undefined,
                      }}
                    />
                  ) : (
                    <span key={photo.id} style={{ position: "relative", zIndex: 1 }}>
                      {photo.filename}
                    </span>
                  ),
                )}
                {grouped ? (
                  <span
                    style={{
                      position: "absolute",
                      left: 8,
                      bottom: 8,
                      zIndex: 5,
                      borderRadius: 9999,
                      background: "#111",
                      color: "#fff",
                      padding: "4px 8px",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      fontSize: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {photoCountLabel(group.length, lang)}
                  </span>
                ) : null}
                {group.some((photo) => photo.unreadable) ? (
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 4,
                      background: "rgba(17,17,17,.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <RefreshIcon size={28} />
                  </span>
                ) : null}
                {selecting ? (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 6,
                      width: 22,
                      height: 22,
                      borderRadius: 9999,
                      border: "2px solid #fff",
                      background: isSelected ? "#111" : "rgba(17,17,17,.35)",
                      boxShadow: "0 0 0 1px #111",
                    }}
                  />
                ) : null}
                <button
                  type="button"
                  aria-label={t("removePhoto")}
                  onClick={(event) => {
                    event.stopPropagation();
                    for (const id of ids) onRemove(id);
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    zIndex: 6,
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: "rgba(17,17,17,.72)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
              {grouped ? (
                <button
                  type="button"
                  onClick={() => onUngroup(lead.groupId as string)}
                  style={{
                    minHeight: 44,
                    padding: "6px 10px",
                    border: "1px solid #E3E3E7",
                    borderRadius: 14,
                    background: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "#111",
                  }}
                >
                  {t("scanScreen.ungroup")}
                </button>
              ) : editingId === lead.id ? (
                <input
                  autoFocus
                  value={lead.clinic}
                  maxLength={60}
                  placeholder={t("scanScreen.addClinic")}
                  onChange={(event) => onClinic(lead.id, event.target.value)}
                  onBlur={() => onEdit(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onEdit(null);
                  }}
                  style={{
                    minHeight: 44,
                    padding: "6px 10px",
                    border: "1.5px solid #111",
                    borderRadius: 14,
                    background: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: 1.25,
                    color: "#111",
                    outline: "none",
                    width: "100%",
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (selecting) toggle(ids);
                    else onEdit(lead.id);
                  }}
                  style={{
                    minHeight: 44,
                    padding: "6px 10px",
                    border: "1px solid #E3E3E7",
                    borderRadius: 14,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    textAlign: "left",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: 1.25,
                    color: "#111",
                  }}
                >
                  <span className="min-w-0" style={lead.clinic ? undefined : { color: "#6B6B72" }}>
                    {lead.clinic || t("scanScreen.addClinic")}
                  </span>
                  <span style={{ color: "#6B6B72", display: "flex", flex: "none" }}>
                    <PencilIcon />
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NoticeCard({
  notice,
  onRetry,
  onSamples,
  disabled,
}: {
  notice: ScanNotice;
  onRetry: () => void;
  onSamples: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const limited = notice.kind === "rate_limited" || notice.kind === "quota";
  const paused = notice.kind === "failed" && notice.code === "demo_only";
  const failKey =
    notice.kind === "rate_limited"
      ? "rateBody"
      : notice.kind === "quota"
        ? "quotaBody"
        : notice.code === "timeout"
        ? "fail_timeout"
        : notice.code === "invalid_response"
          ? "fail_invalid"
          : notice.code === "not_configured"
            ? "fail_config"
            : notice.code === "bad_request"
              ? "fail_request"
              : notice.code === "demo_only"
                ? "demoPaused"
                : "fail_generic";
  return (
    <div className="px-[18px]" style={{ background: "#fff", borderRadius: 24 }}>
      <div
        style={{
          padding: "16px 0 14px",
          borderBottom: "1px solid #EDEDF0",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 19, lineHeight: 1.25 }}>
          {t(
            notice.kind === "rate_limited"
              ? "scanScreen.rateTitle"
              : notice.kind === "quota"
                ? "scanScreen.quotaTitle"
                : "scanScreen.failTitle",
          )}
        </span>
        <span style={{ display: "flex", gap: 10, fontWeight: 400, fontSize: 16, lineHeight: 1.45, color: "#4A4A50" }}>
          <span style={{ flex: "none", display: "flex", color: "#6B6B72" }}>
            <InfoIcon />
          </span>
          <span>
            {t(`scanScreen.${failKey}`)}
            {limited ? ` ${t("scanScreen.rateSample")}` : ""}
          </span>
        </span>
      </div>
      <div style={{ padding: "12px 0 16px", display: "flex", gap: 8, alignItems: "center" }}>
        {paused ? null : (
          <button
            type="button"
            onClick={onRetry}
            disabled={disabled}
            style={{ ...primaryAction, opacity: disabled ? 0.4 : 1 }}
          >
            <span style={{ color: "#D4FF4F", display: "flex" }}>
              <RefreshIcon />
            </span>
            {t("scanScreen.tryAgain")}
          </button>
        )}
        {limited || paused ? (
          <button
            type="button"
            onClick={onSamples}
            style={{
              height: 48,
              padding: "0 8px",
              background: "transparent",
              color: "#111",
              fontWeight: 500,
              fontSize: 15,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {t("scanScreen.trySamples")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

const primaryAction = {
  height: 48,
  padding: "0 20px",
  border: "1.5px solid #D4FF4F",
  borderRadius: 9999,
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  gap: 8,
} as const;

function ErrorCard({
  photo,
  index,
  onRetake,
  onRemove,
  allowRetake,
}: {
  photo: ScanPhoto;
  index: number;
  onRetake: () => void;
  onRemove: () => void;
  allowRetake: boolean;
}) {
  const { t, lang } = useTranslation();
  return (
    <div className="px-[18px]" style={{ background: "#fff", borderRadius: 24 }}>
      <div
        style={{
          padding: "16px 0 14px",
          borderBottom: "1px solid #EDEDF0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 64,
            flex: "none",
            borderRadius: 12,
            ...photoStripe(),
            ...(photo.previewUrl
              ? { backgroundImage: `url("${photo.previewUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }
              : {}),
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 19, lineHeight: 1.25 }}>{t("scanScreen.unreadable")}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, fontSize: 15, color: "#6B6B72" }}>
            <PinIcon />
            {photoPlaceLabel(index, photo.clinic || t("scanScreen.addClinic"), lang)}
          </span>
        </div>
      </div>
      <div
        style={{
          padding: "14px 0",
          borderBottom: "1px solid #EDEDF0",
          display: "flex",
          gap: 10,
          fontWeight: 400,
          fontSize: 16,
          lineHeight: 1.45,
          color: "#4A4A50",
        }}
      >
        <span style={{ flex: "none", display: "flex", color: "#6B6B72" }}>
          <InfoIcon />
        </span>
        {t(`scanScreen.${photo.unreadable ?? "other"}`)}
      </div>
      <div style={{ padding: "12px 0 16px", display: "flex", gap: 8, alignItems: "center" }}>
        {allowRetake ? (
          <button type="button" onClick={onRetake} style={primaryAction}>
            <span style={{ color: "#D4FF4F", display: "flex" }}>
              <RefreshIcon />
            </span>
            {t("scanScreen.retake")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          style={{
            height: 48,
            padding: "0 16px",
            background: "transparent",
            fontWeight: 500,
            fontSize: 16,
            color: "#111",
          }}
        >
          {t("scanScreen.remove")}
        </button>
      </div>
    </div>
  );
}

function Hint() {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 400, fontSize: 15, lineHeight: 1.4, color: "#4A4A50" }}>
      <span style={{ flex: "none", color: "#6B6B72", display: "flex" }}>
        <InfoIcon />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span>{t("scanScreen.clear")}</span>
        <span>{t("scanScreen.roundBottle")}</span>
        <span>{t("scanScreen.ingredientPanel")}</span>
      </span>
    </div>
  );
}

function AnalyzeButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        height: 60,
        borderRadius: 9999,
        background: "#111",
        color: "#fff",
        fontWeight: 600,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
      <span style={{ color: "#D4FF4F", display: "flex" }}>
        <ChevronIcon size={22} strokeWidth={1.8} />
      </span>
    </button>
  );
}
