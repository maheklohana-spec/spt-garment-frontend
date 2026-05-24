import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import useEnterKey from '../hooks/useEnterKey';

const API = 'https://spt-garment.onrender.com/api';

export default function Sales() {
  useEnterKey();

  const editId = window.location.pathname.includes('/edit/') 
    ? window.location.pathname.split('/edit/')[1] 
    : null;

  const [designs, setDesigns] = useState([]);
  const [parties, setParties] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [billNo, setBillNo] = useState('');
  const [savedId, setSavedId] = useState(null);
  const [saleType, setSaleType] = useState('cash');
  const [form, setForm] = useState({
    series: 'CASH SALE',
    vch_date: new Date().toISOString().split('T')[0],
    tax_type: 'Itemwise',
    party_id: '',
    party_name: '',
    print_name: '',
    from_shop: 'SHOP',
    transport: 'Road',
    vehicle_no: '',
    distance_km: '',
    lr_no: '',
    lr_date: '',
    eway_bill_no: '',
    eway_bill_date: '',
    parcels: '',
    form_type: 'None',
    courier: '',
    narration: '',
    chq_amount: 0,
    payment_days: 30,
    due_date: '',
  });
  const [items, setItems] = useState([
    { design_id: '', design_no: '', description: '', size_id: '', size_name: '', qty: '', rate: '', net_amt: 0, remarks: '', availableSizes: [] }
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/exhaustive-deps
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (form.vch_date && form.payment_days) {
      const date = new Date(form.vch_date);
      date.setDate(date.getDate() + parseInt(form.payment_days));
      setForm(prev => ({ ...prev, due_date: date.toISOString().split('T')[0] }));
    }
  }, [form.vch_date, form.payment_days]);

  const fetchData = async () => {
    try {
      const [d, p, s, b] = await Promise.all([
        axios.get(`${API}/masters/designs`),
        axios.get(`${API}/masters/parties`),
        axios.get(`${API}/masters/sizes`),
        axios.get(`${API}/sales/next-bill-no`)
      ]);
      setDesigns(d.data);
      setParties(p.data);
      setSizes(s.data);

      if (editId) {
        // Load existing bill for editing
        const billRes = await axios.get(`${API}/bills/${editId}`);
        const bill = billRes.data;
        setBillNo(bill.bill_no);
        setSavedId(parseInt(editId));
        setSaved(true);
        setSaleType(bill.sale_type || 'cash');
        setForm({
          series: bill.series || 'CASH SALE',
          vch_date: bill.vch_date || new Date().toISOString().split('T')[0],
          tax_type: bill.tax_type || 'Itemwise',
          party_id: bill.party_id || '',
          party_name: bill.party_name || '',
          print_name: bill.print_name || '',
          from_shop: bill.from_shop || 'SHOP',
          transport: bill.transport || 'Road',
          vehicle_no: bill.vehicle_no || '',
          distance_km: bill.distance_km || '',
          lr_no: bill.lr_no || '',
          lr_date: bill.lr_date || '',
          eway_bill_no: bill.eway_bill_no || '',
          eway_bill_date: bill.eway_bill_date || '',
          parcels: bill.parcels || '',
          form_type: bill.form_type || 'None',
          courier: bill.courier || '',
          narration: bill.narration || '',
          chq_amount: bill.chq_amount || 0,
          payment_days: bill.payment_days || 30,
          due_date: bill.due_date || '',
        });
        if (bill.items && bill.items.length > 0) {
          setItems(bill.items.map(item => {
            const design = d.data.find(des => des.id === item.design_id);
            return {
              design_id: item.design_id || '',
              design_no: item.design_no || '',
              description: item.description || '',
              size_id: item.size_id || '',
              size_name: item.size_name || '',
              qty: item.qty || '',
              rate: item.rate || '',
              net_amt: item.net_amt || 0,
              remarks: item.remarks || '',
              availableSizes: design ? design.sizes || [] : s.data
            };
          }));
        }
      } else {
        setBillNo(b.data.bill_no);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handlePartyChange = (partyId) => {
    const party = parties.find(p => p.id === parseInt(partyId));
    if (party) {
      setForm(prev => ({
        ...prev,
        party_id: party.id,
        party_name: party.party_name,
        print_name: party.party_name,
        payment_days: party.default_payment_days || 30
      }));
    }
  };

  const handleDesignChange = (index, designId) => {
    const design = designs.find(d => d.id === parseInt(designId));
    if (design) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        design_id: design.id,
        design_no: design.design_no,
        description: design.design_name,
        rate: design.default_rate,
        size_id: '',
        size_name: '',
        net_amt: 0,
        availableSizes: design.sizes || []
      };
      setItems(newItems);
    }
  };

  const handleSizeChange = (index, sizeId) => {
    const size = sizes.find(s => s.id === parseInt(sizeId));
    if (size) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], size_id: size.id, size_name: size.size_name };
      calcNetAmt(newItems, index);
    }
  };

  const handleQtyChange = (index, qty) => {
    const newItems = [...items];
    newItems[index].qty = qty;
    calcNetAmt(newItems, index);
  };

  const handleRateChange = (index, rate) => {
    const newItems = [...items];
    newItems[index].rate = rate;
    calcNetAmt(newItems, index);
  };

  const calcNetAmt = (newItems, index) => {
    const qty = parseFloat(newItems[index].qty) || 0;
    const rate = parseFloat(newItems[index].rate) || 0;
    newItems[index].net_amt = qty * rate;
    setItems(newItems);
  };

  const addRow = useCallback(() => {
  setItems(prev => [...prev, {
    design_id: '', design_no: '', description: '', size_id: '',
    size_name: '', qty: '', rate: '', net_amt: 0, remarks: '', availableSizes: []
  }]);
}, []);

  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQty = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
  const grossAmount = items.reduce((sum, i) => sum + (parseFloat(i.net_amt) || 0), 0);
  const totalAmount = grossAmount;
  const cashAmount = totalAmount - (parseFloat(form.chq_amount) || 0);

  const handleSave = useCallback(async () => {
    if (saleType === 'party' && !form.party_id && !form.party_name) {
      alert('Please select or enter a party!');
      return;
    }
    const validItems = items.filter(i => i.description && i.qty);
    if (validItems.length === 0) {
      alert('Please add at least one item!');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        bill_no: billNo,
        sale_type: saleType,
        party_name: saleType === 'cash' ? 'CASH SALE' : form.party_name,
        total_qty: totalQty,
        gross_amount: grossAmount,
        total_amount: totalAmount,
        cash_amount: cashAmount,
        items: validItems
      };

      if (editId) {
        // UPDATE existing bill
        await axios.put(`${API}/sales/${editId}`, payload);
        setSavedId(parseInt(editId));
        window.open(`/invoice/${editId}`, '_blank');
      } else {
        // CREATE new bill
        const response = await axios.post(`${API}/sales`, payload);
        setSavedId(response.data.id);
        window.open(`/invoice/${response.data.id}`, '_blank');
      }
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving sale');
    }
    setSaving(false);
  }, [form, items, saleType, billNo, totalQty, grossAmount, totalAmount, cashAmount, editId]);

  const handleNewBill = () => {
    window.location.href = '/sales';
  };

 useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'F2') { e.preventDefault(); window.location.href = '/bills'; }
    if (e.key === 'F3') { e.preventDefault(); window.location.href = '/masters'; }
    if (e.key === 'PageDown') { e.preventDefault(); addRow(); }
    if (e.key === 'F6') { e.preventDefault(); handleSave(); }
    if (e.key === 'F10') {
      e.preventDefault();
      if (!savedId) { alert('Please save the bill first!'); return; }
      window.open(`/invoice/${savedId}`, '_blank');
    }
    if (e.key === 'F12') { e.preventDefault(); window.location.href = '/dashboard'; }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [savedId, handleSave, addRow]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="New Sale" />

      <div className="p-4">
        <div className="bg-white rounded-xl shadow">

          {/* Form Header */}
          <div className="bg-blue-900 text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
            <h2 className="font-bold text-base">
              📋 Sales Readymade — {editId ? 'EDIT ✏️' : saved ? 'SAVED ✅' : 'ADD'}
            </h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">✓ Party GST: Registered</span>
              <span className="bg-blue-700 px-3 py-1 rounded-full text-xs">FY Amt: ₹{grossAmount.toFixed(2)}</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save F6'}
              </button>
              <button
                onClick={handleNewBill}
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                + New Bill
              </button>
            </div>
          </div>

          {/* Row 1 — Basic Details */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 border-b border-gray-100">
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Series</label>
              <select
                value={form.series}
                onChange={e => setForm({...form, series: e.target.value})}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              >
                <option>CASH SALE</option>
                <option>SONAM TRADERS</option>
                <option>SP SERIES</option>
                <option>SP</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Bill Date</label>
              <input type="date" value={form.vch_date} onChange={e => setForm({...form, vch_date: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Bill No</label>
              <input type="text" value={billNo} readOnly className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-yellow-50 font-bold text-blue-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Payment Days</label>
              <select value={form.payment_days} onChange={e => setForm({...form, payment_days: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                <option value={7}>7 days</option>
                <option value={15}>15 days</option>
                <option value={30}>30 days</option>
                <option value={45}>45 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Due Date</label>
              <input type="date" value={form.due_date} readOnly className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-orange-50 font-semibold text-orange-700" />
            </div>
          </div>

          {/* Row 2 — Party/Cash */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-gray-100">
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">Sale Type</label>
              <div className="flex gap-2">
                <button onClick={() => setSaleType('cash')} className={`flex-1 py-1.5 rounded text-xs font-bold border-2 transition ${saleType === 'cash' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300'}`}>💵 CASH</button>
                <button onClick={() => setSaleType('party')} className={`flex-1 py-1.5 rounded text-xs font-bold border-2 transition ${saleType === 'party' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-300'}`}>👤 PARTY</button>
              </div>
            </div>
            {saleType === 'party' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-blue-700 block mb-1">Select Party (Optional)</label>
                  <select
                    value={form.party_id}
                    onChange={e => handlePartyChange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Manual Entry --</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>{p.party_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-700 block mb-1">Party Name</label>
                  <input
                    type="text"
                    value={form.party_name || ''}
                    onChange={e => setForm({ ...form, party_name: e.target.value, print_name: e.target.value })}
                    placeholder="Enter Party Name"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-700 block mb-1">Print Name</label>
                  <input
                    type="text"
                    value={form.print_name || ''}
                    onChange={e => setForm({ ...form, print_name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}
            {saleType === 'cash' && (
              <div className="flex items-center">
                <span className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-lg text-sm">💵 CASH SALE</span>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-blue-700 block mb-1">From Shop</label>
              <select value={form.from_shop} onChange={e => setForm({...form, from_shop: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                <option>SHOP</option>
                <option>GODOWN</option>
                <option>WAREHOUSE</option>
              </select>
            </div>
          </div>

          {/* Item Entry Grid */}
          <div className="p-4 border-b border-gray-100">
           <div className="flex items-center justify-between mb-3">
  <h3 className="font-bold text-gray-700 text-sm">📦 Item Entry</h3>
  <button onClick={addRow} className="bg-blue-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">+ Add Row (PgDn)</button>
</div>
<div className="overflow-x-auto">
              <table className="w-full text-xs min-w-max">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-3 py-2 text-left w-8">Sr</th>
                    <th className="px-3 py-2 text-left w-44">Design</th>
                    <th className="px-3 py-2 text-left w-36">Description</th>
                    <th className="px-3 py-2 text-left w-28">Size</th>
                    <th className="px-3 py-2 text-center w-16">Qty</th>
                    <th className="px-3 py-2 text-center w-20">Rate</th>
                    <th className="px-3 py-2 text-center w-24">Net Amt</th>
                    <th className="px-3 py-2 text-left w-24">Due Date</th>
                    <th className="px-3 py-2 text-center w-20">Status</th>
                    <th className="px-3 py-2 text-left w-24">Remarks</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-gray-400">{index + 1}</td>

                      {/* Design - searchable + typeable */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          list={`design-list-${index}`}
                          placeholder="Search design..."
                          value={item.description ? (item.design_no ? `${item.design_no} - ${item.description}` : item.description) : ''}
                          onChange={e => {
                            const val = e.target.value;
                            const found = designs.find(d => `${d.design_no} - ${d.design_name}` === val);
                            if (found) {
                              handleDesignChange(index, found.id);
                            } else {
                              const newItems = [...items];
                              newItems[index].description = val;
                              newItems[index].design_id = '';
                              newItems[index].design_no = '';
                              setItems(newItems);
                            }
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        />
                        <datalist id={`design-list-${index}`}>
                          {designs.map(d => (
                            <option key={d.id} value={`${d.design_no} - ${d.design_name}`} />
                          ))}
                        </datalist>
                      </td>

                      {/* Description */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].description = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-gray-50"
                        />
                      </td>

                      {/* Size - searchable + typeable */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          list={`size-list-${index}`}
                          placeholder="Size..."
                          value={item.size_name || ''}
                          onChange={e => {
                            const val = e.target.value;
                            const sizeList = item.availableSizes.length > 0 ? item.availableSizes : sizes;
                            const found = sizeList.find(s => s.size_name === val);
                            if (found) {
                              handleSizeChange(index, found.id);
                            } else {
                              const newItems = [...items];
                              newItems[index].size_name = val;
                              newItems[index].size_id = '';
                              setItems(newItems);
                            }
                          }}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        />
                        <datalist id={`size-list-${index}`}>
                          {(item.availableSizes.length > 0 ? item.availableSizes : sizes).map(s => (
                            <option key={s.id} value={s.size_name} />
                          ))}
                        </datalist>
                      </td>

                      <td className="px-3 py-2">
                        <input type="number" value={item.qty} onChange={e => handleQtyChange(index, e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center focus:outline-none bg-yellow-50" min="0" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.rate} onChange={e => handleRateChange(index, e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center focus:outline-none bg-green-50" min="0" />
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-blue-900 bg-blue-50">
                        ₹{(parseFloat(item.net_amt) || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-orange-600 font-semibold text-xs">{form.due_date}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">UNPAID</span>
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.remarks} onChange={e => { const n=[...items]; n[index].remarks=e.target.value; setItems(n); }} className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" placeholder="Remarks" />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600 font-bold text-base">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Bar */}
            <div className="mt-3 bg-blue-900 text-white rounded-lg px-4 py-2 flex items-center gap-6 text-sm">
              <span>Total Qty: <strong className="text-yellow-300">{totalQty} pcs</strong></span>
              <span>Gross: <strong className="text-yellow-300">₹{grossAmount.toFixed(2)}</strong></span>
              <span className="ml-auto">Total Amount: <strong className="text-xl text-yellow-300">₹{totalAmount.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-4">
            <h4 className="font-bold text-gray-600 text-xs uppercase mb-3">💰 Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded px-3 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">Gross Amount</span>
                <span className="font-bold text-gray-800">₹{grossAmount.toFixed(2)}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Cheque Amount</label>
                <input type="number" value={form.chq_amount} onChange={e => setForm({...form, chq_amount: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-yellow-50" min="0" />
              </div>
              <div className="bg-green-50 rounded px-3 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash Amount</span>
                <span className="font-bold text-green-700">₹{cashAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-blue-900 text-white rounded-lg px-4 py-4 flex justify-between items-center mb-4">
              <span className="font-bold text-lg">BILL AMOUNT</span>
              <span className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Narration</label>
              <input type="text" value={form.narration} onChange={e => setForm({...form, narration: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Optional note..." />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="bg-blue-900 px-4 py-2 rounded-b-xl flex gap-2 flex-wrap">
            <button onClick={() => window.location.href='/bills'} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded">📋 List F2</button>
            <button onClick={() => window.location.href='/masters'} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded">👤 Master F3</button>
            <button onClick={() => { if(window.confirm('Delete this bill?')) { alert('Nothing to delete — bill not saved yet'); } }} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded">🗑 Delete F4</button>
            <button onClick={() => window.location.href='/bills'} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded">✏️ Modify F5</button>
            <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1.5 rounded font-bold disabled:opacity-50">
              {saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save F6'}
            </button>
            <button
              onClick={() => {
                if (!savedId) { alert('Please save the bill first!'); return; }
                window.open(`/invoice/${savedId}`, '_blank');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded"
            >
              🖨 Print F10
            </button>
            <button onClick={handleNewBill} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1.5 rounded font-bold">+ New Bill</button>
            <button onClick={() => window.location.href='/dashboard'} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded">← Back</button>
            <button onClick={() => window.location.href='/dashboard'} className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded">✕ Close F12</button>
          </div>

        </div>
      </div>
    </div>
  );
}