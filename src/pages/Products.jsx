import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Card from "../components/Card.jsx";
import { Loading, ErrorBox, Empty } from "../components/States.jsx";
import { useProducts } from "../hooks/useProducts.js";
import useCategories from "../hooks/useCategories.js";
import useDebouncedParam from "../hooks/useDebouncedParam.js";
import { selectFilteredProducts } from "../features/selectors.js";

const SIZE = 12;

export default function Products() {
  // The URL is the single source of truth for filters, sorting and page (no duplicated Redux state).
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "all";
  const min = params.get("min") || "";
  const max = params.get("max") || "";
  const sort = params.get("sort") || "name";
  const page = Math.max(1, Number(params.get("page") || 1));

  const { loading, error, retry } = useProducts();
  const categories = useCategories();

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || value === "name" || value === "1") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  // Debounced text inputs
  const [search, setSearch] = useDebouncedParam(q, (v) => update("q", v));
  const [minInput, setMinInput] = useDebouncedParam(min, (v) => update("min", v));
  const [maxInput, setMaxInput] = useDebouncedParam(max, (v) => update("max", v));

  const filters = useMemo(() => ({ q, category, min, max, sort }), [q, category, min, max, sort]);
  const filtered = useSelector((state) => selectFilteredProducts(state, filters));

  const pages = Math.max(1, Math.ceil(filtered.length / SIZE));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice((currentPage - 1) * SIZE, currentPage * SIZE);

  return (
    <section className="page">
      <small>THE CATALOGUE</small>
      <h1>Explore products</h1>
      <p>Search, filter and sort API products. Controls are reflected in the URL.</p>
      <div className="filters">
        <input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => update("category", e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" min="0" placeholder="Min $" value={minInput} onChange={(e) => setMinInput(e.target.value)} />
        <input type="number" min="0" placeholder="Max $" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} />
        <select value={sort} onChange={(e) => update("sort", e.target.value)}>
          <option value="name">Name A–Z</option>
          <option value="low">Price low-high</option>
          <option value="high">Price high-low</option>
          <option value="rating">Top rated</option>
        </select>
        <button onClick={() => { setSearch(""); setMinInput(""); setMaxInput(""); setParams({}); }}>Clear</button>
      </div>

      {loading ? (
        <Loading>Loading catalogue from API…</Loading>
      ) : error ? (
        <ErrorBox message={error} onRetry={retry} />
      ) : shown.length === 0 ? (
        <Empty />
      ) : (
        <>
          <p className="muted">{filtered.length} results · page {currentPage} of {pages}</p>
          <div className="grid">{shown.map((p) => <Card key={p.id} p={p} />)}</div>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => update("page", String(currentPage - 1))}>Previous</button>
            <b>{currentPage} / {pages}</b>
            <button disabled={currentPage === pages} onClick={() => update("page", String(currentPage + 1))}>Next</button>
          </div>
        </>
      )}
    </section>
  );
}
