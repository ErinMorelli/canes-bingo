import { CoffeeOutlined, HeartFilled } from '@ant-design/icons';

export default function AppFooter() {
  return (
    <>
      <span>
        Made with <HeartFilled aria-label="love" /> by a <a
          href="https://erin.dev"
          target="_blank"
          aria-label="huge caniac"
          title="Erin Morelli">huge caniac</a>.
      </span>
      <span>
        <CoffeeOutlined aria-hidden /> <a
          href="https://www.buymeacoffee.com/ErinMorelli"
          target="_blank"
          rel="noreferrer nofollow">Buy me a coffee</a> to support future development.
      </span>
      <span className="disclaimer">
        bingo.svech.net is an unofficial fan site and not affiliated in any way with the Carolina Hurricanes.<br/>
        Carolina Hurricanes and team logo are trademark of the <a
        href="https://www.nhl.com/hurricanes"
        target="_blank"
        rel="noreferrer nofollow">Carolina Hurricanes Hockey Club</a>.<br/>{' '}<br />
        The word mark and image of the Stanley Cup are registered trademarks of the <a
        href="https://www.nhl.com"
        target="_blank"
        rel="noreferrer nofollow">National Hockey League</a>.
      </span>
    </>
);
}
