import { useNavigate } from "react-router-dom";
import "./homepage.css";
import { useEffect, useState } from "react"
import productsAPI from "../api/api";

export default function Home({search}) {
  const [products, setProducts] = useState(productsAPI)
  let navigate = useNavigate();

  let searchProducts = products.filter((prod) => 
    prod.title.toLowerCase().includes((search || "").toLowerCase())
  )

  return (
    <div className="homepage">
      {searchProducts.map((item) => (
        <div 
          key={item.id} 
          className="top-card"
          onClick={() => navigate(`/products/${item.id}`, { state: item })} 
        > 
            <img src={`/crayfish-farm${item.images[0]}`} alt="img to crayfish" className="cardimg" />
            <h2 className="top-name">{item.title}  </h2>- {item.pricePerKg}$
            <p className="top-text">Lorem  Iusto earum architecto doloribus quaerat veniam exercitationem.</p>
        </div>
      ))}
    </div>
  )
};

