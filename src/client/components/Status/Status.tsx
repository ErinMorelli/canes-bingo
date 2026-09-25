import { Flex } from 'antd';

import { headerRule } from '@app/themes';

import { ActiveGameProvider } from '@context/ActiveGameContext';

import { StatusGame } from './StatusGame';

type StatusProps = {
  themeName: string;
}

export function Status({ themeName }: Readonly<StatusProps>) {
  const borderColor = headerRule[themeName];

  return (
    <div className="status-bar" style={{
      borderTopColor: borderColor,
      borderTopWidth: "2px",
      borderTopStyle: "solid",
    }}>
      <Flex justify="space-between">
        <ActiveGameProvider>
          <StatusGame />
        </ActiveGameProvider>
        <div>PATTERN</div>
      </Flex>
    </div>
  );
}
