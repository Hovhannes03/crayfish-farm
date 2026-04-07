import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/api";
import { CountryContext } from "../App";
import { translations } from "../locales";
import { getAssetUrl } from "../utils/assetPath";
import "./homepage.css";

export default function Home({ search }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { lang } = useContext(CountryContext);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Failed to load products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchProducts = useMemo(() => {
    return products.filter((prod) => {
      const title = prod[`title_${lang}`] || "";
      return title.toLowerCase().includes((search || "").toLowerCase());
    });
  }, [lang, products, search]);

  if (loading) {
    return <div className="homepage">Loading products...</div>;
  }

  if (error) {
    return <div className="homepage">{error}</div>;
  }

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
            onClick={() => navigate(`/products/${item.id}`)}
          >
            <div className="img-container">
              <img
                src={getAssetUrl(item.images[0])}
                alt={name}
                className="cardimg"
              />
            </div>

            <div className="card-content">
              <div className="text-section">
                <div className="top-name-wrapper">
                  <h2 className="main-name">{name}</h2>
                  <p className="sub-name-price">
                    {type} - {item.pricePerKg} AMD
                  </p>
                </div>
                <p className="top-text">{item[`desc_${lang}`]}</p>
              </div>
              <div className="card-footer">
                <button className="view-more-btn">{t.moreInfo}</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
