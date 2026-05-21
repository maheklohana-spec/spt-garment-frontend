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
      <p className="text-gray-500 text-lg">Loading invoice...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button onClick={() => window.history.back()} className="bg-blue-900 text-white px-4 py-2 rounded">Go Back</button>
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

      {/* Invoice Content */}
      <div className="max-w-3xl mx-auto bg-white p-8 mt-4 shadow-lg print:shadow-none print:mt-0 print:p-4">

        {/* Company Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 uppercase">
            {bill.series || settings.company_name || 'CASH SALE'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Garment Wholesale Dealer</p>
          {settings.address && (
            <p className="text-xs text-gray-500">{settings.address}{settings.city ? ', ' + settings.city : ''}</p>
          )}
          {settings.mobile && (
            <p className="text-xs text-gray-500">Mobile: {settings.mobile}</p>
          )}
          {settings.gstin && (
            <p className="text-xs text-gray-500">GSTIN: {settings.gstin}</p>
          )}
        </div>

        {/* Party + Invoice Info */}
        <div className="flex justify-between mb-5 gap-4">
          <div className="flex-1 border border-gray-300 rounded p-3">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Bill To</p>
            <p className="font-bold text-gray-900 text-base">
              M/S {bill.party_name || 'CASH SALE'}
            </p>
            {bill.print_name && bill.print_name !== bill.party_name && (
              <p className="text-sm text-gray-600">{bill.print_name}</p>
            )}
            {bill.gstin && (
              <p className="text-xs text-gray-500 mt-1">GSTIN: {bill.gstin}</p>
            )}
          </div>
          <div className="flex-1 border border-gray-300 rounded p-3">
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span className="text-gray-500 font-semibold">Invoice No:</span>
              <span className="font-bold text-blue-900">{bill.bill_no}</span>
              <span className="text-gray-500 font-semibold">Bill Date:</span>
<span>{bill.vch_date}</span>
              <span className="text-gray-500 font-semibold">Due Date:</span>
              <span className="text-orange-600 font-semibold">{bill.due_date || '—'}</span>
              <span className="text-gray-500 font-semibold">Transport:</span>
              <span>{bill.transport || '—'}</span>
              {bill.vehicle_no && (
                <>
                  <span className="text-gray-500 font-semibold">Vehicle:</span>
                  <span>{bill.vehicle_no}</span>
                </>
              )}
              {bill.parcels > 0 && (
                <>
                  <span className="text-gray-500 font-semibold">Parcels:</span>
                  <span>{bill.parcels}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="border border-gray-600 px-3 py-2 text-left">Sr</th>
              <th className="border border-gray-600 px-3 py-2 text-left">Particulars</th>
              <th className="border border-gray-600 px-3 py-2 text-center">Size</th>
              <th className="border border-gray-600 px-3 py-2 text-center">Qty</th>
              <th className="border border-gray-600 px-3 py-2 text-right">Rate (₹)</th>
              <th className="border border-gray-600 px-3 py-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items?.length > 0 ? bill.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">{i + 1}</td>
                <td className="border border-gray-300 px-3 py-2 font-semibold">{item.description}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                    {item.size_name}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center font-bold">{item.qty}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{parseFloat(item.rate).toFixed(2)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold">{parseFloat(item.net_amt).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="border border-gray-300 px-3 py-4 text-center text-gray-400">No items</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-800 text-white font-bold">
              <td colSpan="3" className="border border-gray-600 px-3 py-2 text-right">Total:</td>
              <td className="border border-gray-600 px-3 py-2 text-center">{bill.total_qty} pcs</td>
              <td className="border border-gray-600 px-3 py-2"></td>
              <td className="border border-gray-600 px-3 py-2 text-right">₹{parseFloat(bill.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in Words */}
        <div className="border border-gray-300 rounded p-3 mb-4 bg-gray-50">
          <span className="text-xs text-gray-500 font-semibold">Amount in Words: </span>
          <span className="font-semibold text-gray-800 text-sm">
            {numberToWords(parseFloat(bill.total_amount) || 0)}
          </span>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm border-b border-gray-200">
              <span className="text-gray-600">Gross Amount</span>
              <span className="font-semibold">₹{parseFloat(bill.gross_amount || bill.total_amount).toFixed(2)}</span>
            </div>
            {bill.chq_amount > 0 && (
              <div className="flex justify-between py-1 text-sm border-b border-gray-200">
                <span className="text-gray-600">Cheque Amount</span>
                <span>₹{parseFloat(bill.chq_amount).toFixed(2)}</span>
              </div>
            )}
            {bill.cash_amount > 0 && (
              <div className="flex justify-between py-1 text-sm border-b border-gray-200">
                <span className="text-gray-600">Cash Amount</span>
                <span>₹{parseFloat(bill.cash_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 bg-gray-900 text-white rounded px-3 mt-2">
              <span className="font-bold">BILL AMOUNT</span>
              <span className="font-bold text-lg">₹{parseFloat(bill.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms only - no signature */}
        <div className="border-t border-gray-300 pt-4">
          <p className="text-xs text-gray-500 font-semibold">Terms & Conditions:</p>
          <p className="text-xs text-gray-400 mt-1">• Goods are non returnable.</p>
         
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  );
}