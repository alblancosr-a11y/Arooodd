"use client";

import { useState } from "react";
import { BUHOOR, type Bahr } from "@/lib/arud/buhoor-data";

export default function BuhoorDatabase() {
  const [selectedBahr, setSelectedBahr] = useState<Bahr | null>(null);
  const [search, setSearch] = useState("");

  const filtered = BUHOOR.filter((b) => b.name.includes(search) || b.tafaelat.some((t) => t.includes(search)));

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-2">📚</div>
        <h2 className="text-2xl font-title font-bold text-teal-800">قاعدة بيانات البحور</h2>
        <p className="text-stone-400 text-xs mt-1">موسوعة بحور الشعر مع تفعيلاتها وزحافاتها وعللها</p>
      </div>

      <div className="relative">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن بحر أو تفعيلة..."
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white/70 focus:border-teal-400 focus:outline-none" dir="rtl" />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300">🔍</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.map((b) => (
            <button key={b.id} onClick={() => setSelectedBahr(b)}
              className={`w-full text-right p-3 rounded-xl border transition-all duration-200 ${
                selectedBahr?.id === b.id
                  ? "bg-teal-700 text-white border-teal-700 shadow-md"
                  : "bg-white/70 border-stone-200/60 hover:border-teal-300 hover:bg-white text-stone-700"
              }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedBahr?.id === b.id ? "bg-teal-600 text-teal-100" : "bg-stone-100 text-stone-500"}`}>
                  {b.tafaelat.length} تفعيلات
                </span>
                <h3 className="font-title font-bold">{b.name}</h3>
              </div>
              <p className={`text-xs mt-0.5 font-poem ${selectedBahr?.id === b.id ? "text-teal-200" : "text-stone-400"}`}>
                {b.tafaelat.slice(0, 2).join(" ")}{b.tafaelat.length > 2 ? " ..." : ""}
              </p>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-stone-400 text-sm">لا نتائج</div>}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedBahr ? (
            <div className="space-y-3 fade-in">
              <div className="verse-box p-5 text-center">
                <h3 className="text-2xl font-title font-bold text-white mb-3">بحر {selectedBahr.name}</h3>
                <div className="border-t border-white/20 pt-3">
                  <p className="text-[#C4A35A] text-[10px] mb-1">المفتاح</p>
                  <p className="font-poem text-base leading-loose">{selectedBahr.key.split("***")[0]?.trim()}</p>
                  {selectedBahr.key.includes("***") && (
                    <>
                      <div className="text-[#C4A35A] text-sm my-1">✦</div>
                      <p className="font-poem text-base leading-loose">{selectedBahr.key.split("***")[1]?.trim()}</p>
                    </>
                  )}
                  <p className="text-teal-300 text-[10px] mt-2">— {selectedBahr.keyAttribution}</p>
                </div>
              </div>

              <div className="card">
                <p className="text-stone-500 text-sm leading-relaxed">{selectedBahr.description}</p>
                <p className="mt-2 text-xs text-teal-700 bg-teal-50/60 rounded-lg p-2 border border-teal-100">{selectedBahr.info}</p>
              </div>

              <div className="card">
                <h4 className="font-bold text-teal-800 text-sm mb-2">التفعيلات ({selectedBahr.tafaelat.length}):</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-stone-400 mb-1">الشطر الأول:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBahr.tafaelat.map((t, i) => (
                        <span key={i} className="font-poem text-sm bg-[#F5EDE3] border border-[#C4A35A]/50 text-[#4A3728] px-2.5 py-0.5 rounded-lg">{t}</span>
                      ))}
                    </div>
                  </div>
                  {selectedBahr.basePatternArr[1] && (
                    <div>
                      <p className="text-[10px] text-stone-400 mb-1">الشطر الثاني:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBahr.basePatternArr[1].map((t, i) => (
                          <span key={i} className="font-poem text-sm bg-white border border-stone-200 text-stone-600 px-2.5 py-0.5 rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedBahr.zihafat.length > 0 && (
                  <div className="card">
                    <h4 className="font-bold text-teal-700 text-sm mb-2">⚡ الزحافات:</h4>
                    {selectedBahr.zihafat.map((z, i) => (
                      <div key={i} className="p-2 bg-amber-50/80 rounded-lg border border-amber-100 mb-1.5 text-xs">
                        <strong className="text-amber-800">{z.name}</strong>
                        {z.resultName && <span className="text-[10px] text-amber-600 mr-1">→ {z.resultName}</span>}
                        <p className="text-stone-500 mt-0.5">{z.effect}</p>
                      </div>
                    ))}
                  </div>
                )}
                {selectedBahr.ilal.length > 0 && (
                  <div className="card">
                    <h4 className="font-bold text-teal-700 text-sm mb-2">🔧 العلل:</h4>
                    {selectedBahr.ilal.map((il, i) => (
                      <div key={i} className="p-2 bg-blue-50/80 rounded-lg border border-blue-100 mb-1.5 text-xs">
                        <div className="flex flex-wrap gap-1 items-center">
                          <strong className="text-blue-800">{il.name}</strong>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {il.position === "ajuz" ? "العجز" : il.position === "sadr" ? "الصدر" : "الصدر والعجز"}
                          </span>
                        </div>
                        <p className="text-stone-500 mt-0.5">{il.effect}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedBahr.examples.length > 0 && (
                <div className="card">
                  <h4 className="font-bold text-teal-700 text-sm mb-2">🌟 شواهد:</h4>
                  {selectedBahr.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="verse-box rounded-xl p-3 mb-2 text-center">
                      {ex.verse.split("***").map((part, pi) => (
                        <p key={pi} className="font-poem text-sm leading-loose">{part.trim()}</p>
                      ))}
                      {ex.poet && <p className="text-teal-300 text-[10px] mt-1">— {ex.poet}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-stone-300">
              <div className="text-5xl mb-3">📖</div>
              <p className="text-sm">اختر بحراً من القائمة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
