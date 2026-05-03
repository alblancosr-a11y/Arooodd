"use client";

import { useState, useEffect } from "react";
import ProsodyWritingLesson from "./ProsodyWritingLesson";
import BahrLesson from "./BahrLesson";

type SchoolSection = "prosody_writing" | "bahr_lessons";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function School() {
  const [activeSection, setActiveSection] = useState<SchoolSection | null>(null);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("arud_session_id");
    if (stored) setSessionId(stored);
    else {
      const newId = generateSessionId();
      localStorage.setItem("arud_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  if (!activeSection) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #C4A35A)" }} />
            <span className="text-3xl">🏛️</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(270deg, transparent, #C4A35A)" }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-title font-bold text-teal-800">
            مدرسة الرَّوحُ والرَّيحان العروضية
          </h2>
          <p className="text-stone-400 mt-2 text-sm max-w-lg mx-auto leading-relaxed">
            دروس منظمة تبدأ بأساسيات الكتابة العروضية وتنتهي بإتقان جميع البحور مع اختبارات تفاعلية
          </p>
        </div>

        {/* Gates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gate 1: Prosody Writing */}
          <button
            onClick={() => setActiveSection("prosody_writing")}
            className="group text-right p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg bg-white/70 hover:bg-white"
            style={{ borderColor: "#C4A35A" }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">📜</span>
              <span className="bg-teal-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">البداية</span>
            </div>
            <h3 className="text-xl font-title font-bold text-teal-800 mb-2">الكتابة العروضية</h3>
            <p className="text-stone-500 text-xs leading-relaxed mb-3">
              تعلّم التنوين والشدة وهمزة الوصل ولام التعريف وكل قواعد الكتابة العروضية مع تمارين فورية
            </p>
            <div className="flex gap-2 mb-3">
              <span className="text-[10px] bg-[#F5EDE3] text-teal-700 px-2 py-0.5 rounded-full">١١ قاعدة</span>
              <span className="text-[10px] bg-[#F5EDE3] text-teal-700 px-2 py-0.5 rounded-full">تمارين</span>
            </div>
            <div className="text-teal-600 group-hover:text-teal-800 font-bold text-sm transition-colors">ابدأ الدرس ←</div>
          </button>

          {/* Gate 2: Bahr Lessons */}
          <button
            onClick={() => setActiveSection("bahr_lessons")}
            className="group text-right p-6 rounded-2xl border border-stone-200 transition-all duration-300 hover:shadow-lg bg-white/70 hover:bg-white hover:border-teal-300"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">🎵</span>
              <span className="bg-[#C4A35A] text-white text-[10px] px-2 py-1 rounded-full font-bold">متقدم</span>
            </div>
            <h3 className="text-xl font-title font-bold text-teal-800 mb-2">دروس البحور</h3>
            <p className="text-stone-500 text-xs leading-relaxed mb-3">
              ادرس البحور الخمسة عشر: المفتاح والتفعيلات والشواهد ثم اختبر نفسك بثلاثة أسئلة متدرجة
            </p>
            <div className="flex gap-2 mb-3">
              <span className="text-[10px] bg-[#F5EDE3] text-teal-700 px-2 py-0.5 rounded-full">١٥ بحراً</span>
              <span className="text-[10px] bg-[#F5EDE3] text-teal-700 px-2 py-0.5 rounded-full">اختبارات</span>
            </div>
            <div className="text-teal-600 group-hover:text-teal-800 font-bold text-sm transition-colors">اختر بحراً ←</div>
          </button>
        </div>

        {/* Path */}
        <div className="card">
          <h3 className="font-bold text-teal-800 text-sm mb-3">📍 مسار التعلم:</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {[
              { n: "١", l: "الكتابة العروضية", bg: "bg-teal-700" },
              { n: "٢", l: "دروس البحور", bg: "bg-teal-500" },
              { n: "٣", l: "التحليل والكتابة التطبيقية", bg: "bg-stone-400" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-stone-300 hidden sm:block mx-1">←</span>}
                <span className={`w-7 h-7 ${s.bg} text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0`}>{s.n}</span>
                <span className="text-stone-600 text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="verse-box rounded-2xl p-5 text-center">
          <p className="font-poem text-lg leading-loose">«الشِّعْرُ دِيوَانُ الْعَرَبِ»</p>
          <p className="text-[#C4A35A] text-[10px] mt-2">— المثل العربي</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setActiveSection(null)}
        className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 transition-colors text-sm">
        ← العودة للمدرسة
      </button>

      <div className="rounded-xl px-5 py-2.5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #145449, #1A6B5C)" }}>
        <span className="text-lg">{activeSection === "prosody_writing" ? "📜" : "🎵"}</span>
        <h3 className="font-title font-bold text-white text-sm">
          {activeSection === "prosody_writing" ? "درس الكتابة العروضية" : "دروس البحور الشعرية"}
        </h3>
      </div>

      {activeSection === "prosody_writing" && sessionId && <ProsodyWritingLesson sessionId={sessionId} />}
      {activeSection === "bahr_lessons" && sessionId && <BahrLesson sessionId={sessionId} />}
    </div>
  );
}
