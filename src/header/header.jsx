import "./header.css"
import Navbar from "./navBar"
import SearchBox from "./searchBox"

export default function Header({setSearch}){

    return <div className="header">
        <SearchBox setSearch={setSearch}/>
        <Navbar/>
        
    </div>
}

