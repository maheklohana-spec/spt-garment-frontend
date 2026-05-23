import { useState, useEffect } from 'react';
import axios from 'axios';

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' Only';
}

export default function Invoice() {
  const [bill, setBill] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    axios.get(`https://spt-garment.onrender.com/api/bills/${id}`)
      .then(res => { setBill(res.data); setLoading(false); })
      .catch(() => { setError('Bill not found'); setLoading(false); });
    axios.get('https://spt-garment.onrender.com/api/settings')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Loading invoice...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.href='/bills'} className="bg-blue-900 text-white px-4 py-2 rounded">Go Back</button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Toolbar - hidden on print */}
      <div className="bg-blue-900 text-white px-6 py-3 flex gap-3 items-center no-print">
        <button onClick={() => window.location.href='/bills'} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm">← Back</button>
        <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-sm font-bold">🖨 Print</button>
        <span className="text-sm opacity-70">Invoice: {bill.bill_no}</span>
      </div>

      {/* Invoice - tight compact layout matching physical bill */}
      <div className="mx-auto bg-white" style={{ maxWidth: '680px', padding: '12px', marginTop: '8px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '4px' }}>
          <div style={{ fontSize: '10px', marginBottom: '1px' }}>ON APPROVAL</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {bill.series || settings.company_name || 'SP'}
          </div>
          {settings.address && <div style={{ fontSize: '9px', color: '#555' }}>{settings.address}{settings.city ? ', ' + settings.city : ''}</div>}
        </div>

        {/* Party + Bill Info row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
          <div>
            <div>To,</div>
            <div style={{ fontWeight: 'bold' }}>{bill.party_name || 'CASH A/C'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Bill No. :</strong> {bill.bill_no}</div>
            <div><strong>Date :</strong> {bill.vch_date}</div>
            <div style={{ marginTop: '4px' }}><strong>Parcel :</strong> {bill.parcels || ''}</div>
          </div>
        </div>

        {/* BILL NO label */}
        <div style={{ fontSize: '10px', marginBottom: '2px' }}>BILL NO.</div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#fff' }}>
              <th style={th}>Sr</th>
              <th style={th}>Design. No</th>
              <th style={th}>Description</th>
              <th style={th}>Size</th>
              <th style={th}>Qty</th>
              <th style={th}>Rate</th>
              <th style={th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items && bill.items.map((item, i) => (
              <tr key={i}>
                <td style={td}>{i + 1}</td>
                <td style={td}>{item.design_no || ''}</td>
                <td style={td}>{item.description || ''}</td>
                <td style={td}>{item.size_name || ''}</td>
                <td style={{ ...td, textAlign: 'right' }}>{item.qty}</td>
                <td style={{ ...td, textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                <td style={{ ...td, textAlign: 'right' }}>{parseFloat(item.net_amt).toFixed(2)}</td>
              </tr>
            ))}
            {/* Empty filler rows to match physical bill look - only if few items */}
            {bill.items && bill.items.length < 8 && Array.from({ length: Math.max(0, 8 - bill.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td style={tdEmpty}>&nbsp;</td>
                <td style={tdEmpty}></td>
                <td style={tdEmpty}></td>
                <td style={tdEmpty}></td>
                <td style={tdEmpty}></td>
                <td style={tdEmpty}></td>
                <td style={tdEmpty}></td>
              </tr>
            ))}
          </tbody>
          {/* Total row */}
          <tfoot>
            <tr>
              <td colSpan="3" style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>Total</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{bill.total_qty} Pcs</td>
              <td colSpan="2" style={{ ...td, fontWeight: 'bold' }}>Gross</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(bill.gross_amount || bill.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Bottom section - date/transport left, amounts right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '2px' }}>{bill.vch_date}</div>
            <div style={{ marginBottom: '2px' }}>Transport : {bill.transport ? bill.transport : '-'}</div>
            <div style={{ marginBottom: '2px' }}>LR No. : {bill.lr_no || ''}</div>
            <div>LR Dt. : {bill.lr_date || ''}</div>
          </div>
          <div style={{ minWidth: '200px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                {bill.chq_amount > 0 && (
                  <tr>
                    <td style={tdRight}>Cheque Amt</td>
                    <td style={{ ...tdRight, textAlign: 'right' }}>{parseFloat(bill.chq_amount).toFixed(2)}</td>
                  </tr>
                )}
                {bill.cash_amount > 0 && (
                  <tr>
                    <td style={tdRight}>Cash Amt</td>
                    <td style={{ ...tdRight, textAlign: 'right' }}>{parseFloat(bill.cash_amount).toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ ...tdRight, fontWeight: 'bold' }}>BILL AMT</td>
                  <td style={{ ...tdRight, textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(bill.total_amount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in words */}
        <div style={{ borderTop: '1px solid #000', marginTop: '4px', paddingTop: '3px', fontSize: '10px' }}>
          {numberToWords(parseFloat(bill.total_amount) || 0)}
        </div>

        {/* Terms */}
        <div style={{ marginTop: '3px', fontSize: '9px', color: '#555' }}>
          Goods are non returnable. Subject to local jurisdiction.
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          @page { margin: 8mm; size: A4; }
        }
      `}</style>
    </div>
  );
}

// Inline styles for compact table
const th = {
  border: '1px solid #000',
  padding: '3px 5px',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '11px',
  whiteSpace: 'nowrap',
};

const td = {
  border: '1px solid #000',
  padding: '2px 5px',
  fontSize: '11px',
};

const tdEmpty = {
  border: '1px solid #000',
  padding: '0px 5px',
  height: '16px',
  fontSize: '11px',
};

const tdRight = {
  border: '1px solid #000',
  padding: '2px 5px',
  fontSize: '11px',
};