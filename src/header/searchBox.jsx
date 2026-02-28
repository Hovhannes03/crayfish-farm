import searchPng from "../assets/search.png";
import itemsIcon from "../assets/icon.png";
import userIcon from "../assets/Vector.svg"
import "./header.css";
import { useRef, useState } from "react";


export default function SearchBox({setSearch}){
    const inputRef = useRef(null);
    let [inputValue, setInputValue] = useState("");

    function handleClick (){
        inputRef.current.focus();
    }

    const handleSubmit = (e) => {
    e.preventDefault(); 
    setSearch(inputValue); 
    setInputValue(""); 
  };

    return (
        <div className="searchBox">
            <div className="shopper">
                <a href="#" className="shoper"><p className="shop">Cray</p>Fish</a>
            </div>
            <div className="search-box">
                <form onSubmit={handleSubmit}>
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="searchInp"
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
                <div className="items">
                    <img src={itemsIcon} alt="itemsIcon" />Items Added
                </div>
                <div className="login">
                    <img src={userIcon} alt="userIcon" /> Login or Sign Up
                </div>
            </div>
            
        </div>
    )
}