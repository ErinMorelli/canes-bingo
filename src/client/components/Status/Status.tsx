import { headerRule } from '@app/themes.ts';
import { Flex } from 'antd';

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
        <div>SCORE</div>
        <div>PATTERN</div>
      </Flex>
    </div>
  );
}
