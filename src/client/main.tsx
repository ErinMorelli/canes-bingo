import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import RootApp from '@components';
import AdminApp from '@app/admin';
import { Inventory } from '@app/components/Inventory';

import './style.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootApp />} />
      <Route path="/squares" element={<Inventory />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  </BrowserRouter>
);
