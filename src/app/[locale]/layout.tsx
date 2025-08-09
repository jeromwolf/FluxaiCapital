import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "../globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { IntlProvider } from "@/components/providers/intl-provider";
import { Toaster } from "sonner";
import { notFound } from "next/navigation";
import { locales } from "@/config/i18n";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "FLUX AI Capital - AI 기반 자산관리 플랫폼",
  description: "AI와 데이터 기반의 전략적 자산관리 플랫폼",
  metadataBase: new URL("https://flux.ai.kr"),
  openGraph: {
    title: "FLUX AI Capital",
    description: "1억원에서 시작하는 AI 자산관리",
    url: "https://flux.ai.kr",
    siteName: "FLUX AI Capital",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FLUX AI Capital",
    description: "AI 기반 자산관리 플랫폼",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansKR.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <IntlProvider locale={locale} messages={messages}>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                {children}
              </div>
            </AuthProvider>
          </IntlProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}