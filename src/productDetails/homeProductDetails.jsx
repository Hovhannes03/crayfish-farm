import "./homeProductDetails.css";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { formatPrice } from "../utils/numberFormat";

export default function HomeProductDetails() {
  const { state } = useLocation();
  const product = state;
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(true); 

  const [weight, setWeight] = useState(product.minWeight);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(product.pricePerKg/weight);
  const length = product.images.length;

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused, length]);

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  if (!product) return <p>No product data</p>;

  return (
    <div className="product-details">
      <div className="slideshow-calculator">
        <div
          className="slideshow"
          onMouseEnter={() => setIsPaused(true)}   // <-- pause on hover
          onMouseLeave={() => setIsPaused(false)} // <-- resume on leave
        >
          <button className="prev" onClick={prevSlide}>❮</button>
          <button className="next" onClick={nextSlide}>❯</button>

          {product.images.map((slide, index) => (
            <div
              className={index === current ? "slide active" : "slide"}
              key={index}
              onClick={() => setModalOpen(true)} // open modal on click
            >
              {index === current && <img src={`/crayfish-farm${slide}`} alt={`Slide ${index}`} />}
            </div>
          ))}
        </div>

        <div className="calculatur">
          <div className="form-grid">
            {/* Weight */}
            <div className="field">
              <label htmlFor="weight">Weight (gram)</label>
              <input
                id="weight"
                type="number"
                placeholder="Enter grams"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {/* Quantity */}
            <div className="field">
              <label htmlFor="qty">Quantity (pcs)</label>
              <input
                id="qty"
                type="number"
                placeholder="Enter quantity"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                min={1}
              />
            </div>
            {/* Price */}
            <div className="field">
              <label htmlFor="qty">Price (AMD)</label>
              <input
                id="qty"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={1}
              />
            </div>
            <button 
              // onClick={}
            >
              Հաշվել
            </button>
        </div>
        </div>

        <div className="info">
          <h2>{product.title}</h2>
          <span>Start to {product.minWeight} - {product.maxWeight} gr</span>
          <span>For sales min. 1kg = {formatPrice(product.pricePerKg)}AMD</span>
          <p>{product.more_details}</p>
        </div>
      </div>

      

      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <button className="modal-prev" onClick={(e)=>{e.stopPropagation(); prevSlide()}}>❮</button>
          <img className="modal-img" src={`/crayfish-farm${product.images[current]}`} alt={`Slide ${current}`} />
          <button className="modal-next" onClick={(e)=>{e.stopPropagation(); nextSlide()}}>❯</button>
        </div>
      )}
    </div>
  );
}
