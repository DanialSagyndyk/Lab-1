import { Link, useParams } from "react-router-dom";
import useProduct from "../hooks/useProduct.js";
import { Loading, ErrorBox } from "../components/States.jsx";

export default function Details() {
  const { id } = useParams();
  const { data: p, isLoading, error, retry } = useProduct(id);

  if (isLoading) return <section className="page"><Loading>Loading product details…</Loading></section>;
  if (error || !p) {
    return (
      <section className="page">
        <ErrorBox message={error || "Product not found"} onRetry={retry} />
        <Link to="/products">All products</Link>
      </section>
    );
  }

  const rows = [
    ["Brand", p.brand], ["Category", p.category], ["SKU", p.sku], ["Stock", p.stock],
    ["Availability", p.availabilityStatus], ["Weight", `${p.weight} g`], ["Warranty", p.warrantyInformation],
    ["Shipping", p.shippingInformation], ["Return policy", p.returnPolicy], ["Minimum order", p.minimumOrderQuantity],
  ];

  return (
    <section className="page">
      <Link to="/products">← All products</Link>
      <div className="detail">
        <img src={p.images?.[0] || p.thumbnail} alt={p.title} />
        <div>
          <small>{p.category} · {p.brand}</small>
          <h1>{p.title}</h1>
          <h2>${p.price} <small>★ {p.rating}</small></h2>
          <p>{p.description}</p>
          <dl>
            {rows.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v || "Not specified"}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
