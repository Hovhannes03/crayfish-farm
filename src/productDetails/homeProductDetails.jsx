import "./homeProductDetails.css";
import { useEffect, useState, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import { formatPrice } from "../utils/numberFormat";
import { CountryContext } from "../App";

export default function HomeProductDetails() {
  const { state: product } = useLocation();
  const { lang } = useContext(CountryContext);
  
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [weight, setWeight] = useState(product?.minWeight || 0);
  const [qty, setQty] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const length = product?.images?.length || 0;
  const intervalRef = useRef(null);

  // Գնի ավտոմատ հաշվարկ
  useEffect(() => {
    if (product) {
      const pricePerGram = product.pricePerKg / 1000;
      const result = pricePerGram * weight * qty;
      setTotalPrice(result);
    }
  }, [weight, qty, product]);

  // Սլայդշոուի տրամաբանություն
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
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  if (!product) return <div className="no-data">Ապրանքը չի գտնվել</div>;

  return (
    <div className="product-page">
      <div className="main-layout">
        
        <div className="visual-section">
          <div 
            className="slideshow-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <button className="slide-nav prev" onClick={prevSlide}>❮</button>
            <button className="slide-nav next" onClick={nextSlide}>❯</button>
            
            <div className="main-image-wrapper" onClick={() => setModalOpen(true)}>
              <img 
                src={`/crayfish-farm${product.images[current]}`} 
                alt={product[`title_${lang}`]} 
              />
              <div className="zoom-hint">Սեղմեք մեծացնելու համար</div>
            </div>
          </div>
        </div>

        <div className="action-section">
          <div className="product-info-header">
            <h1>{product[`title_${lang}`]}</h1>
            <div className="tag-row">
              <span className="weight-tag">{product.minWeight}-{product.maxWeight} գր.</span>
              <span className="price-tag">1կգ / {formatPrice(product.pricePerKg)} ֏</span>
            </div>
          </div>

          <div className="calculator-box">
            <h3>Գնի հաշվիչ</h3>
            <div className="input-field">
              <label>Քաշը (գրամ)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>

            <div className="input-field">
              <label>Քանակ (հատ)</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                min={1}
              />
            </div>

            <div className="total-row">
              <span>Ընդհանուր գումար:</span>
              <span className="final-amount">{formatPrice(totalPrice)} ֏</span>
            </div>

            <button className="add-to-cart-btn">Ավելացնել զամբյուղ</button>
          </div>
        </div>
      </div>

      <div className="description-card">
        <h3>Մանրամասն նկարագրություն</h3>
        <p>{product[`desc_${lang}`] || product.more_details}</p>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <button className="modal-btn m-prev" onClick={prevSlide}>❮</button>
          <img className="modal-content" src={`/crayfish-farm${product.images[current]}`} alt="Zoomed" />
          <button className="modal-btn m-next" onClick={nextSlide}>❯</button>
          <div className="modal-close">✕</div>
        </div>
      )}
    </div>
  );
}