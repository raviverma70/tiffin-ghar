import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { HTML_LANG } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";
import { getT } from "@/i18n/server";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Hindi (Devanagari) ke liye
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: { default: t("meta.title"), template: "%s | Tiffin Ghar" },
    description: t("meta.description"),
  };
}

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, messages } = await getT();

  return (
    <html lang={HTML_LANG[locale]} className={`${poppins.variable} ${devanagari.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <I18nProvider locale={locale} messages={messages}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
