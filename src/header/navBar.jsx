import { Link } from "react-router-dom";
import "./header.css"

export default function Navbar(){
    return <div className="nav">
        <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/products">Products</Link>
            <Link to="/systems">Systems</Link>        
        </nav>
    </div>
    
}