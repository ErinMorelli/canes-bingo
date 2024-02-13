import { PersistGate } from 'redux-persist/integration/react';
import { App as AntApp, Spin } from 'antd';
import { Provider } from 'react-redux';

import config from '@app/store.ts';

import App from './App';

export default function RootApp() {
  return (
    <Provider store={config.store}>
      <PersistGate
        persistor={config.persistor}
        loading={<Spin fullscreen/>}
      >
        <AntApp>
          <App/>
        </AntApp>
      </PersistGate>
    </Provider>
  );
}
