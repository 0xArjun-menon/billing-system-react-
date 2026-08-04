import { useEffect, useMemo, useState } from 'react';
import { getProducts, getCustomers, createBill } from '../data/store';
import { useToast } from '../components/Toast';
import Receipt from '../components/Receipt';
import { SearchIcon, CloseIcon, PrintIcon } from '../components/Icons';

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card'];

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // { productId, name, price, quantity, stock }
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [lastBill, setLastBill] = useState(null);
  const [error, setError] = useState('');
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

  const addToCart = product => {
    if (!product.available || product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
    });
  };

  const changeQty = (productId, delta) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.productId !== productId) return i;
          const next = i.quantity + delta;
          return { ...i, quantity: next };
        })
        .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = productId => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Number(discount) || 0;
  const taxAmount = Number(tax) || 0;
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  const resetCheckoutForm = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount('');
    setTax('');
    setPaymentMethod('Cash');
  };

  const checkout = () => {
    setError('');
    if (cart.length === 0) {
      setError('Add at least one item to the cart.');
      return;
    }
    try {
      const bill = createBill({
        items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim(),
        discount: discountAmount,
        tax: taxAmount,
        paymentMethod
      });
      setLastBill(bill);
      showToast(`Bill ${bill.billNumber} created`);
      resetCheckoutForm();
      load();
    } catch (err) {
      setError(err.message || 'Failed to create bill');
    }
  };

  return (
    <div>
      <h1>Billing</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>Select products, build the cart, and check out.</p>

      <div className="billing-grid">
        {/* Left: product search + grid */}
        <div>
          <div className="field" style={{ maxWidth: 420 }}>
            <label>Search Products</label>
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

          <div className="product-grid">
            {filtered.map(p => {
              const disabled = !p.available || p.stock <= 0;
              return (
                <div
                  key={p.id}
                  className={'product-tile' + (disabled ? ' disabled' : '')}
                  onClick={() => addToCart(p)}
                >
                  <div className="product-tile-name">{p.name}</div>
                  <div className="product-tile-meta">{p.category} · {p.stock} {p.unit} left</div>
                  <div className="product-tile-price">{formatCurrency(p.price)}</div>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="empty-hint">No products found.</p>}
          </div>
        </div>

        {/* Right: cart + checkout */}
        <div className="card">
          <h3>Cart</h3>
          {cart.length === 0 ? (
            <p className="empty-hint">No items yet. Tap a product to add it.</p>
          ) : (
            <div>
              {cart.map(item => (
                <div className="cart-item" key={item.productId}>
                  <span className="cart-item-name">{item.name}</span>
                  <div className="qty-control">
                    <button onClick={() => changeQty(item.productId, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.productId, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ width: 70, textAlign: 'right', fontSize: 14 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <button className="btn-icon danger" onClick={() => removeFromCart(item.productId)} title="Remove">
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="field">
              <label>Customer Name</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in Customer" />
            </div>
            <div className="field">
              <label>Phone (optional)</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="10-digit phone" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Discount (₹)</label>
                <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Tax (₹)</label>
                <input type="number" min="0" value={tax} onChange={e => setTax(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Payment Method</label>
              <div className="payment-options">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={'payment-btn' + (paymentMethod === m ? ' selected' : '')}
                    onClick={() => setPaymentMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="summary-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {discountAmount > 0 && <div className="summary-row"><span>Discount</span><span>-{formatCurrency(discountAmount)}</span></div>}
          {taxAmount > 0 && <div className="summary-row"><span>Tax</span><span>{formatCurrency(taxAmount)}</span></div>}
          <div className="summary-row total"><span>Total</span><span>{formatCurrency(total)}</span></div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={checkout}>
            Complete Sale — {formatCurrency(total)}
          </button>
        </div>
      </div>

      {lastBill && (
        <div className="overlay" onClick={() => setLastBill(null)}>
          <div className="modal modal-relative" onClick={e => e.stopPropagation()}>
            <button className="btn-icon modal-close no-print" onClick={() => setLastBill(null)}>
              <CloseIcon />
            </button>
            <Receipt bill={lastBill} />
            <div className="modal-actions no-print">
              <button className="btn btn-outline" onClick={() => setLastBill(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <PrintIcon /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
