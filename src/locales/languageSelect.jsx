import { useState } from "react";
import "./languageSelect.css";

export default function LanguageSelect({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  const options = [
    { code: "am", label: "Հայերեն", flag: "🇦🇲" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ];

  const current = options.find((o) => o.code === lang);

  return (
    <div className="lang-select">
      {/* selected */}
      <div className="selected" onClick={() => setOpen(!open)}>
        <span>{current.flag} ▼</span>
      </div>

      {/* dropdown */}
      {open && (
        <div className="dropdown">
          {options.map((opt) => (
            <div
              key={opt.code}
              className="option"
              onClick={() => {
                setLang(opt.code);
                setOpen(false);
              }}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}