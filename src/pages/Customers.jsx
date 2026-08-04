import { useEffect, useMemo, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerHistory } from '../data/store';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, HistoryIcon } from '../components/Icons';

const emptyForm = { name: '', phone: '' };

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const showToast = useToast();

  const load = () => setCustomers(getCustomers());
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = customer => {
    setEditingId(customer.id);
    setForm({ name: customer.name, phone: customer.phone });
    setFormOpen(true);
  };

  const submitForm = e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateCustomer(editingId, form);
      showToast('Customer updated');
    } else {
      createCustomer(form);
      showToast('Customer added');
    }
    setFormOpen(false);
    load();
  };

  const confirmDelete = () => {
    if (!confirmTarget) return;
    deleteCustomer(confirmTarget.id);
    showToast(`"${confirmTarget.name}" removed`);
    setConfirmTarget(null);
    load();
  };

  const history = historyFor ? getCustomerHistory(historyFor.id) : [];

  return (
    <div>
      <h1>Customers</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Track repeat customers and their orders.</p>

      <div className="filters-row">
        <div className="field" style={{ minWidth: 260 }}>
          <label>Search</label>
          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone"
              style={{ width: '100%', paddingLeft: 34 }}
            />
            <span style={{ position: 'absolute', left: 10, top: 10, width: 16, color: 'var(--ink-soft)' }}>
              <SearchIcon />
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusIcon /> Add Customer
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>
                  <button className="btn-icon" onClick={() => setHistoryFor(c)} title="Purchase history">
                    <HistoryIcon />
                  </button>
                  <button className="btn-icon" onClick={() => openEdit(c)} title="Edit">
                    <EditIcon />
                  </button>
                  <button className="btn-icon danger" onClick={() => setConfirmTarget(c)} title="Delete">
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="empty-hint">No customers found.</p>}
      </div>

      {formOpen && (
        <div className="overlay" onClick={() => setFormOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyFor && (
        <div className="overlay" onClick={() => setHistoryFor(null)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Purchase History — {historyFor.name}</h3>
            {history.length === 0 ? (
              <p className="empty-hint">No purchases yet.</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Bill No.</th><th>Date</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {history.map(b => (
                    <tr key={b.id}>
                      <td>{b.billNumber}</td>
                      <td>{new Date(b.createdAt).toLocaleString()}</td>
                      <td>{formatCurrency(b.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setHistoryFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Customer"
        message={confirmTarget ? `Remove "${confirmTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="warn"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
