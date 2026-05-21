import { useState } from 'react';
import axios from 'axios';
import useEnterKey from '../hooks/useEnterKey';

export default function Login() {
  useEnterKey(); 
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://spt-garment.onrender.com/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-blue-900 text-white rounded-xl p-4 inline-block mb-4">
            <span className="text-3xl">👔</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-900">SPT</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition duration-200 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

        {/* Default credentials hint */}
        <div className="mt-6 bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Default login credentials</p>
          <p className="text-xs font-semibold text-gray-700 mt-1">
            Username: <span className="text-blue-700">admin</span> | Password: <span className="text-blue-700">password</span>
          </p>
        </div>

      </div>
    </div>
  );
}
<div className="mt-3 text-center">
  <p className="text-xs text-gray-400">Developed by Mahek Lohana<span className="font-semibold text-blue-700">Mahek Lohana</span></p>
</div>