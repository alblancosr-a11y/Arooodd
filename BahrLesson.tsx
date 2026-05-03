"use client";

import { useState } from "react";
import { BUHOOR, ALL_TAFAELAT, type Bahr } from "@/lib/arud/buhoor-data";
import { syllabify } from "@/lib/arud/prosody-analyzer";

interface Props {
  sessionId: string;
}

type LessonPhase = "select" | "intro" | "tafaelat" | "quiz1" | "quiz2" | "quiz3" | "complete";

// Quiz 1: عدد التفعيلات
function Quiz1({ bahr, onCorrect }: { bahr: Bahr; onCorrect: () => void }) {
  const correctCount = bahr.tafaelat.length;
  const options = [correctCount - 1, correctCount, correctCount + 1, correctCount + 2]
    .filter((n) => n > 0)
    .sort(() => Math.random() - 0.5);

  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (n: number) => {
    if (answered) return;
    setSelected(n);
    setAnswered(true);
    if (n === correctCount) setTimeout(onCorrect, 1000);
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="text-center">
        <div className="text-4xl mb-2">🧮</div>
        <h3 className="text-lg font-title font-bold text-teal-800">السؤال الأول</h3>
        <p className="text-stone-500 text-sm mt-1">
          كم عدد تفعيلات بحر <strong className="text-teal-700">{bahr.name}</strong> في الشطر الواحد؟
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
        {options.map((n) => (
          <button key={n} onClick={() => handleSelect(n)}
            className={`py-5 text-2xl font-bold rounded-xl border-2 transition-all duration-200 ${
              answered
                ? n === correctCount ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                  : n === selected ? "bg-rose-50 border-rose-400 text-rose-700"
                  : "bg-stone-50 border-stone-200 text-stone-300"
                : "bg-white border-stone-200 text-stone-700 hover:border-teal-400 hover:bg-teal-50 cursor-pointer"
            }`}>
            {n}
          </button>
        ))}
      </div>
      {answered && (
        <div className={`text-center p-3 rounded-xl text-sm fade-in ${
          selected === correctCount ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
          {selected === correctCount ? (
            <p className="font-bold">✅ ممتاز! الإجابة صحيحة</p>
          ) : (
            <>
              <p className="font-bold">❌ خطأ!</p>
              <p className="text-xs mt-1">الإجابة: <strong>{correctCount} تفعيلات</strong></p>
              <button onClick={onCorrect} className="btn-secondary mt-2 text-xs py-1">التالي ←</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Quiz 2: تحديد التفعيلات (بدون تكرار المتشابهات)
function Quiz2({ bahr, onCorrect }: { bahr: Bahr; onCorrect: () => void }) {
  const uniqueTafaelat = [...new Set(bahr.tafaelat)];
  const correctSet = new Set(uniqueTafaelat);
  const wrongOptions = ALL_TAFAELAT.filter((t) => !correctSet.has(t))
    .sort(() => Math.random() - 0.5).slice(0, 5);
  const allOptions = [...uniqueTafaelat, ...wrongOptions].sort(() => Math.random() - 0.5);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (t: string) => {
    if (submitted) return;
    setSelected((prev) => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const ok = selected.size === uniqueTafaelat.length && uniqueTafaelat.every((t) => selected.has(t));
    if (ok) setTimeout(onCorrect, 1200);
  };

  const isCorrect = submitted && selected.size === uniqueTafaelat.length && uniqueTafaelat.every((t) => selected.has(t));
  const label = uniqueTafaelat.length === 1 ? "تفعيلة واحدة" : uniqueTafaelat.length === 2 ? "تفعيلتان" : `${uniqueTafaelat.length} تفعيلات`;

  return (
    <div className="space-y-5 fade-in">
      <div className="text-center">
        <div className="text-4xl mb-2">🎯</div>
        <h3 className="text-lg font-title font-bold text-teal-800">السؤال الثاني</h3>
        <p className="text-stone-500 text-sm mt-1">
          اختر التفعيلات المختلفة لبحر <strong className="text-teal-700">{bahr.name}</strong> ({label})
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {allOptions.map((t) => {
          const isC = correctSet.has(t);
          const isSel = selected.has(t);
          return (
            <button key={t} onClick={() => toggle(t)}
              className={`font-poem text-base px-3.5 py-1.5 rounded-xl border-2 transition-all duration-200 ${
                submitted
                  ? isC ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                    : isSel ? "bg-rose-50 border-rose-400 text-rose-700"
                    : "bg-stone-50 border-stone-200 text-stone-300"
                  : isSel ? "bg-teal-700 border-teal-700 text-white shadow-md"
                    : "bg-white border-stone-200 text-stone-600 hover:border-teal-300 cursor-pointer"
              }`}>
              {t}
            </button>
          );
        })}
      </div>
      {!submitted && (
        <button onClick={handleSubmit} disabled={selected.size === 0} className="btn-primary w-full py-2.5 text-sm">
          تحقق من اختياري
        </button>
      )}
      {submitted && (
        <div className={`text-center p-3 rounded-xl text-sm fade-in ${
          isCorrect ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
          {isCorrect ? (
            <p className="font-bold">✅ ممتاز! اخترت جميع التفعيلات الصحيحة</p>
          ) : (
            <>
              <p className="font-bold">❌ خطأ!</p>
              <p className="text-xs mt-1">الصحيح: <strong>{uniqueTafaelat.join("، ")}</strong></p>
              <button onClick={onCorrect} className="btn-secondary mt-2 text-xs py-1">التالي ←</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Quiz 3: كتابة المفتاح
function Quiz3({ bahr, onCorrect }: { bahr: Bahr; onCorrect: () => void }) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const keyParts = bahr.key.split("***");
  const tafaelatPart = keyParts[1]?.trim() ?? bahr.tafaelat.join(" ");
  const normalize = (s: string) => s.replace(/[\u064B-\u065F]/g, "").replace(/\s+/g, " ").trim();

  const checkKey = () => {
    const uN = normalize(userInput);
    const kN = normalize(tafaelatPart);
    const tN = bahr.tafaelat.map(normalize);
    if (uN === kN || tN.every((t) => uN.includes(t))) {
      setFeedback("correct"); setTimeout(onCorrect, 1500);
    } else { setFeedback("wrong"); }
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="text-center">
        <div className="text-4xl mb-2">🔑</div>
        <h3 className="text-lg font-title font-bold text-teal-800">السؤال الأخير</h3>
        <p className="text-stone-500 text-sm mt-1">
          اكتب تفعيلات بحر <strong className="text-teal-700">{bahr.name}</strong> — لا يهم التشكيل
        </p>
      </div>
      <div className="verse-box rounded-xl p-4 text-center">
        <p className="text-[#C4A35A] text-[10px] mb-1">المفتاح</p>
        <p className="font-poem text-lg">{keyParts[0]?.trim()}</p>
        {keyParts[1] && <><p className="text-teal-300 text-sm my-1">✦</p><p className="text-teal-200 text-sm">أكمل التفعيلات...</p></>}
      </div>
      <textarea value={userInput} onChange={(e) => { setUserInput(e.target.value); setFeedback(null); }}
        className="w-full border border-stone-200 rounded-xl p-3 text-lg font-poem text-center bg-white/70 focus:border-teal-400 focus:outline-none resize-none"
        rows={2} placeholder="اكتب التفعيلات هنا..." dir="rtl" />
      {feedback === "correct" && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center fade-in">
          <span className="text-2xl">✅</span>
          <p className="text-emerald-800 font-bold mt-1">ممتاز!</p>
          <p className="text-emerald-600 text-xs mt-1">المفتاح: {tafaelatPart}</p>
        </div>
      )}
      {feedback === "wrong" && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 fade-in">
          <p className="text-rose-700 font-bold text-sm">❌ غير صحيح</p>
          <p className="text-stone-500 text-xs mt-1">الصحيح: <strong className="font-poem">{tafaelatPart}</strong></p>
          <button onClick={() => { setUserInput(tafaelatPart); setFeedback("correct"); setTimeout(onCorrect, 1500); }}
            className="btn-secondary mt-2 text-xs py-1">أرني الإجابة</button>
        </div>
      )}
      {feedback === null && (
        <button onClick={checkKey} disabled={!userInput.trim()} className="btn-primary w-full py-2.5 text-sm">
          تحقق من الإجابة ✓
        </button>
      )}
    </div>
  );
}

export default function BahrLesson({ sessionId }: Props) {
  const [phase, setPhase] = useState<LessonPhase>("select");
  const [selectedBahr, setSelectedBahr] = useState<Bahr | null>(null);
  const [completedBuhoor, setCompletedBuhoor] = useState<Set<string>>(new Set());

  const handleComplete = () => {
    if (selectedBahr) setCompletedBuhoor((p) => new Set([...p, selectedBahr.id]));
    setPhase("complete");
  };

  if (phase === "select") {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">🎵</div>
          <h2 className="text-2xl font-title font-bold text-teal-800">دروس البحور الشعرية</h2>
          <p className="text-stone-400 text-xs mt-1">اختر البحر — ستتعلم مفتاحه وتفعيلاته ثم تُختبر</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUHOOR.map((b) => {
            const done = completedBuhoor.has(b.id);
            return (
              <button key={b.id} onClick={() => { setSelectedBahr(b); setPhase("intro"); }}
                className={`p-3.5 rounded-xl border text-right transition-all duration-200 relative ${
                  done ? "border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50"
                    : "border-stone-200/60 bg-white/70 hover:border-teal-300 hover:bg-white"
                }`}>
                {done && <span className="absolute top-2 left-2 text-emerald-500 text-xs">✓</span>}
                <h3 className="font-title font-bold text-teal-800">{b.name}</h3>
                <p className="text-stone-400 text-[10px] font-poem mt-0.5">
                  {b.tafaelat.slice(0, 2).join(" ")}{b.tafaelat.length > 2 ? " ..." : ""}
                </p>
              </button>
            );
          })}
        </div>
        {completedBuhoor.size > 0 && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-center text-sm text-emerald-700">
            🏆 أتممت {completedBuhoor.size} من {BUHOOR.length} بحراً
          </div>
        )}
      </div>
    );
  }

  if (phase === "complete" && selectedBahr) {
    return (
      <div className="text-center py-8 space-y-5 fade-in">
        <div className="text-6xl">🎓</div>
        <h2 className="text-2xl font-title font-bold text-teal-800">أحسنت! أتقنت بحر {selectedBahr.name}</h2>
        <div className="verse-box rounded-2xl p-5 max-w-sm mx-auto">
          <p className="text-[#C4A35A] text-[10px] mb-1">المفتاح</p>
          <p className="font-poem text-base leading-loose">{selectedBahr.key.split("***")[0]?.trim()}</p>
          {selectedBahr.key.includes("***") && <p className="font-poem text-base leading-loose mt-1">{selectedBahr.key.split("***")[1]?.trim()}</p>}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => setPhase("select")} className="btn-secondary text-sm">← بحر آخر</button>
          <button onClick={() => setPhase("intro")} className="btn-primary text-sm">🔄 أعد الدرس</button>
        </div>
      </div>
    );
  }

  if (!selectedBahr) return null;

  return (
    <div className="space-y-4">
      <button onClick={() => setPhase("select")} className="text-teal-700 hover:text-teal-900 text-xs flex items-center gap-1">
        ← العودة لقائمة البحور
      </button>

      {/* Intro */}
      {phase === "intro" && (
        <div className="space-y-4 fade-in">
          <div className="text-center">
            <div className="text-4xl mb-2">📖</div>
            <h2 className="text-2xl font-title font-bold text-teal-800">بحر {selectedBahr.name}</h2>
          </div>
          <div className="verse-box rounded-2xl p-5 text-center">
            <p className="text-[#C4A35A] text-[10px] mb-2">المفتاح الشعري</p>
            <p className="font-poem text-xl leading-loose">{selectedBahr.key.split("***")[0]?.trim()}</p>
            {selectedBahr.key.includes("***") && (
              <>
                <div className="text-[#C4A35A] text-sm my-1.5">✦</div>
                <p className="font-poem text-xl leading-loose">{selectedBahr.key.split("***")[1]?.trim()}</p>
              </>
            )}
            <p className="text-teal-300 text-[10px] mt-2">— {selectedBahr.keyAttribution}</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-teal-800 text-sm mb-2">📚 عن البحر:</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{selectedBahr.description}</p>
            <p className="mt-2 text-xs text-teal-700 bg-teal-50/60 rounded-lg p-2 border border-teal-100">{selectedBahr.info}</p>
          </div>
          {selectedBahr.examples.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-teal-800 text-sm mb-2">🌟 شواهد:</h3>
              {selectedBahr.examples.slice(0, 2).map((ex, i) => (
                <div key={i} className="verse-box rounded-xl p-3 mb-2 text-center">
                  <p className="font-poem text-sm leading-loose">{ex.verse.split("***")[0]?.trim()}</p>
                  {ex.verse.includes("***") && (
                    <><div className="text-[#C4A35A] text-xs my-0.5">✦</div>
                    <p className="font-poem text-sm leading-loose">{ex.verse.split("***")[1]?.trim()}</p></>
                  )}
                  {ex.poet && <p className="text-teal-300 text-[10px] mt-1">— {ex.poet}</p>}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setPhase("tafaelat")} className="btn-primary w-full py-2.5 text-sm">
            التالي: التفعيلات →
          </button>
        </div>
      )}

      {/* Tafaelat */}
      {phase === "tafaelat" && (
        <div className="space-y-4 fade-in">
          <div className="text-center">
            <div className="text-3xl mb-2">🎼</div>
            <h2 className="text-lg font-title font-bold text-teal-800">تفعيلات بحر {selectedBahr.name}</h2>
          </div>
          <div className="card">
            <h3 className="font-bold text-teal-800 text-sm mb-3">
              {selectedBahr.tafaelat.length} تفعيلة في الشطر:
            </h3>
            <div className="space-y-2">
              {[...new Set(selectedBahr.tafaelat)].map((tafila) => {
                const count = selectedBahr.tafaelat.filter((t) => t === tafila).length;
                return (
                  <div key={tafila} className="flex items-center gap-3 p-2.5 bg-[#F5EDE3]/50 rounded-lg border border-[#E5D9C8]/50">
                    <div className="text-center min-w-[90px]">
                      <div className="font-poem text-xl text-teal-800">{tafila}</div>
                      {count > 1 && <div className="text-[10px] text-stone-400">× {count} في الشطر</div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-stone-400 mb-1">/ متحرك | ٥ ساكن</p>
                      <div className="flex flex-wrap gap-0">
                        {syllabify(tafila).split("").map((ch, ci) => (
                          <span key={ci} className={`text-sm font-bold mx-[1px] ${ch === "/" ? "text-teal-700" : "text-amber-700"}`}>{ch}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-stone-200/50">
            <p className="text-stone-500 text-xs font-bold mb-1.5">الترتيب:</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {selectedBahr.tafaelat.map((t, i) => <span key={i} className="tafila-box">{t}</span>)}
            </div>
            {selectedBahr.basePatternArr[1] && (
              <>
                <p className="text-center text-stone-300 text-xs my-1.5">✦</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {selectedBahr.basePatternArr[1].map((t, i) => <span key={i} className="tafila-box">{t}</span>)}
                </div>
              </>
            )}
          </div>
          <button onClick={() => setPhase("quiz1")} className="btn-primary w-full py-2.5 text-sm">
            🧪 ابدأ الاختبار →
          </button>
        </div>
      )}

      {/* Quiz phases */}
      {phase === "quiz1" && (
        <div className="space-y-3">
          <div className="text-center text-xs text-stone-400">الاختبار: ١ من ٣</div>
          <div className="h-1.5 bg-stone-100 rounded-full"><div className="h-1.5 bg-teal-600 rounded-full w-1/3" /></div>
          <Quiz1 bahr={selectedBahr} onCorrect={() => setPhase("quiz2")} />
        </div>
      )}
      {phase === "quiz2" && (
        <div className="space-y-3">
          <div className="text-center text-xs text-stone-400">الاختبار: ٢ من ٣</div>
          <div className="h-1.5 bg-stone-100 rounded-full"><div className="h-1.5 bg-teal-600 rounded-full w-2/3" /></div>
          <Quiz2 bahr={selectedBahr} onCorrect={() => setPhase("quiz3")} />
        </div>
      )}
      {phase === "quiz3" && (
        <div className="space-y-3">
          <div className="text-center text-xs text-stone-400">الاختبار: ٣ من ٣</div>
          <div className="h-1.5 bg-stone-100 rounded-full"><div className="h-1.5 bg-teal-600 rounded-full" /></div>
          <Quiz3 bahr={selectedBahr} onCorrect={handleComplete} />
        </div>
      )}
    </div>
  );
}
