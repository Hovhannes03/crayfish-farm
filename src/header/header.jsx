import { useState } from "react";
import "./header.css"
import Navbar from "./navBar"
import SearchBox from "./searchBox"

export default function Header({setSearch}){
    const [open, setOpen] = useState(false);
    console.log(open, "open");
    
    return <div className="header">
        <SearchBox 
            setSearch={setSearch} 
            setOpen={setOpen}
            open={open}
        />
        <Navbar open={open}/>
    </div>
}

