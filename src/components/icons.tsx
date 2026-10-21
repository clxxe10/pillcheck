import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
};

function Svg({
  size = 22,
  stroke = "currentColor",
  strokeWidth = 1.6,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ChevronIcon({ size = 22, stroke = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg size={size} stroke={stroke} strokeWidth={strokeWidth}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function BackIcon() {
  return (
    <Svg size={20} strokeWidth={1.8}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function HomeIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.7}>
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
    </Svg>
  );
}

export function ListIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.7}>
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </Svg>
  );
}

export function CalendarIcon({ size = 24 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.7}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  );
}

export function ScanIcon({ size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={strokeWidth}>
      <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" />
      <circle cx="12" cy="12" r="3.2" />
    </Svg>
  );
}

export function CameraIcon({ size = 26 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.6}>
      <path d="M3 8a2 2 0 012-2h2.5l1.5-2h6l1.5 2H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </Svg>
  );
}

export function UploadIcon({ size = 30 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.7}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
    </Svg>
  );
}

export function ImageIcon({ size = 20 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-9 9" />
    </Svg>
  );
}

export function CloseIcon({ size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={strokeWidth}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function PencilIcon({ size = 14 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}

export function InfoIcon({ size = 20 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  );
}

export function PinIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function CheckIcon({ size = 18, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={strokeWidth}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function LockIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </Svg>
  );
}

export function MinusIcon() {
  return (
    <Svg size={18} strokeWidth={2}>
      <path d="M6 12h12" />
    </Svg>
  );
}

export function PlusIcon() {
  return (
    <Svg size={18} strokeWidth={2}>
      <path d="M12 6v12M6 12h12" />
    </Svg>
  );
}

export function TrashIcon() {
  return (
    <Svg size={20}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
    </Svg>
  );
}

export function RefreshIcon({ size = 20 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.8}>
      <path d="M20 11a8 8 0 10-2.3 5.7" />
      <path d="M20 5v6h-6" />
    </Svg>
  );
}

export function PillIcon({ size = 22 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-40 12 12)" />
      <path d="M9.3 8.8l5.4 6.4" />
    </Svg>
  );
}
