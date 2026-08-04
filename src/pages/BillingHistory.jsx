import { useEffect, useState } from 'react';
import { getBills, getBillById, deleteBill } from '../data/store';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Receipt from '../components/Receipt';
import { ReceiptIcon, DeleteIcon, CloseIcon, PrintIcon } from '../components/Icons';

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

export default function BillingHistory() {
  const [bills, setBills] = useState([]);
  const [billNumberFilter, setBillNumberFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const showToast = useToast();

  const load = () => {
    setBills(
      getBills({
        billNumber: billNumberFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined
      })
    );
  };

  useEffect(load, []);

  const clearFilters = () => {
    setBillNumberFilter('');
    setFromDate('');
    setToDate('');
    setTimeout(load, 0);
  };

  const viewReceipt = bill => {
    setSelectedBill(getBillById(bill.id));
  };

  const confirmDelete = () => {
    if (!confirmTarget) return;
    deleteBill(confirmTarget.id);
    showToast(`Bill ${confirmTarget.billNumber} deleted`);
    setConfirmTarget(null);
    load();
  };

  return (
    <div>
      <h1>Billing History</h1>

      <div className="filters-row">
        <div className="field">
          <label>Bill Number</label>
          <input value={billNumberFilter} onChange={e => setBillNumberFilter(e.target.value)} placeholder="e.g. ONM-1001" />
        </div>
        <div className="field">
          <label>From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={load}>Apply</button>
        <button className="btn btn-outline" onClick={clearFilters}>Clear</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b.id}>
                <td>{b.billNumber}</td>
                <td>{new Date(b.createdAt).toLocaleString()}</td>
                <td>{b.customerName}</td>
                <td>{b.paymentMethod}</td>
                <td>{formatCurrency(b.total)}</td>
                <td>
                  <button className="btn-icon" onClick={() => viewReceipt(b)} title="View / Reprint">
                    <ReceiptIcon />
                  </button>
                  <button className="btn-icon danger" onClick={() => setConfirmTarget(b)} title="Delete bill">
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && <p className="empty-hint">No bills found for the selected filters.</p>}
      </div>

      {selectedBill && (
        <div className="overlay" onClick={() => setSelectedBill(null)}>
          <div className="modal modal-relative" onClick={e => e.stopPropagation()}>
            <button className="btn-icon modal-close no-print" onClick={() => setSelectedBill(null)}>
              <CloseIcon />
            </button>
            <Receipt bill={selectedBill} />
            <div className="modal-actions no-print">
              <button className="btn btn-outline" onClick={() => setSelectedBill(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <PrintIcon /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete Bill"
        message={confirmTarget ? `Delete bill ${confirmTarget.billNumber}? This cannot be undone and will restore stock for its items.` : ''}
        confirmLabel="Delete"
        tone="warn"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
