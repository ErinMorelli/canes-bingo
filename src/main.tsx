import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';

import App from './components/App';
import { THEME as theme } from './constants.ts';
import store from './store';

import './style.scss';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ConfigProvider theme={theme}>
      <App/>
    </ConfigProvider>
  </Provider>
);
