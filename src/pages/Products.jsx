import { useEffect, useMemo, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../data/store';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../components/Icons';

const emptyForm = { name: '', category: '', price: '', stock: '', unit: 'pc', available: true };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const showToast = useToast();

  const load = () => setProducts(getProducts());
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = product => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      available: product.available
    });
    setFormOpen(true);
  };

  const submitForm = e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0
    };
    if (editingId) {
      updateProduct(editingId, payload);
      showToast('Product updated');
    } else {
      createProduct(payload);
      showToast('Product added');
    }
    setFormOpen(false);
    load();
  };

  const confirmDelete = () => {
    if (!confirmTarget) return;
    deleteProduct(confirmTarget.id);
    showToast(`"${confirmTarget.name}" deleted`);
    setConfirmTarget(null);
    load();
  };

  return (
    <div>
      <h1>Products</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Manage your Sadhya, curries, and sides.</p>

      <div className="filters-row">
        <div className="field" style={{ minWidth: 260 }}>
          <label>Search</label>
          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or category"
              style={{ width: '100%', paddingLeft: 34 }}
            />
            <span style={{ position: 'absolute', left: 10, top: 10, width: 16, color: 'var(--ink-soft)' }}>
              <SearchIcon />
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusIcon /> Add Product
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price.toFixed(2)} / {p.unit}</td>
                <td>{p.stock}</td>
                <td>
                  {p.available ? (
                    <span className="pill pill-green">Available</span>
                  ) : (
                    <span className="pill pill-red">Unavailable</span>
                  )}
                </td>
                <td>
                  <button className="btn-icon" onClick={() => openEdit(p)} title="Edit">
                    <EditIcon />
                  </button>
                  <button className="btn-icon danger" onClick={() => setConfirmTarget(p)} title="Delete">
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="empty-hint">No products found.</p>}
      </div>

      {formOpen && (
        <div className="overlay" onClick={() => setFormOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Category</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Price (₹)</label>
                  <input type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Stock</label>
                  <input type="number" min="0" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Unit</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={e => setForm({ ...form, available: e.target.checked })}
                />
                Available for sale
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Product"
        message={confirmTarget ? `Delete "${confirmTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="warn"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
