import type { Metadata } from "next";
import localFont from "next/font/local";
import { DemoModeProvider } from "@/components/demo-mode";
import { TranslationProvider } from "@/lib/i18n";
import { isDemoOnly } from "@/lib/demo-mode";
import "./globals.css";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "PillCheck",
  description: "Scan medicine bags and check them together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pretendard.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <DemoModeProvider demoOnly={isDemoOnly()}>
          <TranslationProvider>{children}</TranslationProvider>
        </DemoModeProvider>
      </body>
    </html>
  );
}
