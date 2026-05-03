"use client";

import { useState, useMemo } from "react";
import { BUHOOR } from "@/lib/arud/buhoor-data";
import {
  syllabify,
  computeBahrPattern,
  computeBahrVariantPatterns,
  checkLivePositional,
  type LiveCheckResult,
} from "@/lib/arud/prosody-analyzer";

/** عرض حرف النمط */
function PatternChar({ ch, mismatch }: { ch: string; mismatch: boolean }) {
  return (
    <span
      className={`text-base font-bold ${
        ch === "/"
          ? mismatch ? "text-rose-600 bg-rose-100 rounded px-0.5" : "text-teal-700"
          : mismatch ? "text-rose-600 bg-rose-100 rounded px-0.5" : "text-amber-700"
      }`}
    >
      {ch}
    </span>
  );
}

/** عرض صف واحد: مقارنة نمط المستخدم مع المطلوب */
function LineResult({
  line,
  lineNumber,
  result,
}: {
  line: string;
  lineNumber: number;
  result: LiveCheckResult;
}) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white/70 overflow-hidden">
      {/* رأس الصف */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              result.onTrack ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span className="text-[10px] text-stone-400 font-bold">
            السطر {lineNumber}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold ${
            result.onTrack ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {result.onTrack ? "✓ على الوزن" : "✗ خارج الوزن"}
        </span>
      </div>

      {/* النص */}
      {line && (
        <div className="px-3 py-2 font-poem text-sm text-stone-600 leading-relaxed">
          {line}
        </div>
      )}

      {/* النمطان */}
      <div className="px-3 py-2 border-t border-stone-50">
        <div className="flex gap-4 items-start">
          {/* نمط المستخدم */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-stone-300 mb-0.5">نمطك</p>
            <div className="flex flex-wrap gap-[1px]">
              {[...result.userPattern].map((ch, i) => (
                <PatternChar
                  key={i}
                  ch={ch}
                  mismatch={
                    !result.onTrack &&
                    result.mismatchAt !== null &&
                    i >= result.mismatchAt
                  }
                />
              ))}
            </div>
          </div>

          <div className="text-stone-200 self-center text-sm">|</div>

          {/* النمط المطلوب */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-stone-300 mb-0.5">المطلوب</p>
            <div className="flex flex-wrap gap-[1px]">
              {[...result.bestExpected].map((ch, i) => {
                const beyond = i >= result.userPattern.length;
                return (
                  <span
                    key={i}
                    className={`text-base font-bold ${
                      beyond
                        ? "text-stone-200"
                        : ch === "/"
                        ? "text-teal-700"
                        : "text-amber-700"
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {!result.onTrack && result.mismatchAt !== null && (
          <p className="text-rose-600 text-[10px] mt-1.5 font-bold">
            الاختلاف عند الموضع {result.mismatchAt + 1} — المتوقع{" "}
            {result.bestExpected[result.mismatchAt] === "/"
              ? "متحرك /"
              : "ساكن ٥"}{" "}
            والمكتوب{" "}
            {result.userPattern[result.mismatchAt] === "/"
              ? "متحرك /"
              : "ساكن ٥"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProsodyWriter() {
  const [selectedBahr, setSelectedBahr] = useState<string>("");
  const [userText, setUserText] = useState("");
  const [showZihafat, setShowZihafat] = useState(false);

  const bahrData = selectedBahr
    ? BUHOOR.find((b) => b.id === selectedBahr)
    : null;

  // حساب كل الأنماط المسموحة للبحر
  const allowedPatterns = useMemo(() => {
    if (!bahrData) return [];
    const base = computeBahrPattern(bahrData.tafaelat);
    const variants = computeBahrVariantPatterns(
      bahrData.tafaelat,
      bahrData.zihafat.map((z) => ({ effect: z.effect, resultName: z.resultName })),
      bahrData.ilal.map((il) => ({ effect: il.effect, resultName: il.resultName }))
    );
    return [base, ...variants];
  }, [bahrData]);

  // تقسيم النص إلى أسطر وفحص كل سطر بشكل مستقل
  const lineResults = useMemo(() => {
    if (!userText || !bahrData || allowedPatterns.length === 0) return [];

    // تقسيم بجميع فواصل الأسطر
    const lines = userText.split(/\r?\n/);

    return lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        // سطر فارغ
        return {
          line: "",
          result: {
            onTrack: true,
            mismatchAt: null,
            userPattern: "",
            bestExpected: allowedPatterns[0],
          } as LiveCheckResult,
        };
      }
      const pattern = syllabify(trimmed);
      const result = checkLivePositional(pattern, allowedPatterns);
      return { line: trimmed, result };
    });
  }, [userText, bahrData, allowedPatterns]);

  // الحالة العامة: كل الأسطر على الوزن
  const allOnTrack =
    lineResults.length > 0 && lineResults.every((lr) => lr.result.onTrack);
  const hasContent = lineResults.some((lr) => lr.line.length > 0);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-2">✍️</div>
        <h2 className="text-2xl font-title font-bold text-teal-800">
          بوابة الكتابة العروضية
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          اكتب على الوزن — كل سطر يُفحص بشكل مستقل
        </p>
      </div>

      {/* اختيار البحر */}
      <div className="card">
        <h3 className="font-bold text-teal-800 mb-3 text-sm">اختر البحر:</h3>
        <div className="flex flex-wrap gap-1.5">
          {BUHOOR.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBahr(b.id);
                setUserText("");
              }}
              className={`py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                selectedBahr === b.id
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-teal-800 border-stone-200 hover:border-teal-400"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {bahrData && (
        <div className="space-y-4 fade-in">
          {/* المرجع */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: "linear-gradient(135deg, #145449, #1A6B5C)" }}
          >
            <div className="text-center mb-3">
              <p className="text-[#C4A35A] text-[10px] mb-1">
                مفتاح بحر {bahrData.name}
              </p>
              <p className="font-poem text-base leading-loose opacity-90">
                {bahrData.key.split("***")[0]?.trim()}
              </p>
              {bahrData.key.includes("***") && (
                <p className="font-poem text-base leading-loose opacity-90 mt-1">
                  {bahrData.key.split("***")[1]?.trim()}
                </p>
              )}
            </div>
            <div className="border-t border-white/20 pt-3">
              <p className="text-teal-300 text-[10px] mb-2 text-center">
                النمط المطلوب ( / متحرك | ٥ ساكن )
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {bahrData.tafaelat.map((t, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-teal-700 text-teal-100 rounded-lg px-2.5 py-0.5 font-poem text-sm">
                      {t}
                    </div>
                    <div className="mt-1 flex justify-center text-xs font-bold">
                      {[...syllabify(t)].map((ch, ci) => (
                        <span
                          key={ci}
                          className={
                            ch === "/" ? "text-teal-300" : "text-amber-300"
                          }
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* الزحافات */}
          {(bahrData.zihafat.length > 0 || bahrData.ilal.length > 0) && (
            <div className="card">
              <button
                onClick={() => setShowZihafat(!showZihafat)}
                className="w-full flex items-center justify-between text-teal-800 font-bold text-sm"
              >
                <span>⚡ الزحافات والعلل المسموحة</span>
                <span className="text-xs">{showZihafat ? "▲" : "▼"}</span>
              </button>
              {showZihafat && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 fade-in text-xs">
                  {bahrData.zihafat.map((z, i) => (
                    <div
                      key={i}
                      className="bg-amber-50/80 rounded-lg p-2.5 border border-amber-100"
                    >
                      <strong className="text-amber-800">{z.name}:</strong>{" "}
                      <span className="text-stone-600">{z.effect}</span>
                    </div>
                  ))}
                  {bahrData.ilal.map((il, i) => (
                    <div
                      key={i}
                      className="bg-blue-50/80 rounded-lg p-2.5 border border-blue-100"
                    >
                      <strong className="text-blue-800">{il.name}:</strong>{" "}
                      <span className="text-stone-600">{il.effect}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* منطقة الكتابة */}
          <div className="relative">
            {hasContent && (
              <div
                className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${
                  allOnTrack
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white animate-pulse"
                }`}
              >
                {allOnTrack ? "✓ كل الأسطر على الوزن" : "✗ خطأ في أحد الأسطر"}
              </div>
            )}

            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className={`w-full rounded-2xl p-5 pt-14 text-lg font-poem text-stone-800 bg-white border-2 shadow-sm focus:outline-none transition-all duration-300 leading-loose ${
                !hasContent
                  ? "border-stone-200 focus:border-teal-400"
                  : allOnTrack
                  ? "border-emerald-400 bg-white focus:border-emerald-500"
                  : "border-rose-400 bg-rose-50/20 focus:border-rose-500"
              }`}
              rows={6}
              placeholder={`اكتب هنا على وزن ${bahrData.name} مع الحركات...\nكل سطر يُفحص بشكل مستقل عن الآخر`}
              dir="rtl"
            />
          </div>

          {/* عرض النتائج لكل سطر */}
          {lineResults.filter((lr) => lr.line.length > 0).length > 0 && (
            <div className="space-y-3 fade-in">
              {lineResults.map((lr, i) =>
                lr.line.length > 0 ? (
                  <LineResult
                    key={i}
                    line={lr.line}
                    lineNumber={i + 1}
                    result={lr.result}
                  />
                ) : null
              )}
            </div>
          )}

          <div className="text-xs text-stone-400 bg-stone-100/50 rounded-lg p-2.5 border border-stone-200/50">
            💡 اكتب بالحركات (فتحة َ ضمة ُ كسرة ِ سكون ْ) — كل سطر يُفحص
            بشكل مستقل — اضغط Enter لبدء سطر جديد
          </div>
        </div>
      )}

      {!selectedBahr && (
        <div className="text-center py-16 text-stone-300">
          <div className="text-6xl mb-4 opacity-50">🎼</div>
          <p>اختر بحراً من القائمة أعلاه</p>
        </div>
      )}
    </div>
  );
}
