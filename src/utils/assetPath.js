export function getAssetUrl(path = "") {
  if (!path) {
    return "";
  }

  const baseUrl = import.meta.env.BASE_URL || "/";
  return `${baseUrl}${path.replace(/^\/+/, "")}`;
}
