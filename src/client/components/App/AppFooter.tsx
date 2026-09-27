import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const color = footerMuted[themeName];

  return (
    <ConfigProvider theme={footerButtonTheme[themeName]}>
      <div className="footer" style={{ color }}>
        <div className="footer-buttons">
          {/* Height is set in SCSS — the design wants 40px desktop / 38px
              mobile, and neither matches an antd size step. */}
          <Button
            onClick={() => navigate('/squares')}
            icon={<AppstoreFilled />}>
            Squares Database
          </Button>
          <Button icon={<PlusCircleOutlined />}>
            Submit a Square
          </Button>
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
        {/* The design carries a shorter disclaimer on phones. Swapped in CSS
            rather than by measuring the viewport, matching how the header
            already switches its wordmark — and `display: none` keeps the
            hidden one out of the accessibility tree, so it is not read twice. */}
        <div className="disclaimer">
          <span className="full">
            This is an unofficial fan site, not affiliated with the Carolina Hurricanes or the NHL. Carolina Hurricanes and the team logo are trademarks of the Carolina Hurricanes Hockey Club. The Stanley Cup word mark and image are registered trademarks of the National Hockey League.
          </span>
          <span className="short">
            Unofficial fan site · not affiliated with the Carolina Hurricanes or the NHL
          </span>
        </div>
      </div>
    </ConfigProvider>
  );
}
