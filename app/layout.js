import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata = {
  title: "sureline — 직장인 건강 가이드",
  description: "목·어깨·허리 통증, 눈 피로, 피로 회복까지. 사무직 직장인을 위한 실용 건강 정보.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <SiteHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
