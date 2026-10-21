"use client";

import {
  BackButton,
  Disclaimer,
  LangToggle,
  PageFrame,
  TitleBlock,
} from "@/components/chrome";
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
  loadSamplePhotos,
  removePhoto,
  replacePhoto,
  setClinic,
  showSampleError,
  startAnalysis,
  useScan,
  type ScanNotice,
} from "@/lib/scan-store";
import type { ScanPhoto } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const mono = 'ui-monospace, "SF Mono", Menlo, monospace';

export function ScanScreen({ initialError = false }: { initialError?: boolean }) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const { photos, notice } = useScan();
  const libraryRef = useRef<HTMLInputElement>(null);
  const retakeRef = useRef<HTMLInputElement>(null);
  const retakeId = useRef<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) showSampleError();
  }, [initialError]);

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
    <PageFrame
      active={null}
      header={
        <>
          <div className="flex items-center justify-between lg:hidden">
            <BackButton />
            <LangToggle />
          </div>
          <div className="hidden items-start justify-between gap-6 lg:flex">
            <TitleBlock line1={t("scanScreen.line1")} line2={t("scanScreen.line2")} />
            <LangToggle wide />
          </div>
        </>
      }
      mobileBar={
        <div
          className="lg:hidden"
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: "auto",
            padding: "20px 16px 30px",
            background: "linear-gradient(rgba(242,242,244,0), #F2F2F4 35%)",
            zIndex: 20,
          }}
        >
          <AnalyzeButton label={analyzeLabel(readable, lang)} disabled={readable === 0} onClick={analyze} />
        </div>
      }
    >
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

      <div className="flex flex-1 flex-col pt-[22px] lg:pt-0">
        <div className="lg:hidden">
          <TitleBlock line1={t("scanScreen.line1")} line2={t("scanScreen.line2")} />
        </div>

        <div className="mt-6 lg:mt-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
          <Dropzone
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
                <NoticeCard notice={notice} onRetry={analyze} disabled={readable === 0} />
              </div>
            ) : null}

            {errorPhotos.map((photo) => (
              <div key={photo.id} className="order-2 mb-3 lg:order-1">
                <ErrorCard
                  photo={photo}
                  index={photos.indexOf(photo) + 1}
                  onRetake={() => retake(photo.id)}
                  onRemove={() => remove(photo.id)}
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
                <PhotoGrid
                  photos={photos}
                  editingId={editingId}
                  onEdit={setEditingId}
                  onClinic={setClinic}
                  onRemove={remove}
                />
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
      </div>
    </PageFrame>
  );
}

function Dropzone({
  onBrowse,
  onFiles,
  onSamples,
}: {
  onBrowse: () => void;
  onFiles: (files: FileList | null) => void;
  onSamples: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="gap-3 px-5 py-[26px] lg:min-h-[460px] lg:gap-3.5 lg:p-10"
      style={{
        border: "2px dashed #C7C7CC",
        borderRadius: 24,
        background: "rgba(255,255,255,.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
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

function PhotoGrid({
  photos,
  editingId,
  onEdit,
  onClinic,
  onRemove,
}: {
  photos: ScanPhoto[];
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onClinic: (id: string, clinic: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (photos.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {photos.map((photo) => (
        <div key={photo.id} className="flex min-w-0 flex-col gap-2">
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
              boxShadow: photo.unreadable ? "inset 0 0 0 2px #111" : undefined,
              ...photoStripe(),
            }}
          >
            {photo.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img
                src={photo.previewUrl}
                alt=""
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              photo.filename
            )}
            {photo.unreadable ? (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
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
            <button
              type="button"
              aria-label={t("removePhoto")}
              onClick={() => onRemove(photo.id)}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
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
          {editingId === photo.id ? (
            <input
              autoFocus
              value={photo.clinic}
              maxLength={60}
              placeholder={t("scanScreen.addClinic")}
              onChange={(event) => onClinic(photo.id, event.target.value)}
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
              onClick={() => onEdit(photo.id)}
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
              <span className="min-w-0" style={photo.clinic ? undefined : { color: "#6B6B72" }}>
                {photo.clinic || t("scanScreen.addClinic")}
              </span>
              <span style={{ color: "#6B6B72", display: "flex", flex: "none" }}>
                <PencilIcon />
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function NoticeCard({
  notice,
  onRetry,
  disabled,
}: {
  notice: ScanNotice;
  onRetry: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const failKey =
    notice.kind === "rate_limited"
      ? "rateBody"
      : notice.code === "timeout"
        ? "fail_timeout"
        : notice.code === "invalid_response"
          ? "fail_invalid"
          : notice.code === "not_configured"
            ? "fail_config"
            : notice.code === "bad_request"
              ? "fail_request"
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
          {t(notice.kind === "rate_limited" ? "scanScreen.rateTitle" : "scanScreen.failTitle")}
        </span>
        <span style={{ display: "flex", gap: 10, fontWeight: 400, fontSize: 16, lineHeight: 1.45, color: "#4A4A50" }}>
          <span style={{ flex: "none", display: "flex", color: "#6B6B72" }}>
            <InfoIcon />
          </span>
          {t(`scanScreen.${failKey}`)}
        </span>
      </div>
      <div style={{ padding: "12px 0 16px", display: "flex", gap: 8, alignItems: "center" }}>
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
}: {
  photo: ScanPhoto;
  index: number;
  onRetake: () => void;
  onRemove: () => void;
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
        <button type="button" onClick={onRetake} style={primaryAction}>
          <span style={{ color: "#D4FF4F", display: "flex" }}>
            <RefreshIcon />
          </span>
          {t("scanScreen.retake")}
        </button>
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
      {t("scanScreen.clear")}
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
