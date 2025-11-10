import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import StoreGate from '@components';

import Admin from '@app/admin';
import App from '@app/components/App';
import Inventory from '@app/components/Inventory';

import './style.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<StoreGate app={<App />} />} />
      <Route path="/squares" element={<StoreGate app={<Inventory />} />} />
      <Route path="/admin/*" element={<Admin />} />
    </Routes>
  </BrowserRouter>
);
