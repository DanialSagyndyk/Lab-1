const BASE = "https://dummyjson.com";
const RETRY_DELAY_MS = 500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readError(response) {
  if (response.status === 404) return "Product not found.";
  try {
    const body = await response.json();
    if (body?.message) return body.message; // e.g. message from the Service Worker when offline
  } catch {
    /* body is not JSON */
  }
  return `API error: ${response.status}`;
}

// GET requests are retried once on network failures / 5xx while the browser is online.
async function request(url, { signal, method = "GET", body } = {}, attempt = 0) {
  try {
    const response = await fetch(url, {
      signal,
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const error = new Error(await readError(response));
      error.status = response.status;
      throw error;
    }
    return response.json();
  } catch (error) {
    const canRetry =
      method === "GET" &&
      attempt < 1 &&
      !signal?.aborted &&
      error.name !== "AbortError" &&
      navigator.onLine &&
      (error.status === undefined || error.status >= 500);
    if (!canRetry) throw error;
    await wait(RETRY_DELAY_MS);
    return request(url, { signal, method, body }, attempt + 1);
  }
}

export function getProducts({ signal } = {}) { return request(`${BASE}/products?limit=194`, { signal }); }
export function getCategories({ signal } = {}) { return request(`${BASE}/products/categories`, { signal }); }
export function getProduct(id, { signal } = {}) { return request(`${BASE}/products/${encodeURIComponent(id)}`, { signal }); }
// DummyJSON simulates writes; changes are not persisted on its server.
export function createProduct(product) { return request(`${BASE}/products/add`, { method: "POST", body: product }); }
export function updateProduct({ id, ...changes }) { return request(`${BASE}/products/${id}`, { method: "PUT", body: changes }); }
export function deleteProduct(id) { return request(`${BASE}/products/${id}`, { method: "DELETE" }); }
