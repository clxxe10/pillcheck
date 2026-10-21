"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Lang = "en" | "ko";

const STORAGE_KEY = "app_language";

const en = {
  disclaimer: "This tool does not replace advice from a doctor or pharmacist.",
  scan: "Scan",
  back: "Back",
  close: "Close",
  removePhoto: "Remove photo",
  less: "Less",
  more: "More",
  editLabel: "Edit",
  nav: {
    home: "Home",
    list: "Medicines",
    schedule: "Schedule",
  },
  home: {
    line1: "Your medicines",
    line2: "at a glance",
    nextDose: "Next dose",
    medicines: "Medicines",
    needReview: "Need review",
    safety: "Safety alerts",
    checkNow: "Check now",
    seeFull: "See full results",
    emptyTitle: "Nothing scanned yet",
    emptyBody:
      "Take a photo of each medicine bag or prescription label. We’ll read them together and point out anything that overlaps.",
    scanBags: "Scan medicine bags",
  },
  scanScreen: {
    line1: "Scan",
    line2: "Add photos of your medicine bags",
    takePhoto: "Take photo",
    oneEach: "One bag or label per photo",
    choosePhotos: "Choose from photos",
    drop: "Drop photos here",
    dropHint: "JPG, PNG or HEIC · one bag or label per photo",
    chooseFiles: "Choose files",
    trySamples: "Try with sample photos",
    tapEdit: "Tap a name to edit",
    clickEdit: "Click a name to edit",
    clear: "Make sure the label text is clear and not blurry",
    unreadable: "Couldn’t read this photo",
    blurry:
      "The label is blurry. Hold the phone flat over the label, in good light, and fill the frame with the text.",
    glare: "There’s glare on the label. Tilt the phone a little or move away from the light, then try again.",
    cropped: "Part of the label is cut off. Fit the whole label inside the frame.",
    not_medicine: "This doesn’t look like a medicine bag or prescription label.",
    other: "We couldn’t read the label. Retake it in good light with the text filling the frame.",
    retake: "Retake photo",
    remove: "Remove",
    addClinic: "Add clinic name",
    rateTitle: "Too many requests right now",
    rateBody: "Please try again in a moment.",
    rateSample: "Or try the sample photos.",
    quotaTitle: "Today's reading limit is used up",
    quotaBody: "Live photo reading is paused until tomorrow. The sample photos still work.",
    failTitle: "Couldn’t check your photos",
    fail_timeout: "It took too long. Check your connection and try again.",
    fail_invalid: "We couldn’t understand the result. Please try again.",
    fail_config: "Photo reading isn’t set up yet. Try the sample photos instead.",
    fail_request: "These photos couldn’t be sent. Try fewer or smaller photos.",
    fail_generic: "Something went wrong. Please try again.",
    tryAgain: "Try again",
  },
  analyzing: {
    line1: "Checking your medicines",
    line2: "about 20 seconds",
    reading: "Reading labels",
    matching: "Matching medicines",
    matchingSub: "Looking for each medicine",
    safety: "Checking safety",
    safetySub: "Duplicates and combinations",
    notStored: "Photos are not stored",
  },
  results: {
    title: "Results",
    checkNow: "Check now",
    share: "Share with my pharmacist",
    copied: "Copied",
    medicines: "Medicines",
    review: "Review",
    needsReview: "Needs review",
    schedule: "Schedule",
  },
  edit: {
    title: "Edit medicine",
    source: "Source photo",
    view: "View full photo",
    review: "Needs review",
    reviewNote: "We weren’t sure about some details. Check them against the photo.",
    name: "Medicine name",
    ingredient: "Ingredient",
    dose: "Dose",
    times: "Times per day",
    days: "Days",
    when: "When to take",
    save: "Save",
    delete: "Delete medicine",
  },
  slot: {
    all: "All",
    morning: "Morning",
    lunch: "Lunch",
    evening: "Evening",
    bedtime: "Bedtime",
  },
  alerts: {
    source: "Source: {name}",
    duplicate: {
      label: "Duplicate ingredient",
      homeTitle: "{a} and {b} both contain {ingredient}",
      homeTitleMore: "{a} and {n} more contain {ingredient}",
      title: "Both contain {ingredient}",
      body: "{ingredient} is in more than one of these medicines, so the doses add up.",
    },
    daily: {
      label: "Daily limit",
      homeTitle: "{ingredient} · {total} mg a day",
      titleCaution: "{ingredient} is near the daily limit",
      titleDanger: "{ingredient} is over the daily limit",
      bodyCaution: "These add up to {total} mg a day, {pct}% of the {limit} mg adult limit.",
      bodyDanger: "These add up to {total} mg a day, over the {limit} mg adult limit.",
    },
    contraindicated: {
      label: "Do not combine",
      body: "This combination is listed as one to avoid.",
    },
    caution: {
      label: "Use caution",
      body: "This combination needs extra care.",
    },
  },
};

