import { Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

const HeaderActions = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [showLang, setShowLang] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const langs = [
    { code: "en" as const, label: "English" },
    { code: "fr" as const, label: "Français" },
    { code: "ar" as const, label: "العربية" },
  ];

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        title={theme === "light" ? "Dark mode" : "Light mode"}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div ref={langRef} className="relative">
        <button
          onClick={() => setShowLang(!showLang)}
          className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </button>
        {showLang && (
          <div className="absolute top-full right-0 mt-1 bg-card border rounded-lg shadow-elevated py-1 min-w-[120px] z-50">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code); setShowLang(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  language === l.code ? "text-primary font-medium" : "text-card-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderActions;
