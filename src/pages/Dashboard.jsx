import { useEffect, useState } from 'react';
import { getDashboardStats, getBestSellers, getProducts } from '../data/store';

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    setStats(getDashboardStats());
    setBestSellers(getBestSellers(5));
    setLowStock(getProducts().filter(p => p.stock <= 5));
  }, []);

  if (!stats) return null;

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Today's business at a glance.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Today's Bills</span>
          <span className="stat-value">{stats.todaysSales}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today's Revenue</span>
          <span className="stat-value">{formatCurrency(stats.todaysRevenue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Bills</span>
          <span className="stat-value">{stats.totalBills}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Products Available</span>
          <span className="stat-value">{stats.totalProducts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock Items</span>
          <span className="stat-value">{stats.lowStockProducts}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3>Best Sellers</h3>
          {bestSellers.length === 0 ? (
            <p className="empty-hint">No sales yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {bestSellers.map(b => (
                  <tr key={b.productId}>
                    <td>{b.name}</td>
                    <td>{b.quantitySold}</td>
                    <td>{formatCurrency(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p className="empty-hint">All products are well stocked.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Product</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="pill pill-red">{p.stock} {p.unit}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