const ko: typeof en = {
  disclaimer: "이 도구는 의사·약사 상담을 대신하지 않습니다.",
  scan: "스캔",
  back: "뒤로",
  close: "닫기",
  removePhoto: "사진 삭제",
  less: "줄이기",
  more: "늘리기",
  editLabel: "수정",
  nav: {
    home: "홈",
    list: "약 목록",
    schedule: "복용 일정",
  },
  home: {
    line1: "내 약",
    line2: "한눈에 보기",
    nextDose: "다음 복용",
    medicines: "약",
    needReview: "확인 필요",
    safety: "안전 알림",
    checkNow: "지금 확인",
    seeFull: "전체 결과 보기",
    emptyTitle: "아직 스캔한 약이 없어요",
    emptyBody:
      "약 봉투나 처방 라벨을 한 장씩 찍어 주세요. 함께 읽고, 겹치는 부분을 알려 드립니다.",
    scanBags: "약 봉투 스캔",
  },
  scanScreen: {
    line1: "스캔",
    line2: "약 봉투 사진을 추가하세요",
    takePhoto: "사진 촬영",
    oneEach: "사진 한 장에 봉투 또는 라벨 하나",
    choosePhotos: "사진에서 선택",
    drop: "여기에 사진을 놓으세요",
    dropHint: "JPG, PNG 또는 HEIC · 사진 한 장에 봉투 또는 라벨 하나",
    chooseFiles: "파일 선택",
    trySamples: "샘플 사진으로 해보기",
    tapEdit: "이름을 눌러 수정",
    clickEdit: "이름을 눌러 수정",
    clear: "라벨 글자가 선명하고 흐리지 않은지 확인해 주세요",
    unreadable: "이 사진을 읽지 못했어요",
    blurry:
      "라벨이 흐려요. 밝은 곳에서 휴대폰을 라벨 위에 평평하게 대고, 글자가 화면에 가득 차게 찍어 주세요.",
    glare: "라벨에 빛이 반사돼요. 휴대폰을 살짝 기울이거나 조명을 피해서 다시 찍어 주세요.",
    cropped: "라벨 일부가 잘렸어요. 라벨 전체가 화면 안에 들어오게 찍어 주세요.",
    not_medicine: "약 봉투나 처방 라벨이 아닌 것 같아요.",
    other: "라벨을 읽지 못했어요. 밝은 곳에서 글자가 화면에 가득 차게 다시 찍어 주세요.",
    retake: "다시 촬영",
    remove: "삭제",
    addClinic: "병원 이름 추가",
    rateTitle: "지금 요청이 많아요",
    rateBody: "잠시 후 다시 시도해 주세요.",
    rateSample: "또는 샘플 사진으로 해 보세요.",
    quotaTitle: "오늘 읽을 수 있는 횟수를 다 썼어요",
    quotaBody: "내일까지 사진 판독이 멈춰 있어요. 샘플 사진은 그대로 쓸 수 있어요.",
    failTitle: "사진을 확인하지 못했어요",
    fail_timeout: "시간이 너무 오래 걸렸어요. 연결을 확인하고 다시 시도해 주세요.",
    fail_invalid: "결과를 이해하지 못했어요. 다시 시도해 주세요.",
    fail_config: "사진 판독이 아직 설정되지 않았어요. 샘플 사진으로 먼저 체험해 보세요.",
    fail_request: "사진을 보내지 못했어요. 장수를 줄이거나 더 작은 사진으로 다시 시도해 주세요.",
    fail_generic: "문제가 생겼어요. 다시 시도해 주세요.",
    tryAgain: "다시 시도",
  },
  analyzing: {
    line1: "약을 확인하고 있어요",
    line2: "약 20초",
    reading: "라벨 읽는 중",
    matching: "약 맞추는 중",
    matchingSub: "약을 하나씩 찾는 중",
    safety: "안전 확인",
    safetySub: "중복과 함께 복용",
    notStored: "사진은 저장되지 않아요",
  },
  results: {
    title: "결과",
    checkNow: "지금 확인",
    share: "약사에게 공유",
    copied: "복사됨",
    medicines: "약",
    review: "확인",
    needsReview: "확인 필요",
    schedule: "복용 일정",
  },
  edit: {
    title: "약 수정",
    source: "원본 사진",
    view: "사진 전체 보기",
    review: "확인 필요",
    reviewNote: "일부 내용이 확실하지 않아요. 사진과 비교해 확인해 주세요.",
    name: "약 이름",
    ingredient: "성분",
    dose: "용량",
    times: "하루 횟수",
    days: "일수",
    when: "언제 복용하나요",
    save: "저장",
    delete: "약 삭제",
  },
  slot: {
    all: "전체",
    morning: "아침",
    lunch: "점심",
    evening: "저녁",
    bedtime: "취침",
  },
  alerts: {
    source: "출처: {name}",
    duplicate: {
      label: "성분 중복",
      homeTitle: "{a}와 {b}에 {ingredient} 성분이 함께 들어 있습니다",
      homeTitleMore: "{a} 외 {n}개에 {ingredient} 성분이 함께 들어 있습니다",
      title: "둘 다 {ingredient} 성분이 들어 있습니다",
      body: "{ingredient} 성분이 약 두 개 이상에 들어 있어 용량이 합쳐집니다.",
    },
    daily: {
      label: "1일 최대 용량",
      homeTitle: "{ingredient} · 하루 {total} mg",
      titleCaution: "{ingredient}이 하루 한도에 가깝습니다",
      titleDanger: "{ingredient}이 하루 한도를 넘습니다",
      bodyCaution: "합치면 하루 {total} mg으로, 성인 한도 {limit} mg의 {pct}%입니다.",
      bodyDanger: "합치면 하루 {total} mg으로, 성인 한도 {limit} mg을 넘습니다.",
    },
    contraindicated: {
      label: "함께 복용 금지",
      body: "함께 쓰지 않도록 안내된 조합입니다.",
    },
    caution: {
      label: "주의해서 함께 복용",
      body: "함께 쓸 때 주의가 필요한 조합입니다.",
    },
  },
};

const dictionaries = { en, ko };

export type Dictionary = typeof en;

function readPath(dict: Dictionary, path: string): string {
  const value = path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : path;
}

type TranslationContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

const listeners = new Set<() => void>();

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "ko" ? "ko" : "en";
}

let currentLang: Lang = readStoredLang();

function subscribeLang(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitLang() {
  listeners.forEach((listener) => listener());
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, () => currentLang, () => "en" as Lang);

  const setLang = useCallback((next: Lang) => {
    currentLang = next;
    window.localStorage.setItem(STORAGE_KEY, next);
    emitLang();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<TranslationContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: string) => readPath(dictionaries[lang], key),
    }),
    [lang, setLang],
  );

  return (
    <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
}
