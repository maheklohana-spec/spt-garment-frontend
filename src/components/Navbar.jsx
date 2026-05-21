export default function Navbar({ active }) {
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Masters', path: '/masters' },
    { label: 'New Sale', path: '/sales' },
    { label: 'Bills', path: '/bills' },
    { label: 'Reports', path: '/reports' },
      { label: 'Settings', path: '/settings' },

  ];

  return (
    <>
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href='/dashboard'}>
          <span className="text-2xl">👔</span>
          <div>
            <h1 className="font-bold text-lg leading-none">SPT</h1>
            <p className="text-blue-300 text-xs">Welcome back, {JSON.parse(localStorage.getItem('user') || '{}').username}</p>
          </div>
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.href='/'; }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <div className="bg-blue-800 px-6 py-2 flex gap-2 flex-wrap">
        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={() => window.location.href = item.path}
            className={`text-white text-xs px-4 py-2 rounded transition ${active === item.label ? 'bg-blue-600 font-bold' : 'hover:bg-blue-600'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}