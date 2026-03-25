"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Globe, Check, Loader2 } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "zh-CN", name: "Chinese", native: "中文" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "id", name: "Indonesian", native: "Indonesia" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "th", name: "Thai", native: "ภาษาไทย" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
];

const cache = {};

const loadCache = () => {
  try {
    const stored = localStorage.getItem("banquetease_translation_cache");
    if (stored) Object.assign(cache, JSON.parse(stored));
  } catch (_) {}
};

const saveCache = () => {
  try {
    localStorage.setItem("banquetease_translation_cache", JSON.stringify(cache));
  } catch (_) {}
};

if (typeof window !== "undefined") loadCache();

const translateText = async (text, targetLang) => {
  if (!text?.trim() || targetLang === "en") return text;
  const key = `${text}|${targetLang}`;
  if (cache[key]) return cache[key];
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${targetLang}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        cache[key] = translated;
        saveCache();
        return translated;
      }
    }
  } catch (_) {}
  return text;
};

const batchTranslate = async (texts, targetLang) => {
  const results = new Map();
  const uncached = texts.filter((t) => {
    const k = `${t}|${targetLang}`;
    if (cache[k]) {
      results.set(t, cache[k]);
      return false;
    }
    return true;
  });

  for (let i = 0; i < uncached.length; i += 5) {
    const batch = uncached.slice(i, i + 5);
    const translations = await Promise.all(
      batch.map((t) => translateText(t, targetLang))
    );
    batch.forEach((t, idx) => {
      if (translations[idx]) results.set(t, translations[idx]);
    });
    if (i + 5 < uncached.length) await new Promise((r) => setTimeout(r, 120));
  }
  return results;
};

const translatePage = async (langCode) => {
  if (langCode === "en") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent?.trim();
      if (t && node._originalText) {
        node.textContent = node._originalText;
        delete node._originalText;
      }
    }
    return;
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let node;

  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (
      text &&
      text.length > 0 &&
      text.length < 300 &&
      !/^[\d\s\-().,/:@#$%&*+=[\]{}!?;'"<>°|~`\\^]*$/.test(text) &&
      node.parentElement?.tagName !== "SCRIPT" &&
      node.parentElement?.tagName !== "STYLE" &&
      node.parentElement?.tagName !== "CODE" &&
      node.parentElement?.tagName !== "KBD"
    ) {
      nodes.push(node);
    }
  }

  const texts = nodes.map((n) => n.textContent);
  const map = await batchTranslate(texts, langCode);

  nodes.forEach((n) => {
    const original = n.textContent;
    const translated = map.get(original);
    if (translated && translated !== original) {
      if (!n._originalText) n._originalText = original;
      n.textContent = translated;
    }
  });
};

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("banquetease_lang");
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setCurrentLang(saved);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const changeLang = useCallback(
    async (code) => {
      if (code === currentLang) {
        setIsOpen(false);
        return;
      }
      setIsTranslating(true);
      setCurrentLang(code);
      setIsOpen(false);
      localStorage.setItem("banquetease_lang", code);
      await translatePage(code);
      setIsTranslating(false);
    },
    [currentLang]
  );

  const active = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        disabled={isTranslating}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 40,
          padding: "0 10px",
          borderRadius: 8,
          background: isOpen ? "var(--color-border)" : "transparent",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-h)",
          fontSize: 12,
          fontWeight: 500,
          cursor: isTranslating ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          opacity: isTranslating ? 0.6 : 1,
        }}
        title="Change language"
      >
        {isTranslating ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Globe size={16} />
        )}
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {isTranslating ? "…" : active.code.toUpperCase().slice(0, 2)}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: 8,
            width: 220,
            maxWidth: "90vw",
            maxHeight: "80vh",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            zIndex: 50,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg-subtle)",
              flexShrink: 0,
            }}
          >
            <Globe size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-h)" }}>
              Select Language
            </span>
          </div>

          {/* Language list */}
          <div style={{ overflowY: "auto", maxHeight: "280px", padding: "4px 0", flex: 1 }}>
            {LANGUAGES.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLang(lang.code)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 16px",
                    textAlign: "left",
                    border: "none",
                    background: isActive
                      ? "rgba(var(--color-primary-rgb), 0.1)"
                      : "transparent",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-h)",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = "var(--color-bg-subtle)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                      width: 28,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {lang.code.toUpperCase().slice(0, 2)}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: isActive ? "var(--color-primary)" : "var(--color-text-h)",
                      }}
                    >
                      {lang.native}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {lang.name}
                    </p>
                  </div>

                  {isActive && (
                    <Check size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "8px 16px",
              borderTop: "1px solid var(--color-border)",
              background: "var(--color-bg-subtle)",
              fontSize: 11,
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            Powered by MyMemory API
            {isTranslating && (
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "var(--color-primary)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              >
                Translating…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
