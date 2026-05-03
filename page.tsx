"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const BuhoorDatabase = dynamic(() => import("@/components/BuhoorDatabase"), { ssr: false });
const VerseAnalyzer = dynamic(() => import("@/components/VerseAnalyzer"), { ssr: false });
const ProsodyWriter = dynamic(() => import("@/components/ProsodyWriter"), { ssr: false });
const School = dynamic(() => import("@/components/school/School"), { ssr: false });

type Tab = "database" | "analyzer" | "writer" | "school";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "database", label: "قاعدة البيانات", icon: "📚" },
  { id: "analyzer", label: "تحليل البيت", icon: "🔬" },
  { id: "writer", label: "الكتابة العروضية", icon: "✍️" },
  { id: "school", label: "المدرسة العروضية", icon: "🏛️" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("database");

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "linear-gradient(180deg, #FAF7F2 0%, #F5EDE3 100%)" }}>
      {/* Header */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #145449 0%, #1A6B5C 40%, #1D7A6A 100%)" }}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4A35A' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30zM30 8l22 22-22 22L8 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-5xl mx-auto px-4 py-8 text-center">
          {/* Ornamental top */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(90deg, transparent, #C4A35A)" }} />
            <span className="text-[#C4A35A] text-lg">✦</span>
            <span className="text-[#C4A35A] text-2xl">❧</span>
            <span className="text-[#C4A35A] text-lg">✦</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(270deg, transparent, #C4A35A)" }} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-title font-bold text-white mb-1.5">
            دِيوَانُ الْعَرُوضِ
          </h1>
          <p className="text-[#C4A35A] text-base font-poem mb-0.5">
            منظومة شاملة لعلم العروض العربي
          </p>
          <p className="text-teal-200 text-xs opacity-70">
            قاعدة البيانات · التحليل · الكتابة · المدرسة التفاعلية
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-4 gap-2 max-w-lg mx-auto">
            {[
              { v: "١٥", l: "بحراً", i: "🎵" },
              { v: "٣٠+", l: "زحافة وعلة", i: "⚡" },
              { v: "١١", l: "قاعدة كتابة", i: "📜" },
              { v: "٤٥+", l: "اختبار", i: "🧪" },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 backdrop-blur rounded-xl p-2.5">
                <div className="text-base mb-0.5">{s.i}</div>
                <div className="text-white font-bold text-lg">{s.v}</div>
                <div className="text-teal-200 text-[10px]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b" style={{ borderColor: "#E5D9C8" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab flex-shrink-0 ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "database" && <BuhoorDatabase />}
        {activeTab === "analyzer" && <VerseAnalyzer />}
        {activeTab === "writer" && <ProsodyWriter />}
        {activeTab === "school" && <School />}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: "#E5D9C8", background: "linear-gradient(180deg, #F5EDE3 0%, #EDE2D0 100%)" }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, #C4A35A)" }} />
          <span className="text-[#C4A35A]">❧</span>
          <div className="h-px w-12" style={{ background: "linear-gradient(270deg, transparent, #C4A35A)" }} />
        </div>
        <p className="text-stone-500 text-sm">ديوان العروض — منظومة علم العروض العربي</p>
        <p className="text-stone-400 text-xs mt-1">استناداً إلى علم الخليل بن أحمد الفراهيدي</p>
      </footer>
    </div>
  );
}
