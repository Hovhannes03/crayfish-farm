import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import productsAPI from "../api/api";
import { CountryContext } from "../App";
import "./homepage.css";

export default function Home({ search }) {
  const [products] = useState(productsAPI);
  const navigate = useNavigate();
  const { lang } = useContext(CountryContext);

  const searchProducts = products.filter((prod) => {
    const title = prod[`title_${lang}`] || "";
    return title.toLowerCase().includes((search || "").toLowerCase());
  });

  return (
    <div className="homepage">
      {searchProducts.map((item) => {
        const fullTitle = item[`title_${lang}`] || "";
        const titleParts = fullTitle.split("(");
        const name = titleParts[0].trim();
        const type = titleParts[1] ? `(${titleParts[1]}` : "";

        return (
          <div
            key={item.id}
            className="top-card"
            onClick={() => navigate(`/products/${item.id}`, { state: item })}
          >
            <div className="img-container">
              <img
                src={`/crayfish-farm${item.images[0]}`}
                alt={name}
                className="cardimg"
              />
            </div>

            <div className="card-content">
              <div className="text-section">
                <div className="top-name-wrapper">
                  <h2 className="main-name">{name}</h2>
                  <p className="sub-name-price">
                    {type} - {item.pricePerKg}֏
                  </p>
                </div>
                <p className="top-text">{item[`desc_${lang}`]}</p>
              </div>
              <div className="card-footer">
                <button className="view-more-btn">Տեսնել ավելին</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}