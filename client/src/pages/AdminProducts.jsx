import { useEffect, useState } from 'react';
import { api, formatPrice } from '../api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';

const blank = { name: '', description: '', price: '', image: '', category: '', stock: 20 };

export default function AdminProducts() {
  const { notify } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get('/products?limit=50')
      .then((d) => setProducts(d.products))
      .catch((err) => notify(err.message, 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // reads the chosen file, shrinks it on a canvas and keeps it as a base64 string
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG or PNG images are allowed');
      e.target.value = '';
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 500;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setForm((f) => ({ ...f, image: canvas.toDataURL('image/jpeg', 0.7) }));
      };
      img.onerror = () => setError('Could not read that image');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(blank);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.image) return setError('Please choose a product image');
    setBusy(true);
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, body);
        notify('Product updated');
      } else {
        await api.post('/products', body);
        notify('Product added');
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.del(`/products/${p._id}`);
      notify('Product deleted');
      load();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <h1>Manage products</h1>

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit product' : 'Add a new product'}</h3>
        {error && <div className="alert">{error}</div>}
        <div className="row">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Category
            <input name="category" value={form.category} onChange={handleChange} required />
          </label>
        </div>
        <label>
          Description
          <textarea name="description" rows="3" value={form.description} onChange={handleChange} required />
        </label>
        <div className="row">
          <label>
            Price (₹)
            <input type="number" min="0" name="price" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            Stock
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
          </label>
        </div>
        <label>
          Product image (JPG or PNG)
          <input type="file" accept="image/jpeg,image/png" onChange={handleFile} />
        </label>
        {form.image && <img className="upload-preview" src={form.image} alt="Preview" />}
        <div className="row-actions">
          <button className="btn" disabled={busy}>{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td><img className="thumb" src={p.image} alt={p.name} /></td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock}</td>
                  <td className="actions">
                    <button className="btn btn-small btn-outline" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
