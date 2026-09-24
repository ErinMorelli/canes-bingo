import {
  AppstoreFilled,
  HeartFilled,
  PlusCircleOutlined
} from '@ant-design/icons';

import { Button, ConfigProvider } from 'antd';

import { footerButtonTheme, footerMuted } from '@app/themes';

type AppFooterProps = {
  readonly themeName: string;
}

export default function AppFooter({ themeName }: AppFooterProps) {
  const color = footerMuted[themeName];
  return (
    <ConfigProvider theme={footerButtonTheme[themeName]}>
      <div className="footer" style={{ color }}>
        <div className="footer-buttons">
          <Button size="small" icon={<AppstoreFilled />}>Squares Database</Button>
          <Button size="small" icon={<PlusCircleOutlined />}>Submit a Square</Button>
        </div>
        <div className="credits">
          Made with <HeartFilled aria-label="love" /> by a <a
            href="https://erin.dev"
            target="_blank"
            aria-label="huge caniac"
            style={{ color }}
            title="Erin Morelli">huge caniac</a> · <a
            href="https://www.buymeacoffee.com/ErinMorelli"
            target="_blank"
            style={{ color }}
            rel="noreferrer nofollow">Buy me a coffee</a>
        </div>
        <div className="disclaimer">
          This is an unofficial fan site, not affiliated with the Carolina Hurricanes or the NHL. Carolina Hurricanes and the team logo are trademarks of the Carolina Hurricanes Hockey Club. The Stanley Cup word mark and image are registered trademarks of the National Hockey League.
        </div>
      </div>
    </ConfigProvider>
  );
}
