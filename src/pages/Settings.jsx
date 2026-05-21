import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import useEnterKey from '../hooks/useEnterKey';

const API = 'https://spt-garment.onrender.com/api';

export default function Settings() {
   useEnterKey();
  const [form, setForm] = useState({
    company_name: 'SONAM TRADERS',
    owner_name: '',
    mobile: '',
    whatsapp: '',
    address: '',
    city: '',
    gstin: '',
    pan: '',
    email: '',
    invoice_prefix: 'A/',
    starting_bill_no: 1,
    default_tax_type: 'Itemwise',
    default_payment_days: 30,
    financial_year: '2025-26',
    alert_days_before: 3,
  });
  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState('company');
  const [deleteAfterDays, setDeleteAfterDays] = useState(30);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings`);
      if (res.data) setForm(res.data);
    } catch (err) {
      console.log('No settings yet');
    }
  };

  const saveSettings = async () => {
    try {
      await axios.post(`${API}/settings`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Error saving settings');
    }
  };

  const changePassword = async () => {
    setPwError('');
    if (!password.oldPassword || !password.newPassword) {
      setPwError('All fields are required!');
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      setPwError('New passwords do not match!');
      return;
    }
    if (password.newPassword.length < 4) {
      setPwError('Password must be at least 4 characters!');
      return;
    }
    try {
      await axios.post(`${API}/auth/change-password`, {
        username: 'admin',
        oldPassword: password.oldPassword,
        newPassword: password.newPassword,
      });
      setPwSaved(true);
      setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Error changing password');
    }
  };

  const runScheduler = async () => {
    try {
      await axios.post(`${API}/bills/run-scheduler`);
      alert('Scheduler ran! Check backend terminal for results.');
    } catch (err) {
      alert('Error running scheduler');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="Settings" />

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">⚙️ Settings</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'company', label: '🏢 Company' },
            { id: 'invoice', label: '🧾 Invoice' },
            { id: 'billing', label: '💰 Billing' },
            { id: 'security', label: '🔒 Security' },
            { id: 'system', label: '⚙️ System' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab.id ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Company Tab */}
        {activeTab === 'company' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-5 text-lg">🏢 Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Company Name</label>
                <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Owner Name</label>
                <input type="text" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Mobile No</label>
                <input type="text" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">WhatsApp No</label>
                <input type="text" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">City</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">GSTIN</label>
                <input type="text" value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="27XXXXX" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">PAN No</label>
                <input type="text" value={form.pan} onChange={e => setForm({...form, pan: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <button onClick={saveSettings} className="mt-5 bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-800">
              {saved ? '✅ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        )}

        {/* Invoice Tab */}
        {activeTab === 'invoice' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-5 text-lg">🧾 Invoice Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Invoice Prefix</label>
                <input type="text" value={form.invoice_prefix} onChange={e => setForm({...form, invoice_prefix: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="A/" />
                <p className="text-xs text-gray-400 mt-1">Example: A/ → Bill No will be A/1, A/2...</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Financial Year</label>
                <select value={form.financial_year} onChange={e => setForm({...form, financial_year: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option>2024-25</option>
                  <option>2025-26</option>
                  <option>2026-27</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Default Tax Type</label>
                <select value={form.default_tax_type} onChange={e => setForm({...form, default_tax_type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option>Itemwise</option>
                  <option>Billwise</option>
                  <option>None</option>
                </select>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="mt-5 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Invoice Preview:</p>
              <p className="font-bold text-lg">{form.company_name || 'SONAM TRADERS'}</p>
              <p className="text-sm text-gray-600">{form.address} {form.city}</p>
              <p className="text-xs text-gray-500">GSTIN: {form.gstin || '—'} | PAN: {form.pan || '—'}</p>
              <p className="text-xs text-gray-500 mt-1">Bill No format: {form.invoice_prefix}1, {form.invoice_prefix}2...</p>
            </div>

            <button onClick={saveSettings} className="mt-5 bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-800">
              {saved ? '✅ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-5 text-lg">💰 Billing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Default Payment Days</label>
                <select value={form.default_payment_days} onChange={e => setForm({...form, default_payment_days: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value={7}>7 days</option>
                  <option value={15}>15 days</option>
                  <option value={30}>30 days</option>
                  <option value={45}>45 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Default due date for all new bills</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Alert Days Before Due</label>
                <select value={form.alert_days_before} onChange={e => setForm({...form, alert_days_before: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before</option>
                  <option value={5}>5 days before</option>
                  <option value={7}>7 days before</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Auto Delete Bills After</label>
                <select value={deleteAfterDays} onChange={e => setDeleteAfterDays(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value={7}>7 days</option>
                  <option value={15}>15 days</option>
                  <option value={30}>30 days ← default</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Bills older than this will be auto-deleted</p>
              </div>
            </div>

            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-700">⚠️ Auto Delete Info</p>
              <p className="text-xs text-orange-600 mt-1">Bills are automatically deleted every night at 11 PM after the selected number of days from creation date.</p>
            </div>

            <button onClick={saveSettings} className="mt-5 bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-800">
              {saved ? '✅ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow p-6 max-w-md">
            <h3 className="font-bold text-gray-700 mb-5 text-lg">🔒 Change Password</h3>

            {pwError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {pwError}
              </div>
            )}
            {pwSaved && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                ✅ Password changed successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Current Password</label>
                <input type="password" value={password.oldPassword} onChange={e => setPassword({...password, oldPassword: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Enter current password" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">New Password</label>
                <input type="password" value={password.newPassword} onChange={e => setPassword({...password, newPassword: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Enter new password" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Confirm New Password</label>
                <input type="password" value={password.confirmPassword} onChange={e => setPassword({...password, confirmPassword: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Confirm new password" />
              </div>
              <button onClick={changePassword} className="w-full bg-blue-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-800">
                🔒 Change Password
              </button>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-5 text-lg">⚙️ System Settings</h3>

            <div className="space-y-4">
              {/* Scheduler */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-700">🕐 Auto Delete Scheduler</p>
                    <p className="text-xs text-gray-500 mt-1">Runs every night at 11 PM — deletes old bills and marks overdue</p>
                  </div>
                  <button onClick={runScheduler} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    ▶ Run Now
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-700 mb-3">📊 App Information</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">App Name</span>
                  <span className="font-semibold">Garment Management System</span>
                  <span className="text-gray-500">Version</span>
                  <span className="font-semibold">1.0.0</span>
                  <span className="text-gray-500">Database</span>
                  <span className="font-semibold">SQLite</span>
                  <span className="text-gray-500">Backend</span>
                  <span className="font-semibold">Node.js + Express</span>
                  <span className="text-gray-500">Frontend</span>
                  <span className="font-semibold">React + Tailwind</span>
                </div>
              </div>

              {/* Clear Data */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="font-semibold text-red-700 mb-1">⚠️ Danger Zone</p>
                <p className="text-xs text-red-500 mb-3">These actions cannot be undone!</p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure? This will logout and clear all local data!')) {
                      localStorage.clear();
                      window.location.href = '/';
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  🗑 Clear Local Data & Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}