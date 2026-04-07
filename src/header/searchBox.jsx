import searchPng from "../assets/search.png";
import itemsIcon from "../assets/Icon.png";
import userIcon from "../assets/Vector.svg";
import "./header.css";
import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../locales";
import LanguageSelect from "../locales/languageSelect";
import { CountryContext } from "../App";

export default function SearchBox({ setSearch, setOpen, open }) {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const { lang, setLang } = useContext(CountryContext);
  const t = translations[lang] || translations["am"];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(inputValue);
    setInputValue("");
  };

  return (
    <div className="searchBox">
      <div className="shopper">
        <Link to="/" className="shoper" onClick={() => { setInputValue(""); setSearch(""); }}>
          <p className="shop">Cray</p>Fish
        </Link>
      </div>

      <div className="search-box">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="searchInp"
            placeholder="Search Order"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="search-btn" onClick={() => inputRef.current.focus()}>
            <img src={searchPng} alt="search" />
          </button>
        </form>
      </div>

      <div className="additem-logn">
        <LanguageSelect lang={lang} setLang={setLang} />
        <div className="items">
          <img src={itemsIcon} alt="itemsIcon" /> {t.itemsAdded}
        </div>
        <div className="login">
          <img src={userIcon} alt="userIcon" /> Login or Sign Up
        </div>
      </div>
      
      <div className="burger" onClick={() => setOpen(!open)}>☰</div>
    </div>
  );
}
