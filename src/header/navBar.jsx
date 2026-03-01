import { Link } from "react-router-dom";
import "./header.css"

export default function Navbar({open}){


    return <div className="nav">    
        <nav className={open ? "activve" : ""}>
            <ul>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/products">Products</Link>
                <Link to="/systems">Systems</Link>    
            </ul>
                
        </nav>
    </div>
}