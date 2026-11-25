import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../features/categories/categoriesSlice.js";
import { selectCategoryOptions } from "../features/selectors.js";

export default function useCategories() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategoryOptions);
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  return categories;
}
