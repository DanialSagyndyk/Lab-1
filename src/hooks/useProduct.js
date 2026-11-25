import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../features/productDetails/productDetailsSlice.js";
import { selectProductDetailEntry } from "../features/selectors.js";

export default function useProduct(id) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => selectProductDetailEntry(state, id));

  useEffect(() => {
    if (id) dispatch(fetchProductById({ id }));
  }, [dispatch, id]);

  const retry = useCallback(() => dispatch(fetchProductById({ id, force: true })), [dispatch, id]);

  const data = entry?.data ?? null;
  return {
    data,
    isLoading: !data && (!entry || entry.status === "loading"),
    error: !data && entry?.status === "failed" ? entry.error : "",
    retry,
  };
}
