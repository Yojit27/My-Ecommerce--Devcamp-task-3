import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';

const emptyFilters = { q: '', category: 'All', minPrice: '', maxPrice: '', sort: 'newest' };

export default function Home() {
  const [filters, setFilters] = useState(emptyFilters);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products/categories').then(setCategories).catch(() => {});
  }, []);

  // wait a moment after typing before hitting the API
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.q === search ? f : { ...f, q: search }));
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 8, sort: filters.sort });
    if (filters.q) params.set('q', filters.q);
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

    setLoading(true);
    setError('');
    api
      .get(`/products?${params}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const update = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const reset = () => {
    setSearch('');
    setFilters(emptyFilters);
    setPage(1);
  };

  return (
    <>
      <section className="hero">
        <h1>Everything you need, delivered to your door</h1>
        <p>Browse electronics, clothing, books, home and sports essentials at honest prices.</p>
        <input
          type="search"
          className="hero-search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="chips">
        {['All', ...categories].map((c) => (
          <button
            key={c}
            className={`chip ${filters.category === c ? 'active' : ''}`}
            onClick={() => update('category', c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <label>
          Min price
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          Max price
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            placeholder="Any"
          />
        </label>
        <label>
          Sort by
          <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
        <button className="btn btn-outline btn-small" onClick={reset}>Clear</button>
      </div>

      {loading ? (
        <Loader text="Loading products..." />
      ) : error ? (
        <div className="empty">
          <h3>Couldn't load products</h3>
          <p>{error}</p>
        </div>
      ) : data.products.length === 0 ? (
        <div className="empty">
          <h3>No products found</h3>
          <p>Try a different search or clear the filters.</p>
          <button className="btn" onClick={reset}>Clear filters</button>
        </div>
      ) : (
        <>
          <p className="muted result-count">{data.total} product{data.total === 1 ? '' : 's'}</p>
          <div className="grid">
            {data.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </>
  );
}
