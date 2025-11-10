import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { App as AntApp, Spin } from 'antd';

import config from '@app/store.ts';

type StoreGateProps = {
  app: React.ReactNode;
}

export default function StoreGate({ app }: StoreGateProps) {
  return (
    <Provider store={config.store}>
      <PersistGate persistor={config.persistor} loading={<Spin fullscreen/>}>
        <AntApp>{app}</AntApp>
      </PersistGate>
    </Provider>
  );
}
