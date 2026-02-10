import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { Header } from "@/components/common/header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "주식 포트폴리오 관리 - 무료 포트폴리오 추적 도구",
  description:
    "여러 계좌의 주식 투자를 한눈에 관리하세요. 무료, 개인정보 보호, 브라우저 로컬 저장.",
  keywords: "주식, 포트폴리오, 관리, 투자, 계좌",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <Header />
          <main className="container px-4 py-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
