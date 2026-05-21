import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://spt-garment.onrender.com/api';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    const res = await axios.get(`${API}/bills`);
    setBills(res.data);
  };

  const markPayment = async (id, status) => {
    await axios.put(`${API}/bills/${id}/payment`, { status });
    fetchBills();
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (status) => {
    const badges = {
      UNPAID: 'bg-red-100 text-red-700 border border-red-200',
      PAID: 'bg-green-100 text-green-700 border border-green-200',
      OVERDUE: 'bg-orange-100 text-orange-700 border border-orange-200',
      HOLD: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      PARTIAL: 'bg-blue-100 text-blue-700 border border-blue-200',
    };
    return badges[status] || badges.UNPAID;
  };

  const getDaysColor = (days) => {
    if (days === null) return 'text-gray-400';
    if (days < 0) return 'text-red-600 font-bold';
    if (days <= 3) return 'text-orange-600 font-bold';
    if (days <= 7) return 'text-yellow-600 font-bold';
    return 'text-green-600';
  };

  const filtered = bills.filter(b => {
    const matchFilter = filter === 'ALL' || b.payment_status === filter;
    const matchSearch = !search || b.bill_no.toLowerCase().includes(search.toLowerCase()) || (b.party_name || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPending = bills.filter(b => b.payment_status === 'UNPAID' || b.payment_status === 'OVERDUE').reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👔</span>
          <h1 className="font-bold text-lg">Garment Management System</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.href='/dashboard'} className="bg-blue-700 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">← Dashboard</button>
          <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg">Logout</button>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-blue-800 px-6 py-2 flex gap-2">
        {[{label:'Dashboard',path:'/dashboard'},{label:'Masters',path:'/masters'},{label:'New Sale',path:'/sales'},{label:'Bills',path:'/bills'}].map(item => (
          <button key={item.label} onClick={() => window.location.href=item.path} className="text-white text-xs px-4 py-2 rounded hover:bg-blue-600 transition">{item.label}</button>
        ))}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700">📋 Bills List</h2>
          <button onClick={() => window.location.href='/sales'} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ New Sale</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
            <p className="text-xs text-gray-500">Total Bills</p>
            <p className="text-2xl font-bold text-blue-900">{bills.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <p className="text-xs text-gray-500">Unpaid</p>
            <p className="text-2xl font-bold text-red-600">{bills.filter(b => b.payment_status === 'UNPAID').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-500">
            <p className="text-xs text-gray-500">Pending Amount</p>
            <p className="text-xl font-bold text-orange-600">₹{totalPending.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-green-600">{bills.filter(b => b.payment_status === 'PAID').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-3 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search bill no or party..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-64"
          />
          {['ALL','UNPAID','PAID','OVERDUE','HOLD'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${filter === f ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Bill No</th>
                <th className="px-4 py-3 text-left">Party</th>
                <th className="px-4 py-3 text-left">Bill Date</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-center">Days Left</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-400">No bills found</td></tr>
              ) : (
                filtered.map((bill, i) => {
                  const daysLeft = getDaysLeft(bill.due_date);
                  return (
                    <tr key={bill.id} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                      <td className="px-4 py-3 font-bold text-blue-900">{bill.bill_no}</td>
                      <td className="px-4 py-3">{bill.party_name || 'CASH SALE'}</td>
                      <td className="px-4 py-3 text-gray-500">{bill.vch_date}</td>
                      <td className="px-4 py-3 text-gray-500">{bill.due_date || '-'}</td>
                      <td className={`px-4 py-3 text-center ${getDaysColor(daysLeft)}`}>
                        {daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due Today!' : `${daysLeft} days`) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">₹{bill.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(bill.payment_status)}`}>
                          {bill.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => window.location.href=`/invoice/${bill.id}`} className="bg-indigo-600 text-white text-xs px-2 py-1 rounded hover:bg-indigo-700">🖨 Print</button>
                          {bill.payment_status !== 'PAID' && (
                            <button onClick={() => markPayment(bill.id, 'PAID')} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">✅ Paid</button>
                          )}
                          {bill.payment_status !== 'HOLD' && (
                            <button onClick={() => markPayment(bill.id, 'HOLD')} className="bg-yellow-500 text-white text-xs px-2 py-1 rounded hover:bg-yellow-600">⏸ Hold</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}