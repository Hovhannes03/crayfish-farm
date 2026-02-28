export function formatPrice(num) {
  return new Intl.NumberFormat("de-DE").format(num);
}