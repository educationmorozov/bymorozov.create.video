/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clapperboard, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Info, 
  Loader2,
  Video,
  Send
} from "lucide-react";
import { generateVideoPrompt } from "./lib/gemini";
import { cn } from "./lib/utils";

export default function App() {
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Обработка...");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let interval: any;
    if (loading) {
      const texts = ["Обработка...", "Анализируем идею...", "Создаем промпт...", "Почти готово..."];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 2000);
    } else {
      setLoadingText("Обработка...");
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(""); // Clear previous result
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, details }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate");
      }
      
      setResult(data.prompt);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Ошибка при генерации. Попробуйте еще раз.";
      if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("API key not valid")) {
        errorMessage = "❌ Недействительный API ключ. Проверьте правильность вставки в панели Secrets.";
      } else if (error?.message?.includes("API_KEY_MISSING")) {
        errorMessage = "⚠️ API ключ не найден в системе (на сервере). Пожалуйста, убедитесь, что GEMINI_API_KEY добавлен в панель Secrets и приложение перезапущено.";
      } else if (error?.message?.includes("quota") || error?.message?.includes("429")) {
        errorMessage = "⏳ Лимит исчерпан. Пожалуйста, подождите 1-2 минуты.";
      }
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-zinc-700">
      {/* Background Glow - Neutral/Dark */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 md:py-16">
        {/* Header Section */}
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2"
          >
            АКСЕЛЕРАТОР
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-medium text-zinc-400 tracking-[0.3em] uppercase mb-8"
          >
            bymorozov
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="h-px w-16 bg-zinc-800 mx-auto mb-8"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-8 py-4 border border-zinc-800 rounded-2xl bg-zinc-900/30 backdrop-blur-md relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/5 to-transparent rounded-2xl pointer-events-none" />
            <h2 className="text-xl md:text-3xl font-medium tracking-tight relative z-10">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-100 animate-gradient-x">
                создаем видео для твоего ролика
              </span>
            </h2>
          </motion.div>
        </header>

        <div className="space-y-16">
          {/* Step 1 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center font-mono text-sm text-zinc-400">01</span>
              <h3 className="text-lg font-medium text-zinc-200 uppercase tracking-wide">Опишите вашу идею</h3>
            </div>
            <div className="space-y-4 bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl backdrop-blur-md">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold ml-1">Тема ролика</label>
                <input
                  type="text"
                  placeholder="Например: Одинокий путник в горах"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold ml-1">Детали и атмосфера</label>
                <textarea
                  placeholder="Опишите свет, одежду, движения..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-zinc-500 transition-all resize-none placeholder:text-zinc-700"
                />
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center font-mono text-sm text-zinc-400">02</span>
              <h3 className="text-lg font-medium text-zinc-200 uppercase tracking-wide">сгенерируйте промт для видео</h3>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className={cn(
                "w-full py-5 rounded-xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.99]",
                loading || !topic.trim() 
                  ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800" 
                  : "bg-white text-black hover:bg-zinc-200 shadow-2xl shadow-white/5"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{loadingText}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Создать промт</span>
                </>
              )}
            </button>
          </section>

          {/* Step 3 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center font-mono text-sm text-zinc-400">03</span>
              <h3 className="text-lg font-medium text-zinc-200 uppercase tracking-wide">Скопируйте результат</h3>
            </div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">English AI Prompt</span>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-white" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-zinc-300 font-mono text-xs leading-relaxed bg-black/50 p-5 rounded-xl border border-zinc-800/50">
                    {result}
                  </p>
                </motion.div>
              ) : (
                <div key="placeholder" className="bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-zinc-700">
                  <p className="text-xs uppercase tracking-widest">Ожидание генерации...</p>
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* Step 4 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center font-mono text-sm text-zinc-400">04</span>
              <h3 className="text-lg font-medium text-zinc-200 uppercase tracking-wide">Перейдите к созданию видео</h3>
            </div>
            
            <button
              onClick={() => window.open("https://videofx.google.com/", "_blank")}
              className="w-full py-6 bg-zinc-100 hover:bg-white text-black rounded-xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.99] border border-white"
            >
              Создать видео
              <ExternalLink size={18} />
            </button>

            {/* Detailed Instructions */}
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-8 mt-10">
              <h4 className="text-sm font-bold mb-8 uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                <div className="w-1 h-4 bg-white" />
                Инструкция по генерации
              </h4>
              <div className="grid gap-8 text-zinc-500 text-sm">
                <div className="flex gap-4">
                  <span className="text-zinc-700 font-mono">01</span>
                  <p>Перейдите по ссылке и зайдите через свою <strong>почту Google</strong>.</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-700 font-mono">02</span>
                  <p>Нажмите кнопку <strong>"Create project"</strong> (Создать проект).</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-700 font-mono">03</span>
                  <p>Вставьте скопированный текст из Шага 03 в основное поле ввода.</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-700 font-mono">04</span>
                  <p>В настройках (Settings) выберите формат <strong>9:16</strong> для вертикальных видео или <strong>16:9</strong> для горизонтальных.</p>
                </div>
                <div className="flex gap-4">
                  <span className="text-zinc-700 font-mono">05</span>
                  <p>Нажмите <strong>"Generate"</strong>. После завершения наведите на видео и нажмите иконку <strong>загрузки</strong>, чтобы сохранить результат.</p>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-12 pt-8 border-t border-zinc-800 text-center"
              >
                <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-500">
                  Поздравляю! Видео готово!
                </p>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center border-t border-zinc-900 pt-10">
          <p className="text-zinc-700 text-[10px] tracking-[0.4em] uppercase font-bold">
            bymorozov © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
}
