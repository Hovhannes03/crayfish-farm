import { useNavigate } from "react-router-dom";
import "./homepage.css";
import { useEffect, useState } from "react"
import api from "../api/api";

export default function Home({search}) {
  const [products, setProducts] = useState([])
  let navigate = useNavigate();

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
  }, [])

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
            <img src={item.images[0]} alt="img to crayfish" className="cardimg" />
            <h2 className="top-name">{item.title} - {item.pricePerKg}$</h2>
            <p className="top-text">Lorem  Iusto earum architecto doloribus quaerat veniam exercitationem.</p>
        </div>
      ))}
    </div>
  )
};

