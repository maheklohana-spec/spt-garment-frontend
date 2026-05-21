import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [ ,setUser] = useState(null);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayBills: 0,
    pendingAmount: 0,
    unpaidBills: 0,
    overdueBills: 0,
    totalParties: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(userData));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [billsRes, partiesRes] = await Promise.all([
        fetch('https://spt-garment.onrender.com/api/bills'),
        fetch('https://spt-garment.onrender.com/api/masters/parties'),
      ]);
      const bills = await billsRes.json();
      const parties = await partiesRes.json();

      const today = new Date().toISOString().split('T')[0];
      const todayBills = bills.filter(b => b.vch_date === today);
      const unpaid = bills.filter(b => b.payment_status === 'UNPAID' || b.payment_status === 'OVERDUE');
      const overdue = bills.filter(b => {
        if (!b.due_date) return false;
        return new Date(b.due_date) < new Date() && b.payment_status !== 'PAID';
      });

      setStats({
        todaySales: todayBills.reduce((sum, b) => sum + b.total_amount, 0),
        todayBills: todayBills.length,
        pendingAmount: unpaid.reduce((sum, b) => sum + b.total_amount, 0),
        unpaidBills: unpaid.length,
        overdueBills: overdue.length,
        totalParties: parties.length,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="Dashboard" />

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-600 cursor-pointer hover:shadow-md" onClick={() => window.location.href='/bills'}>
            <p className="text-sm text-gray-500">Today's Sales</p>
            <p className="text-2xl font-bold text-blue-900">₹{stats.todaySales.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.todayBills} bills today</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-orange-500 cursor-pointer hover:shadow-md" onClick={() => window.location.href='/bills'}>
            <p className="text-sm text-gray-500">Pending Payments</p>
            <p className="text-2xl font-bold text-orange-600">₹{stats.pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.unpaidBills} unpaid bills</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500 cursor-pointer hover:shadow-md" onClick={() => window.location.href='/bills'}>
            <p className="text-sm text-gray-500">Overdue Bills</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdueBills}</p>
            <p className="text-xs text-gray-400 mt-1">Past due date</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500 cursor-pointer hover:shadow-md" onClick={() => window.location.href='/masters'}>
            <p className="text-sm text-gray-500">Total Parties</p>
            <p className="text-2xl font-bold text-green-700">{stats.totalParties}</p>
            <p className="text-xs text-gray-400 mt-1">Active parties</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-bold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'New Sale', icon: '🧾', color: 'bg-blue-600', path: '/sales' },
            { label: 'View Bills', icon: '📋', color: 'bg-purple-600', path: '/bills' },
            { label: 'Add Party', icon: '👤', color: 'bg-green-600', path: '/masters' },
            { label: 'Add Design', icon: '👔', color: 'bg-orange-600', path: '/masters' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => window.location.href = action.path}
              className={`${action.color} text-white rounded-xl p-4 text-sm font-semibold hover:opacity-90 transition flex items-center gap-2 justify-center`}
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Recent Bills</h3>
            <button onClick={() => window.location.href='/bills'} className="text-blue-600 text-sm hover:underline">View All →</button>
          </div>
          <div className="p-5 text-center text-gray-400 text-sm py-10">
            {stats.todayBills === 0 ? 'No bills yet. Create your first sale!' : `${stats.todayBills} bills created today`}
          </div>
        </div>
      </div>
    </div>
  );
}