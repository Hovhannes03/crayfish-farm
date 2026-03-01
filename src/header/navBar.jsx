import { Link } from "react-router-dom";
import "./header.css"

export default function Navbar(){
    return <div className="nav">
        <nav>
            <Link to="/crayfish-farm/">Home</Link>
            <Link to="/crayfish-farm/about">About</Link>
            <Link to="/crayfish-farm/blog">Blog</Link>
            <Link to="/crayfish-farm/products">Products</Link>
            <Link to="/crayfish-farm/systems">Systems</Link>        
        </nav>
    </div>
    
}