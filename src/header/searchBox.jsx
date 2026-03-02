import searchPng from "../assets/search.png";
import itemsIcon from "../assets/icon.png";
import userIcon from "../assets/Vector.svg"
import "./header.css";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../locales";
import LanguageSelect from "../locales/languageSelect";


export default function SearchBox({search, setSearch, setOpen, open}){
    const inputRef = useRef(null);
    let [inputValue, setInputValue] = useState("");
    const [lang, setLang] = useState("am");

    const t = translations[lang];

    function handleClick (){
        inputRef.current.focus();
    }

    const handleSubmit = (e) => {
    e.preventDefault(); 
    setSearch(inputValue); 
    setInputValue(""); 
  };

    function handleLogoClick() {
    setInputValue("");
    setSearch("");
    inputRef.current?.blur();
    }

    return (
        <div className="searchBox">
            <div className="shopper" >
                <Link
                    to="/"
                    className="shoper"
                    onClick={handleLogoClick}
                >
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
                    <button 
                        onClick={() => {
                            handleClick()
                        }}
                        type="submit"
                        className="search-btn">
                        <img src={searchPng} alt="search" />
                    </button>
                </form>
            </div>
            
            <div className="additem-logn">
                <LanguageSelect lang={lang} setLang={setLang}/>
                <div className="items">
                    <img src={itemsIcon} alt="itemsIcon" /> {t.itemsAdded}
                </div>
                <div className="login">
                    <img src={userIcon} alt="userIcon" /> Login or Sign Up
                </div>
            </div>
            <div className="burger" onClick={() => setOpen(!open)}>
                ☰
            </div>
        </div>
    )
}