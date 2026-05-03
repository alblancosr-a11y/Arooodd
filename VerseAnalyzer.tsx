"use client";

import { useState } from "react";
import { BUHOOR, type Bahr } from "@/lib/arud/buhoor-data";
import { detectBahr, syllabify, toProsodyWriting, type AnalysisResult } from "@/lib/arud/prosody-analyzer";

/** نتيجة شطر واحد */
interface HemistichResult {
  text: string;
  prosodyText: string;
  pattern: string;
  detectedBahr: string | null;
  bahrName: string | null;
  confidence: number;
  isValid: boolean;
  notes: string[];
}

/** نتيجة بيت واحد */
interface VerseResult {
  lineNumber: number;
  original: string;
  prosodyWriting: string;
  hemistichs: HemistichResult[];
  mainBahr: string | null;
  mainBahrName: string | null;
  allValid: boolean;
}

/** نتيجة القصيدة كلها */
interface PoemResult {
  verses: VerseResult[];
  /** البحر الغالب على القصيدة */
  dominantBahr: string | null;
  dominantBahrName: string | null;
  totalVerses: number;
  validVerses: number;
  errorVerses: number;
  errorLines: number[];
}

function analyzeSingleVerse(line: string, lineNumber: number): VerseResult {
  // تحويل البيت إلى الكتابة العروضية أولاً
  const prosodyWriting = toProsodyWriting(line);

  // تقسيم البيت العروضي إلى شطرين
  const parts = prosodyWriting.split(/\*{2,3}|…|—|–/).map((p) => p.trim()).filter(Boolean);
  const hemistichs: HemistichResult[] = [];

  for (const part of parts.length > 0 ? parts : [prosodyWriting]) {
    const r: AnalysisResult = detectBahr(part);
    hemistichs.push({
      text: part,
      prosodyText: part,
      pattern: syllabify(part),
      detectedBahr: r.detectedBahr,
      bahrName: r.bahrName,
      confidence: r.confidence,
      isValid: r.isValid,
      notes: r.notes,
    });
  }

  // البحر الغالب: أكثر البحور ثقة
  let bestBahr: string | null = null;
  let bestName: string | null = null;
  let bestConf = 0;
  for (const h of hemistichs) {
    if (h.confidence > bestConf && h.detectedBahr) {
      bestConf = h.confidence;
      bestBahr = h.detectedBahr;
      bestName = h.bahrName;
    }
  }

  return {
    lineNumber,
    original: line,
    prosodyWriting,
    hemistichs,
    mainBahr: bestBahr,
    mainBahrName: bestName,
    allValid: hemistichs.every((h) => h.isValid),
  };
}

function analyzePoem(text: string): PoemResult {
  // تقسيم إلى أسطر
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const verses: VerseResult[] = [];
  const errorLines: number[] = [];
  let validCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const vr = analyzeSingleVerse(lines[i], i + 1);
    verses.push(vr);
    if (vr.allValid) validCount++;
    else errorLines.push(vr.lineNumber);
  }

  // البحر الغالب على القصيدة
  const bahrCounts: Record<string, number> = {};
  for (const v of verses) {
    if (v.mainBahr) {
      bahrCounts[v.mainBahr] = (bahrCounts[v.mainBahr] || 0) + 1;
    }
  }
  let dominantBahr: string | null = null;
  let dominantBahrName: string | null = null;
  let maxCount = 0;
  for (const [id, count] of Object.entries(bahrCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantBahr = id;
    }
  }
  if (dominantBahr) {
    dominantBahrName = verses.find((v) => v.mainBahr === dominantBahr)?.mainBahrName ?? null;
  }

  return {
    verses,
    dominantBahr,
    dominantBahrName,
    totalVerses: lines.length,
    validVerses: validCount,
    errorVerses: lines.length - validCount,
    errorLines,
  };
}

