import { useEffect, useState } from 'react';
import { getSalesReport, getBestSellers } from '../data/store';

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

const RANGES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' }
];

export default function Reports() {
  const [range, setRange] = useState('daily');
  const [report, setReport] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    setReport(getSalesReport(range));
    setBestSellers(getBestSellers(10));
  }, [range]);

  if (!report) return null;

  const maxTotal = Math.max(1, ...report.series.map(s => s.total));

  return (
    <div>
      <h1>Reports</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>Revenue analysis and best-selling products.</p>

      <div className="filters-row">
        {RANGES.map(r => (
          <button
            key={r.key}
            className={'btn ' + (range === r.key ? 'btn-primary' : 'btn-outline')}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Revenue ({report.range})</span>
          <span className="stat-value">{formatCurrency(report.revenue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{report.totalOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Order Value</span>
          <span className="stat-value">{formatCurrency(report.avgOrderValue)}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Revenue by Day</h3>
        {report.series.length === 0 ? (
          <p className="empty-hint">No sales in this period.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, marginTop: 16 }}>
            {report.series.map(s => (
              <div key={s.date} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    background: 'var(--gold)',
                    borderRadius: '6px 6px 0 0',
                    height: `${(s.total / maxTotal) * 120}px`,
                    minHeight: 4
                  }}
                  title={formatCurrency(s.total)}
                />
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>
                  {s.date.slice(5)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
