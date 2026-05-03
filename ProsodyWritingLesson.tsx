"use client";

import { useState } from "react";
import { PROSODY_WRITING_RULES, type ProsodyRule } from "@/lib/arud/prosody-writing-rules";

interface Props {
  sessionId: string;
}

type LessonPhase = "intro" | "rules" | "complete";

function normalizeArabic(str: string): string {
  return str.replace(/[\u064B-\u065F]/g, "").replace(/\s+/g, "").toLowerCase().trim();
}

function checkAnswer(userAnswer: string, correct: string): boolean {
  return normalizeArabic(userAnswer) === normalizeArabic(correct) || userAnswer.trim() === correct.trim();
}

function RuleCard({ rule, onComplete }: { rule: ProsodyRule; onComplete: () => void }) {
  const [phase, setPhase] = useState<"learn" | "exercise">("learn");
  const [currentEx, setCurrentEx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [allDone, setAllDone] = useState(false);

  if (rule.id === "intro") {
    return (
      <div className="space-y-4">
        <div className="card">
          <h3 className="text-lg font-title font-bold text-teal-800 mb-3">📖 {rule.arabicTitle}</h3>
          <div className="text-stone-500 leading-relaxed whitespace-pre-line text-sm">{rule.explanation}</div>
        </div>
        {rule.examples.length > 0 && (
          <div className="card">
            <h4 className="font-bold text-teal-700 text-sm mb-2">أمثلة:</h4>
            {rule.examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 mb-2 p-2 bg-[#F5EDE3]/50 rounded-lg text-sm">
                <span className="font-poem text-stone-400 line-through">{ex.original}</span>
                <span className="text-stone-300">←</span>
                <span className="font-poem text-emerald-700 font-bold">{ex.prosody}</span>
                {ex.note && <span className="text-[10px] text-stone-400">{ex.note}</span>}
              </div>
            ))}
          </div>
        )}
        <button onClick={onComplete} className="btn-primary w-full py-2.5 text-sm">انتقل للدرس التالي ←</button>
      </div>
    );
  }

  const exercise = rule.exercises[currentEx];
  const handleSubmit = () => {
    if (!exercise) return;
    const ok = checkAnswer(userAnswer, exercise.correctAnswer);
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setTimeout(() => {
      if (currentEx + 1 >= rule.exercises.length) setAllDone(true);
      else { setCurrentEx((c) => c + 1); setUserAnswer(""); setFeedback(null); }
    }, 1200);
  };

  if (allDone) {
    return (
      <div className="text-center py-6 space-y-4 fade-in">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-title font-bold text-emerald-700">أحسنت! أتقنت هذه القاعدة</h3>
        <p className="text-stone-400 text-sm">{rule.arabicTitle}</p>
        <button onClick={onComplete} className="btn-success px-6 py-2 text-sm">القاعدة التالية ←</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {phase === "learn" && (
        <div className="fade-in space-y-4">
          <div className="card">
            <h3 className="text-lg font-title font-bold text-teal-800 mb-2">📖 {rule.arabicTitle}</h3>
            <div className="text-stone-500 leading-relaxed whitespace-pre-line text-sm">{rule.explanation}</div>
          </div>
          {rule.examples.length > 0 && (
            <div className="card">
              <h4 className="font-bold text-teal-700 text-sm mb-2">أمثلة توضيحية:</h4>
              <div className="space-y-2">
                {rule.examples.map((ex, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-3 p-2.5 bg-[#F5EDE3]/40 rounded-lg border border-[#E5D9C8]/50">
                    <div className="text-center">
                      <div className="text-[10px] text-stone-400 mb-0.5">الإملائية</div>
                      <span className="font-poem text-stone-500">{ex.original}</span>
                    </div>
                    <span className="text-stone-300">←</span>
                    <div className="text-center">
                      <div className="text-[10px] text-emerald-600 mb-0.5">العروضية</div>
                      <span className="font-poem text-emerald-700 font-bold">{ex.prosody}</span>
                    </div>
                    {ex.note && <div className="flex-1 text-[10px] text-teal-700 bg-teal-50/60 rounded-lg p-1.5">💡 {ex.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {rule.exercises.length > 0 ? (
            <button onClick={() => setPhase("exercise")} className="btn-primary w-full py-2.5 text-sm">
              🖊️ ابدأ التمرين
            </button>
          ) : (
            <button onClick={onComplete} className="btn-primary w-full py-2.5 text-sm">التالي ←</button>
          )}
        </div>
      )}

      {phase === "exercise" && exercise && (
        <div className="fade-in space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>تمرين {currentEx + 1} من {rule.exercises.length}</span>
            <div className="flex gap-1">
              {rule.exercises.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < currentEx ? "bg-emerald-400" : i === currentEx ? "bg-teal-500" : "bg-stone-200"}`} />
              ))}
            </div>
          </div>
          <div className="card">
            <p className="font-bold text-teal-800 text-sm mb-3">{exercise.question}</p>
            <div className="text-center my-3">
              <span className="font-poem text-2xl text-teal-800 bg-[#F5EDE3] px-5 py-2 rounded-xl border border-[#C4A35A]/30">{exercise.word}</span>
            </div>
          </div>
          <div>
            <input type="text" value={userAnswer}
              onChange={(e) => { setUserAnswer(e.target.value); setFeedback(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border border-stone-200 rounded-xl p-3 text-lg font-poem text-center bg-white/70 focus:border-teal-400 focus:outline-none"
              placeholder="اكتب الإجابة..." dir="rtl" />
            {exercise.hint && <p className="text-[10px] text-stone-400 mt-1 text-right">💡 {exercise.hint}</p>}
          </div>
          {feedback === "correct" && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center fade-in">
              <span className="text-xl">✅</span>
              <p className="text-emerald-700 font-bold text-sm mt-0.5">أحسنت!</p>
              <p className="text-emerald-600 text-xs">{exercise.correctAnswer}</p>
            </div>
          )}
          {feedback === "wrong" && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 fade-in">
              <span className="text-lg">❌</span>
              <p className="text-rose-700 font-bold text-sm">حاول مجدداً!</p>
              <p className="text-stone-400 text-xs mt-0.5">تلميح: {exercise.hint}</p>
              <button onClick={() => { setUserAnswer(exercise.correctAnswer); setFeedback("correct");
                setTimeout(() => { if (currentEx + 1 >= rule.exercises.length) setAllDone(true);
                  else { setCurrentEx((c) => c + 1); setUserAnswer(""); setFeedback(null); } }, 1500);
              }} className="text-[10px] text-rose-600 underline mt-1 block">أرني الإجابة</button>
            </div>
          )}
          <button onClick={handleSubmit} disabled={!userAnswer.trim()} className="btn-primary w-full py-2.5 text-sm">
            تحقق ✓
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProsodyWritingLesson({ sessionId }: Props) {
  const [phase, setPhase] = useState<LessonPhase>("intro");
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const orderedRules = [...PROSODY_WRITING_RULES].sort((a, b) => a.order - b.order);
  const currentRule = orderedRules[currentRuleIndex];

  if (phase === "intro") {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-5xl mb-3">📜</div>
          <h2 className="text-2xl font-title font-bold text-teal-800">درس الكتابة العروضية</h2>
          <p className="text-stone-400 mt-2 text-sm max-w-lg mx-auto leading-relaxed">
            الكتابة العروضية هي أساس فهم الشعر وأوزانه. ستتعلم كيف تكتب الكلام العربي بالطريقة الصوتية لا الإملائية.
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #145449, #1A6B5C)" }}>
          <h3 className="font-title font-bold text-[#C4A35A] mb-3 text-sm">ما ستتعلمه:</h3>
          <ul className="space-y-1.5">
            {orderedRules.filter((r) => r.id !== "intro").map((r, i) => (
              <li key={r.id} className="flex items-center gap-2 text-teal-100 text-xs">
                <span className="w-5 h-5 bg-teal-700 rounded-full flex items-center justify-center text-[10px] text-teal-100 font-bold shrink-0">{i + 1}</span>
                <span>{r.arabicTitle}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-bold text-teal-800 text-sm mb-2">المبدأ الأساسي:</h3>
          <div className="border-r-2 border-[#C4A35A] pr-3 py-1">
            <p className="font-poem text-teal-800 text-center text-lg">«نكتب ما يُنطق، لا ما يُكتب»</p>
          </div>
          <p className="text-stone-500 text-xs mt-3 leading-relaxed">
            الكتابة العروضية تهتم بالصوت الحقيقي للكلمات، لا بقواعد الإملاء. الهمزات التي لا تُنطق تُحذف، والحروف المشددة تُكتب مرتين، والتنوين يُكتب نوناً ساكنة.
          </p>
        </div>
        <button onClick={() => { setPhase("rules"); setCurrentRuleIndex(0); }} className="btn-primary w-full py-3 text-sm">
          🚀 ابدأ الدرس
        </button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="text-center py-10 space-y-5 fade-in">
        <div className="text-6xl">🏆</div>
        <h2 className="text-2xl font-title font-bold text-teal-800">تهانينا! أتقنت الكتابة العروضية</h2>
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 max-w-sm mx-auto">
          <div className="text-3xl mb-2">🎓</div>
          <p className="text-emerald-700 font-bold text-sm">شهادة إتمام الدرس</p>
          <p className="text-emerald-600 text-xs mt-1">{orderedRules.length} قاعدة</p>
        </div>
        <button onClick={() => { setPhase("rules"); setCurrentRuleIndex(0); }} className="btn-secondary text-sm">🔄 مراجعة</button>
      </div>
    );
  }

  if (phase === "rules" && currentRule) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-400">
            <span>القاعدة {currentRuleIndex + 1} من {orderedRules.length}: <strong className="text-teal-700">{currentRule.arabicTitle}</strong></span>
            <span>{Math.round((currentRuleIndex / orderedRules.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full">
            <div className="h-1.5 bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${(currentRuleIndex / orderedRules.length) * 100}%` }} />
          </div>
        </div>
        <RuleCard key={currentRule.id} rule={currentRule} onComplete={() => {
          if (currentRuleIndex + 1 >= orderedRules.length) setPhase("complete");
          else setCurrentRuleIndex((i) => i + 1);
        }} />
        {currentRuleIndex > 0 && (
          <button onClick={() => setCurrentRuleIndex((i) => i - 1)} className="btn-secondary w-full text-sm py-2">← السابقة</button>
        )}
      </div>
    );
  }

  return null;
}
