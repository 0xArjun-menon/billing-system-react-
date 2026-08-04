function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

export default function Receipt({ bill }) {
  if (!bill) return null;
  const date = new Date(bill.createdAt);

  return (
    <div className="receipt">
      <h2>🌼 Onam Sadhya &amp; Curry</h2>
      <p className="center">Traditional Kerala Catering</p>
      <hr />
      <table>
        <tbody>
          <tr><td>Bill No</td><td style={{ textAlign: 'right' }}>{bill.billNumber}</td></tr>
          <tr><td>Date</td><td style={{ textAlign: 'right' }}>{date.toLocaleString()}</td></tr>
          <tr><td>Customer</td><td style={{ textAlign: 'right' }}>{bill.customerName}</td></tr>
          {bill.customerPhone && (
            <tr><td>Phone</td><td style={{ textAlign: 'right' }}>{bill.customerPhone}</td></tr>
          )}
        </tbody>
      </table>
      <hr />
      <table>
        <thead>
          <tr>
            <td><strong>Item</strong></td>
            <td style={{ textAlign: 'center' }}><strong>Qty</strong></td>
            <td style={{ textAlign: 'right' }}><strong>Amt</strong></td>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <table>
        <tbody>
          <tr><td>Subtotal</td><td style={{ textAlign: 'right' }}>{formatCurrency(bill.subtotal)}</td></tr>
          {bill.discount > 0 && (
            <tr><td>Discount</td><td style={{ textAlign: 'right' }}>-{formatCurrency(bill.discount)}</td></tr>
          )}
          {bill.tax > 0 && (
            <tr><td>Tax</td><td style={{ textAlign: 'right' }}>{formatCurrency(bill.tax)}</td></tr>
          )}
          <tr>
            <td><strong>Total</strong></td>
            <td style={{ textAlign: 'right' }}><strong>{formatCurrency(bill.total)}</strong></td>
          </tr>
          <tr><td>Payment</td><td style={{ textAlign: 'right' }}>{bill.paymentMethod}</td></tr>
        </tbody>
      </table>
      <hr />
      <p className="center">Thank you! Happy Onam 🌼</p>
    </div>
  );
}
