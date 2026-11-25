import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useProducts } from "../hooks/useProducts.js";
import { Loading, ErrorBox } from "../components/States.jsx";
import { selectDashboardStats, selectProductCategories } from "../features/selectors.js";

export default function Dashboard() {
  const { loading, error, retry } = useProducts();
  const [cat, setCat] = useState("all"); // temporary UI state stays local
  const categories = useSelector(selectProductCategories);
  const stats = useSelector((state) => selectDashboardStats(state, cat));

  if (loading) return <section className="page"><Loading>Calculating dashboard…</Loading></section>;
  if (error) return <section className="page"><ErrorBox message={error} onRetry={retry} /></section>;

  return (
    <section className="page">
      <small>OVERVIEW</small>
      <h1>Catalogue dashboard</h1>
      <p>Statistics calculated from cached API data.</p>
      <label>Filter by category{" "}
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <div className="stats">
        <article><small>Products</small><h2>{stats.count}</h2></article>
        <article><small>Average price</small><h2>${stats.avgPrice.toFixed(2)}</h2></article>
        <article><small>Average rating</small><h2>{stats.avgRating.toFixed(2)} / 5</h2></article>
        <article><small>Total stock</small><h2>{stats.totalStock}</h2></article>
      </div>
      <div className="stats">
        <article>
          <h2>Products by category</h2>
          {stats.byCategory.slice(0, 10).map((x) => <p key={x.name}>{x.name} <b>{x.count}</b></p>)}
        </article>
        <article>
          <h2>Rating breakdown</h2>
          {stats.ratings.map(([n, v]) => <p key={n}>{n} <b>{v}</b></p>)}
          <Link to="/products">Browse products →</Link>
        </article>
      </div>
    </section>
  );
}
