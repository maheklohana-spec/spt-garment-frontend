import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import useEnterKey from '../hooks/useEnterKey';

export default function Reports() {
  useEnterKey();
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://spt-garment.onrender.com/api/bills/report/range?from_date=${fromDate}&to_date=${toDate}`);
      setData(res.data);
    } catch (err) {
      alert('Error fetching report');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      UNPAID: 'bg-red-100 text-red-700',
      PAID: 'bg-green-100 text-green-700',
      OVERDUE: 'bg-orange-100 text-orange-700',
      HOLD: 'bg-yellow-100 text-yellow-700',
    };
    return badges[status] || badges.UNPAID;
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="Reports" />

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">📊 Sales Report</h2>

        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow p-5 mb-5">
          <h3 className="font-bold text-gray-700 mb-4">Select Date Range</h3>
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick Select Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Today', from: today, to: today },
                { label: 'This Week', from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], to: today },
                { label: 'This Month', from: firstOfMonth, to: today },
                { label: 'Last 3 Months', from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0], to: today },
              ].map(q => (
                <button
                  key={q.label}
                  onClick={() => { setFromDate(q.from); setToDate(q.to); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg font-semibold transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Loading...' : '🔍 Get Report'}
            </button>

            {data && (
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold no-print"
              >
                🖨 Print
              </button>
            )}
          </div>
        </div>

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
                <p className="text-xs text-gray-500">Total Bills</p>
                <p className="text-2xl font-bold text-blue-900">{data.summary.total_bills}</p>
                <p className="text-xs text-gray-400">Total Qty: {data.summary.total_qty}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-600">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-gray-800">₹{data.summary.total_amount?.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-xl font-bold text-green-600">₹{data.summary.paid_amount?.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{data.summary.paid_count} bills</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
                <p className="text-xs text-gray-500">Unpaid</p>
                <p className="text-xl font-bold text-red-600">₹{data.summary.unpaid_amount?.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{data.summary.unpaid_count} bills</p>
              </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">
                  Bills from {fromDate} to {toDate}
                </h3>
                <span className="text-sm text-gray-500">{data.bills.length} bills found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Bill No</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Party</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bills.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-10 text-gray-400">
                          No bills found for this date range
                        </td>
                      </tr>
                    ) : (
                      data.bills.map((bill, i) => (
                        <tr key={bill.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-bold text-blue-900">{bill.bill_no}</td>
                          <td className="px-4 py-3 text-gray-600">{bill.vch_date}</td>
                          <td className="px-4 py-3">{bill.party_name || 'CASH SALE'}</td>
                          <td className="px-4 py-3 text-center">{bill.total_qty}</td>
                          <td className="px-4 py-3 text-right font-bold">₹{bill.total_amount?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-500">{bill.due_date || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(bill.payment_status)}`}>
                              {bill.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center no-print">
                            <button
                              onClick={() => window.location.href=`/invoice/${bill.id}`}
                              className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700"
                            >
                              🖨 Print
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {data.bills.length > 0 && (
                    <tfoot>
                      <tr className="bg-blue-900 text-white font-bold">
                        <td colSpan="3" className="px-4 py-3 text-right">TOTAL</td>
                        <td className="px-4 py-3 text-center">{data.summary.total_qty}</td>
                        <td className="px-4 py-3 text-right">₹{data.summary.total_amount?.toFixed(2)}</td>
                        <td colSpan="3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}