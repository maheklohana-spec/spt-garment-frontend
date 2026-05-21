import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import useEnterKey from '../hooks/useEnterKey';

const API = 'https://spt-garment.onrender.com/api/masters';

export default function Masters() {
  useEnterKey();
  const [activeTab, setActiveTab] = useState('designs');

  // ===== SIZES =====
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState('');

  // ===== DESIGNS =====
  const [designs, setDesigns] = useState([]);
  const [showDesignForm, setShowDesignForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [designForm, setDesignForm] = useState({
    design_no: '', design_name: '', category: '',
    default_rate: '', hsn_code: '', description: '', sizes: []
  });

  // ===== PARTIES =====
  const [parties, setParties] = useState([]);
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [partyForm, setPartyForm] = useState({
    party_name: '', mobile: '', whatsapp: '',
    address: '', city: '', gstin: '',
    default_payment_days: 30, opening_balance: 0
  });

  useEffect(() => {
    fetchSizes();
    fetchDesigns();
    fetchParties();
  }, []);

  const fetchSizes = async () => {
    const res = await axios.get(`${API}/sizes`);
    setSizes(res.data);
  };

  const fetchDesigns = async () => {
    const res = await axios.get(`${API}/designs`);
    setDesigns(res.data);
  };

  const fetchParties = async () => {
    const res = await axios.get(`${API}/parties`);
    setParties(res.data);
  };

  // ===== SIZE ACTIONS =====
  const addSize = async () => {
    if (!newSize.trim()) return;
    await axios.post(`${API}/sizes`, { size_name: newSize, sort_order: sizes.length + 1 });
    setNewSize('');
    fetchSizes();
  };

  const deleteSize = async (id) => {
    if (window.confirm('Delete this size?')) {
      await axios.delete(`${API}/sizes/${id}`);
      fetchSizes();
    }
  };

  // ===== DESIGN ACTIONS =====
  const saveDesign = async (addAnother = false) => {
    if (!designForm.design_no || !designForm.design_name) {
      alert('Design No and Name are required!');
      return;
    }
    try {
      if (editingDesign) {
        await axios.put(`${API}/designs/${editingDesign.id}`, designForm);
      } else {
        await axios.post(`${API}/designs`, designForm);
      }
      fetchDesigns();
      if (addAnother) {
        setDesignForm({
          design_no: '',
          design_name: '',
          category: designForm.category,
          default_rate: '',
          hsn_code: '',
          description: '',
          sizes: designForm.sizes
        });
        setTimeout(() => {
          document.getElementById('design_no')?.focus();
        }, 100);
      } else {
        setShowDesignForm(false);
        setEditingDesign(null);
        setDesignForm({
          design_no: '', design_name: '', category: '',
          default_rate: '', hsn_code: '', description: '', sizes: []
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving design');
    }
  };

  const editDesign = (design) => {
    setEditingDesign(design);
    setDesignForm({
      design_no: design.design_no,
      design_name: design.design_name,
      category: design.category || '',
      default_rate: design.default_rate,
      hsn_code: design.hsn_code || '',
      description: design.description || '',
      sizes: design.sizes.map(s => s.id)
    });
    setShowDesignForm(true);
  };

  const deleteDesign = async (id) => {
    if (window.confirm('Delete this design?')) {
      await axios.delete(`${API}/designs/${id}`);
      fetchDesigns();
    }
  };

  const toggleSize = (sizeId) => {
    setDesignForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(sizeId)
        ? prev.sizes.filter(s => s !== sizeId)
        : [...prev.sizes, sizeId]
    }));
  };

  // ===== PARTY ACTIONS =====
  const saveParty = async (addAnother = false) => {
    if (!partyForm.party_name) {
      alert('Party name is required!');
      return;
    }
    try {
      if (editingParty) {
        await axios.put(`${API}/parties/${editingParty.id}`, partyForm);
      } else {
        await axios.post(`${API}/parties`, partyForm);
      }
      fetchParties();
      if (addAnother) {
        setPartyForm({
          party_name: '', mobile: '', whatsapp: '',
          address: '', city: partyForm.city,
          gstin: '', default_payment_days: partyForm.default_payment_days,
          opening_balance: 0
        });
        setTimeout(() => {
          document.getElementById('party_name')?.focus();
        }, 100);
      } else {
        setShowPartyForm(false);
        setEditingParty(null);
        setPartyForm({
          party_name: '', mobile: '', whatsapp: '',
          address: '', city: '', gstin: '',
          default_payment_days: 30, opening_balance: 0
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving party');
    }
  };

  const editParty = (party) => {
    setEditingParty(party);
    setPartyForm(party);
    setShowPartyForm(true);
  };

  const deleteParty = async (id) => {
    if (window.confirm('Delete this party?')) {
      await axios.delete(`${API}/parties/${id}`);
      fetchParties();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="Masters" />

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Masters</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['designs', 'parties', 'sizes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {tab === 'designs' ? '👔 Designs' : tab === 'parties' ? '👤 Parties' : '📏 Sizes'}
            </button>
          ))}
        </div>

        {/* ===== SIZES TAB ===== */}
        {activeTab === 'sizes' && (
          <div className="bg-white rounded-xl shadow p-5 max-w-lg">
            <h3 className="font-bold text-gray-700 mb-4">Size Master</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter size name (e.g. XL)"
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSize()}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button onClick={addSize} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Add</button>
            </div>
            <div className="space-y-2">
              {sizes.map(size => (
                <div key={size.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                  <span className="font-semibold text-gray-700">{size.size_name}</span>
                  <button onClick={() => deleteSize(size.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== DESIGNS TAB ===== */}
        {activeTab === 'designs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">Design Master ({designs.length} designs)</h3>
              <button
                onClick={() => {
                  setShowDesignForm(true);
                  setEditingDesign(null);
                  setDesignForm({
                    design_no: '', design_name: '', category: '',
                    default_rate: '', hsn_code: '', description: '', sizes: []
                  });
                }}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Add Design
              </button>
            </div>

            {/* Design Form */}
            {showDesignForm && (
              <div className="bg-white rounded-xl shadow p-5 mb-4">
                <h4 className="font-bold text-gray-700 mb-1">
                  {editingDesign ? 'Edit Design' : 'New Design'}
                </h4>
                <p className="text-xs text-gray-400 mb-4">Press Enter to move between fields</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Design No *</label>
                    <input
                      id="design_no"
                      type="text"
                      placeholder="e.g. 1001"
                      value={designForm.design_no}
                      onChange={e => setDesignForm({...designForm, design_no: e.target.value})}
                      onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); document.getElementById('design_name').focus(); }}}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Design Name *</label>
                    <input
                      id="design_name"
                      type="text"
                      placeholder="e.g. KASHISH FOAM"
                      value={designForm.design_name}
                      onChange={e => setDesignForm({...designForm, design_name: e.target.value})}
                      onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); document.getElementById('design_category').focus(); }}}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
                    <select
                      id="design_category"
                      value={designForm.category}
                      onChange={e => setDesignForm({...designForm, category: e.target.value})}
                      onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); document.getElementById('design_rate').focus(); }}}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option>BRA</option>
                      <option>BLUSTER</option>
                      <option>PANTY</option>
                      <option>SLIP</option>
                      <option>CYCLING</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Default Rate (₹)</label>
                    <input
                      id="design_rate"
                      type="number"
                      placeholder="0.00"
                      value={designForm.default_rate}
                      onChange={e => setDesignForm({...designForm, default_rate: e.target.value})}
                      onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); document.getElementById('design_desc').focus(); }}}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                    <textarea
                      id="design_desc"
                      placeholder="Enter design description..."
                      value={designForm.description || ''}
                      onChange={e => setDesignForm({...designForm, description: e.target.value})}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (designForm.sizes.length === sizes.length) {
                          setDesignForm({...designForm, sizes: []});
                        } else {
                          setDesignForm({...designForm, sizes: sizes.map(s => s.id)});
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                        designForm.sizes.length === sizes.length
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-gray-600 border-gray-300'
                      }`}
                    >
                      {designForm.sizes.length === sizes.length ? '✓ All Sizes' : 'All Sizes'}
                    </button>
                    {sizes.map(size => (
                      <button
                        type="button"
                        key={size.id}
                        onClick={() => toggleSize(size.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                          designForm.sizes.includes(size.id)
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-white text-gray-600 border-gray-300'
                        }`}
                      >
                        {size.size_name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 items-center">
                  <button
                    id="design_save"
                    onClick={() => saveDesign(false)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    {editingDesign ? 'Update Design' : '💾 Save Design'}
                  </button>
                  <button
                    onClick={() => saveDesign(true)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    💾 Save & Add Another
                  </button>
                  <button
                    onClick={() => setShowDesignForm(false)}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Designs List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Design No</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Rate</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Sizes</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designs.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-400">No designs yet. Add your first design!</td></tr>
                  ) : (
                    designs.map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-semibold text-blue-900">{d.design_no}</td>
                        <td className="px-4 py-3">{d.design_name}</td>
                        <td className="px-4 py-3 text-gray-500">{d.category || '-'}</td>
                        <td className="px-4 py-3 font-semibold">₹{d.default_rate}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{d.description || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {d.sizes.map(s => (
                              <span key={s.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{s.size_name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => editDesign(d)} className="text-blue-600 hover:text-blue-800 mr-3 text-xs font-semibold">Edit</button>
                          <button onClick={() => deleteDesign(d.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PARTIES TAB ===== */}
        {activeTab === 'parties' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">Party Master ({parties.length} parties)</h3>
              <button
                onClick={() => {
                  setShowPartyForm(true);
                  setEditingParty(null);
                  setPartyForm({
                    party_name: '', mobile: '', whatsapp: '',
                    address: '', city: '', gstin: '',
                    default_payment_days: 30, opening_balance: 0
                  });
                }}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Add Party
              </button>
            </div>

            {/* Party Form */}
            {showPartyForm && (
              <div className="bg-white rounded-xl shadow p-5 mb-4">
                <h4 className="font-bold text-gray-700 mb-1">
                  {editingParty ? 'Edit Party' : 'New Party'}
                </h4>
                <p className="text-xs text-gray-400 mb-4">Press Enter to move between fields</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Party Name *</label>
                    <input
                      id="party_name"
                      type="text"
                      placeholder="e.g. MHADEV STORE"
                      value={partyForm.party_name}
                      onChange={e => setPartyForm({...partyForm, party_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Mobile No</label>
                    <input
                      type="text"
                      placeholder="Mobile number"
                      value={partyForm.mobile}
                      onChange={e => setPartyForm({...partyForm, mobile: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">WhatsApp No</label>
                    <input
                      type="text"
                      placeholder="WhatsApp number"
                      value={partyForm.whatsapp}
                      onChange={e => setPartyForm({...partyForm, whatsapp: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={partyForm.city}
                      onChange={e => setPartyForm({...partyForm, city: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Address</label>
                    <input
                      type="text"
                      placeholder="Full address"
                      value={partyForm.address}
                      onChange={e => setPartyForm({...partyForm, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">GSTIN</label>
                    <input
                      type="text"
                      placeholder="GST number"
                      value={partyForm.gstin}
                      onChange={e => setPartyForm({...partyForm, gstin: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Payment Days</label>
                    <select
                      value={partyForm.default_payment_days}
                      onChange={e => setPartyForm({...partyForm, default_payment_days: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value={7}>7 days</option>
                      <option value={15}>15 days</option>
                      <option value={30}>30 days</option>
                      <option value={45}>45 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Opening Balance (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={partyForm.opening_balance}
                      onChange={e => setPartyForm({...partyForm, opening_balance: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveParty(false)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    {editingParty ? 'Update Party' : '💾 Save Party'}
                  </button>
                  <button
                    onClick={() => saveParty(true)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    💾 Save & Add Another
                  </button>
                  <button
                    onClick={() => setShowPartyForm(false)}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Parties List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Party Name</th>
                    <th className="px-4 py-3 text-left">Mobile</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">GSTIN</th>
                    <th className="px-4 py-3 text-left">Payment Days</th>
                    <th className="px-4 py-3 text-left">Opening Bal</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-400">No parties yet. Add your first party!</td></tr>
                  ) : (
                    parties.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-semibold text-blue-900">{p.party_name}</td>
                        <td className="px-4 py-3">{p.mobile || '-'}</td>
                        <td className="px-4 py-3">{p.city || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{p.gstin || '-'}</td>
                        <td className="px-4 py-3">{p.default_payment_days} days</td>
                        <td className="px-4 py-3">₹{p.opening_balance}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => editParty(p)} className="text-blue-600 hover:text-blue-800 mr-3 text-xs font-semibold">Edit</button>
                          <button onClick={() => deleteParty(p.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}