/** عرض نمط الشطر */
function PatternDisplay({ pattern }: { pattern: string }) {
  return (
    <div className="flex flex-wrap gap-[1px]">
      {[...pattern].map((ch, i) => (
        <span
          key={i}
          className={`text-xs font-bold ${
            ch === "/" ? "text-teal-700" : ch === "٥" ? "text-amber-700" : "text-stone-300"
          }`}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

/** بطاقة بيت واحد */
function VerseCard({ vr, bahrInfo }: { vr: VerseResult; bahrInfo?: Bahr | null }) {
  return (
    <div
      className={`rounded-xl border-2 overflow-hidden ${
        vr.allValid
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-rose-200 bg-rose-50/40"
      }`}
    >
      {/* رأس البطاقة */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{vr.allValid ? "✅" : "⚠️"}</span>
          <span className="text-xs text-stone-500 font-bold">البيت {vr.lineNumber}</span>
        </div>
        {vr.mainBahrName && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              vr.allValid
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {vr.mainBahrName}
          </span>
        )}
      </div>

      {/* نص البيت الأصلي */}
      <div className="px-4 py-2 font-poem text-base text-stone-700 leading-loose text-center">
        {vr.original}
      </div>

      {/* الكتابة العروضية */}
      {vr.prosodyWriting !== vr.original && (
        <div className="px-4 py-2 border-t border-stone-100/50 bg-teal-50/30">
          <p className="text-[10px] text-teal-600 font-bold mb-1">📝 الكتابة العروضية:</p>
          <p className="font-poem text-sm text-teal-800 leading-loose text-center">
            {vr.prosodyWriting}
          </p>
        </div>
      )}

      {/* تفاصيل الشطرين */}
      {vr.hemistichs.length > 1 && (
        <div className="border-t border-stone-100/50">
          {vr.hemistichs.map((h, i) => (
            <div
              key={i}
              className={`px-4 py-2 text-xs ${
                i > 0 ? "border-t border-stone-50" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    h.isValid ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="text-stone-400">{i === 0 ? "الشطر الأول" : "الشطر الثاني"}</span>
                <span className="text-stone-300 mr-auto">
                  ثقة: {h.confidence}%
                </span>
              </div>
              <PatternDisplay pattern={h.pattern} />
              {h.notes.length > 0 &&
                h.notes.map((n, ni) => (
                  <p key={ni} className="text-amber-600 mt-1 text-[10px]">
                    💡 {n}
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* شطر واحد فقط */}
      {vr.hemistichs.length === 1 && (
        <div className="border-t border-stone-100/50 px-4 py-2 text-xs">
          <PatternDisplay pattern={vr.hemistichs[0].pattern} />
          {vr.hemistichs[0].confidence < 70 && (
            <p className="text-amber-600 mt-1 text-[10px]">
              💡 ثقة منخفضة — تأكد من التشكيل
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerseAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PoemResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = () => {
    if (!text.trim()) {
      setError("الرجاء إدخال بيت أو أكثر");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const poemResult = analyzePoem(text);
      setResult(poemResult);
    } catch {
      setError("حدث خطأ في التحليل");
    } finally {
      setLoading(false);
    }
  };

  const dominantBahrInfo = result?.dominantBahr
    ? BUHOOR.find((b) => b.id === result.dominantBahr)
    : null;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-2">🔬</div>
        <h2 className="text-2xl font-title font-bold text-teal-800">
          تحليل القصيدة
        </h2>
        <p className="text-stone-400 text-xs mt-1">
          أدخل قصيدة كاملة — كل بيت في سطر — وافصل الشطرين بـ ***
        </p>
      </div>

      <div className="card">
        <label className="block text-stone-600 font-bold mb-2 text-sm">
          ✍️ أدخل الأبيات:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-stone-200 rounded-xl p-4 text-lg font-poem text-stone-800 bg-white/60 focus:border-teal-400 focus:outline-none resize-none leading-loose"
          rows={8}
          placeholder={`البيت الأول شطره الأول *** وشطره الثاني\nالبيت الثاني شطره الأول *** وشطره الثاني\n...`}
          dir="rtl"
        />

        {/* أمثلة */}
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-stone-400 text-[10px]">أمثلة:</span>
          {[
            {
              l: "معلقة امرئ القيس (الطويل)",
              v: "قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ وَمَنْزِلِ *** بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ\nفَقُفْتُ بِهَا وَالطَّرْفُ يُرْفَلُ بَعْدَمَا *** جَلَا غُبَارَتَهَا الرُّكَامُ الْمُثَقَّلُ",
            },
            {
              l: "بيتان (الكامل)",
              v: "هَلْ غَادَرَ الشُّعَرَاءُ مِنْ مُتَرَدَّمِ *** أَمْ هَلْ عَرَفْتَ الدَّارَ بَعْدَ تَوَهُّمِ\nيَا دَارَ عَبْلَةَ بِالْجَوَاءِ تَكَلَّمِي *** وَعِمِي صَبَاحًا دَارَ عَبْلَةَ وَاسْلَمِي",
            },
            {
              l: "بيت واحد (البسيط)",
              v: "يَا دَارَ مَيَّةَ بِالْعَلْيَاءِ فَالسَّنَدِ *** أَقْوَتْ وَطَالَ عَلَيْهَا سَالِفُ الْأَمَدِ",
            },
          ].map((ex) => (
            <button
              key={ex.l}
              onClick={() => setText(ex.v)}
              className="text-[10px] bg-white text-teal-700 px-2.5 py-1 rounded-full border border-stone-200 hover:border-teal-400"
            >
              {ex.l}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={analyze}
          disabled={loading}
          className="btn-primary mt-4 w-full py-2.5 text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جارٍ التحليل...
            </span>
          ) : (
            "🔍 حلّل القصيدة"
          )}
        </button>
      </div>

      {/* النتائج */}
      {result && (
        <div className="fade-in space-y-4">
          {/* ملخص القصيدة */}
          <div className="card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-title font-bold text-teal-800">
                  ملخص التحليل
                </h3>
                <p className="text-stone-400 text-xs mt-0.5">
                  {result.totalVerses} بيتاً —{" "}
                  <span className="text-emerald-600">
                    {result.validVerses} سليم
                  </span>
                  {result.errorVerses > 0 && (
                    <span className="text-rose-600">
                      {" "}
                      — {result.errorVerses} فيه خلل
                    </span>
                  )}
                </p>
              </div>

              {result.dominantBahrName && (
                <div
                  className="px-4 py-2 rounded-xl text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #145449, #1A6B5C)",
                  }}
                >
                  <p className="text-[#C4A35A] text-[10px]">بحر القصيدة</p>
                  <p className="text-white font-title font-bold text-lg">
                    {result.dominantBahrName}
                  </p>
                </div>
              )}
            </div>

            {/* شريط الحالة */}
            {result.totalVerses > 0 && (
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${(result.validVerses / result.totalVerses) * 100}%`,
                  }}
                />
                <div
                  className="bg-rose-400 h-full transition-all"
                  style={{
                    width: `${(result.errorVerses / result.totalVerses) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* الأبيات المختلة */}
            {result.errorLines.length > 0 && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-rose-700 text-xs font-bold">
                  ⚠️ أبيات تحتاج مراجعة:{" "}
                  <span className="font-poem">
                    الأبيات رقم {result.errorLines.join("، ")}
                  </span>
                </p>
                <p className="text-rose-500 text-[10px] mt-1">
                  تأكد من التشكيل أو وجود *** بين الشطرين
                </p>
              </div>
            )}
          </div>

          {/* تفاصيل كل بيت */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-stone-600">
              📋 تفاصيل الأبيات:
            </h4>
            {result.verses.map((vr) => (
              <VerseCard
                key={vr.lineNumber}
                vr={vr}
                bahrInfo={
                  vr.mainBahr
                    ? BUHOOR.find((b) => b.id === vr.mainBahr)
                    : null
                }
              />
            ))}
          </div>

          {/* معلومات البحر الغالب */}
          {dominantBahrInfo && (
            <div className="card">
              <h3 className="text-lg font-title font-bold text-teal-800 mb-3">
                📚 بحر {dominantBahrInfo.name}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                {dominantBahrInfo.description}
              </p>
              <div className="verse-box rounded-xl p-5 text-center mb-4">
                <p className="text-[#C4A35A] text-[10px] mb-1">المفتاح</p>
                <p className="font-poem text-lg leading-loose">
                  {dominantBahrInfo.key.split("***")[0]?.trim()}
                </p>
                {dominantBahrInfo.key.includes("***") && (
                  <p className="font-poem text-lg leading-loose mt-1">
                    {dominantBahrInfo.key.split("***")[1]?.trim()}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {dominantBahrInfo.zihafat.length > 0 && (
                  <div>
                    <h4 className="font-bold text-teal-700 mb-1.5">
                      ⚡ الزحافات:
                    </h4>
                    {dominantBahrInfo.zihafat.map((z, i) => (
                      <div
                        key={i}
                        className="bg-amber-50/80 rounded-lg p-2 mb-1.5 border border-amber-100"
                      >
                        <strong className="text-amber-800">{z.name}:</strong>{" "}
                        <span className="text-stone-500">{z.effect}</span>
                      </div>
                    ))}
                  </div>
                )}
                {dominantBahrInfo.ilal.length > 0 && (
                  <div>
                    <h4 className="font-bold text-teal-700 mb-1.5">
                      🔧 العلل:
                    </h4>
                    {dominantBahrInfo.ilal.map((il, i) => (
                      <div
                        key={i}
                        className="bg-blue-50/80 rounded-lg p-2 mb-1.5 border border-blue-100"
                      >
                        <strong className="text-blue-800">{il.name}:</strong>{" "}
                        <span className="text-stone-500">{il.effect}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
