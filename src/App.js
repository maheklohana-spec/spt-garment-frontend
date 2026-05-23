import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters';
import Sales from './pages/Sales';
import Bills from './pages/Bills';
import Invoice from './pages/Invoice';
import Reports from './pages/Reports';
import Settings from './pages/Settings';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/sales" element={<Sales />} />
<Route path="/sales/edit/:id" element={<Sales />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/invoice/*" element={<Invoice />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;