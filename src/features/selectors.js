import { createSelector } from "@reduxjs/toolkit";

// ---- plain (reusable) selectors ----
export const selectAllProducts = (state) => state.products.items;
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;
export const selectProductDetailEntry = (state, id) => state.productDetails.byId[String(id)];
export const selectMutationState = (state) => state.products.mutation;
const selectRawCategories = (state) => state.categories.items;
export const selectCategoriesStatus = (state) => state.categories.status;

// ---- memoized selectors (createSelector) ----

// Category slugs for the filter dropdown (API returns strings or {slug,name} objects).
export const selectCategoryOptions = createSelector([selectRawCategories], (categories) =>
  categories.map((c) => (typeof c === "string" ? c : c.slug))
);

// Sorted unique categories found in the loaded products (dashboard filter).
export const selectProductCategories = createSelector([selectAllProducts], (products) =>
  [...new Set(products.map((p) => p.category))].sort()
);

// Search + category + price range + sorting. `filters` must be a stable object (useMemo in the page).
export const selectFilteredProducts = createSelector(
  [selectAllProducts, (_state, filters) => filters],
  (products, { q, category, min, max, sort }) => {
    const query = q.toLowerCase();
    const result = products.filter(
      (p) =>
        `${p.title} ${p.description} ${p.brand || ""}`.toLowerCase().includes(query) &&
        (category === "all" || p.category === category) &&
        (min === "" || p.price >= Number(min)) &&
        (max === "" || p.price <= Number(max))
    );
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sort === "name") result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }
);

// Dashboard statistics for one category (or "all").
export const selectDashboardStats = createSelector(
  [selectAllProducts, (_state, category) => category],
  (products, category) => {
    const list = category === "all" ? products : products.filter((p) => p.category === category);
    const avg = (key) => (list.length ? list.reduce((sum, p) => sum + (p[key] || 0), 0) / list.length : 0);
    const counts = new Map();
    products.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return {
      count: list.length,
      avgPrice: avg("price"),
      avgRating: avg("rating"),
      totalStock: list.reduce((sum, p) => sum + (p.stock || 0), 0),
      byCategory: [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      ratings: [
        ["4.5+", list.filter((p) => p.rating >= 4.5).length],
        ["4.0–4.49", list.filter((p) => p.rating >= 4 && p.rating < 4.5).length],
        ["Below 4.0", list.filter((p) => p.rating < 4).length],
      ],
    };
  }
);
