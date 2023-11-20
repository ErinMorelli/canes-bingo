import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider, ThemeConfig } from 'antd';

import App from './components/App';
import store from './store';
import './style.scss';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#C81025',
  },
  components: {
    Button: {
      colorPrimary: '#000000'
    }
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ConfigProvider theme={theme}>
      <App/>
    </ConfigProvider>
  </Provider>
);
