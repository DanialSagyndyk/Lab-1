import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "../features/products/productsSlice.js";
import productDetailsReducer from "../features/productDetails/productDetailsSlice.js";
import categoriesReducer from "../features/categories/categoriesSlice.js";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    productDetails: productDetailsReducer,
    categories: categoriesReducer,
  },
});
