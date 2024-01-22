import { PersistGate } from 'redux-persist/integration/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { App } from '@components';
import AdminApp from '@app/admin';

import { THEME as theme } from './constants.ts';
import { default as config } from './store';

import './style.scss';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ConfigProvider theme={theme}>
        <Provider store={config.store}>
          <PersistGate
            persistor={config.persistor}
            loading={<Spin fullscreen />}
          >
            <App />
          </PersistGate>
        </Provider>
      </ConfigProvider>
    ),
  },
  {
    path: '/_admin/*',
    element: <AdminApp />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
