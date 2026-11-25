import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../features/products/productsThunks.js";
import { selectAllProducts, selectProductsStatus, selectProductsError, selectMutationState } from "../features/selectors.js";

// List data: loads on mount (skipped by the thunk `condition` if fresh) and revalidates on window focus.
export function useProducts() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);

  useEffect(() => {
    dispatch(fetchProducts());
    const onFocus = () => dispatch(fetchProducts()); // only runs if data is stale
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dispatch]);

  const retry = useCallback(() => dispatch(fetchProducts({ force: true })), [dispatch]);

  return {
    products,
    status,
    // Show the spinner / error only when there is nothing to display yet (cached data stays visible).
    loading: (status === "idle" || status === "loading") && products.length === 0,
    error: status === "failed" && products.length === 0 ? error : "",
    retry,
  };
}

// CRUD operations (create / update / delete). The list is refreshed automatically after success.
export function useProductMutations() {
  const dispatch = useDispatch();
  const mutation = useSelector(selectMutationState);
  return {
    create: (product) => dispatch(createProduct(product)).unwrap(),
    update: (product) => dispatch(updateProduct(product)).unwrap(),
    remove: (id) => dispatch(deleteProduct(id)).unwrap(),
    isLoading: mutation.status === "loading",
    error: mutation.error,
  };
}
