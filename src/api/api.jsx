const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function request(path) {
  const response = await fetch(buildUrl(path));

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function fetchProducts(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/api/products${query}`);
}

export function fetchProductById(productId) {
  return request(`/api/products/${productId}`);
}
