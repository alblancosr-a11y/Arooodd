import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ديوان العروض — علم العروض العربي",
  description: "منظومة شاملة لعلم العروض: تحليل الأوزان، الكتابة العروضية، ومدرسة الرَّوحُ والرَّيحان",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased" style={{ background: "#FAF7F2" }}>
        {children}
      </body>
    </html>
  );
}
