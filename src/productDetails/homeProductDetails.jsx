import "./homeProductDetails.css";
import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../api/api";
import { formatPrice } from "../utils/numberFormat";
import { CountryContext } from "../App";
import { getAssetUrl } from "../utils/assetPath";

const productText = {
  am: {
    loading: "Բեռնվում է ապրանքը...",
    notFound: "Ապրանքը չի գտնվել։",
    zoomHint: "Սեղմեք մեծացնելու համար",
    calculator: "Գնի հաշվիչ",
    weight: "Քաշ (գրամ)",
    quantity: "Քանակ (հատ)",
    total: "Ընդհանուր արժեքը",
    addToCart: "Ավելացնել զամբյուղ",
    description: "Ապրանքի նկարագրություն",
  },
  ru: {
    loading: "Загрузка товара...",
    notFound: "Товар не найден.",
    zoomHint: "Нажмите для увеличения",
    calculator: "Калькулятор цены",
    weight: "Вес (грамм)",
    quantity: "Количество (шт.)",
    total: "Итоговая стоимость",
    addToCart: "Добавить в корзину",
    description: "Описание товара",
  },
  en: {
    loading: "Loading product...",
    notFound: "Product not found.",
    zoomHint: "Click to zoom",
    calculator: "Price calculator",
    weight: "Weight (grams)",
    quantity: "Quantity (pcs)",
    total: "Total price",
    addToCart: "Add to cart",
    description: "Product description",
  },
};

export default function HomeProductDetails() {
  const { id } = useParams();
  const { lang } = useContext(CountryContext);
  const text = productText[lang] || productText.en;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [weight, setWeight] = useState(0);
  const [qty, setQty] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const length = product?.images?.length || 0;
  const intervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProductById(id);
        if (isMounted) {
          setProduct(data);
          setWeight(data.minWeight);
          setCurrent(0);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Failed to load product.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (product) {
      const pricePerGram = product.pricePerKg / 1000;
      const result = pricePerGram * weight * qty;
      setTotalPrice(result);
    }
  }, [weight, qty, product]);

  useEffect(() => {
    if (!isPaused && length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
      }, 3000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused, length]);

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
  };

  if (loading) return <div className="no-data">{text.loading}</div>;
  if (error) return <div className="no-data">{error}</div>;
  if (!product) return <div className="no-data">{text.notFound}</div>;

  return (
    <div className="product-page">
      <div className="main-layout">
        <div className="visual-section">
          <div
            className="slideshow-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <button className="slide-nav prev" onClick={prevSlide}>{"<"}</button>
            <button className="slide-nav next" onClick={nextSlide}>{">"}</button>

            <div className="main-image-wrapper" onClick={() => setModalOpen(true)}>
              <img
                src={getAssetUrl(product.images[current])}
                alt={product[`title_${lang}`]}
              />
              <div className="zoom-hint">{text.zoomHint}</div>
            </div>
          </div>
        </div>

        <div className="action-section">
          <div className="product-info-header">
            <h1>{product[`title_${lang}`]}</h1>
            <div className="tag-row">
              <span className="weight-tag">{product.minWeight}-{product.maxWeight} g</span>
              <span className="price-tag">1 kg / {formatPrice(product.pricePerKg)} AMD</span>
            </div>
          </div>

          <div className="calculator-box">
            <h3>{text.calculator}</h3>
            <div className="input-field">
              <label>{text.weight}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>

            <div className="input-field">
              <label>{text.quantity}</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                min={1}
              />
            </div>

            <div className="total-row">
              <span>{text.total}:</span>
              <span className="final-amount">{formatPrice(totalPrice)} AMD</span>
            </div>

            <button className="add-to-cart-btn">{text.addToCart}</button>
          </div>
        </div>
      </div>

      <div className="description-card">
        <h3>{text.description}</h3>
        <p>{product[`desc_${lang}`] || product.more_details}</p>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <button className="modal-btn m-prev" onClick={prevSlide}>{"<"}</button>
          <img className="modal-content" src={getAssetUrl(product.images[current])} alt="Zoomed" />
          <button className="modal-btn m-next" onClick={nextSlide}>{">"}</button>
          <div className="modal-close">x</div>
        </div>
      )}
    </div>
  );
}
