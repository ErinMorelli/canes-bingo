import { CoffeeOutlined, HeartFilled } from '@ant-design/icons';

export default function AppFooter() {
  return (
    <>
      <span>
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noreferrer nofollow"
          className="license"
          aria-label="Attribution-NonCommercial-ShareAlike 4.0 International"
          title="Attribution-NonCommercial-ShareAlike 4.0 International"
        >
          <i className="icon-cc"></i>
          <i className="icon-cc-by"></i>
          <i className="icon-cc-nc"></i>
          <i className="icon-cc-sa"></i>
        </a> With <HeartFilled /> from a <a
          href="https://erin.dev"
          target="_blank"
          title="Erin Morelli">huge caniac</a>.
      </span>
      <span className="coffee">
        <CoffeeOutlined/> <a
          href="https://www.buymeacoffee.com/ErinMorelli"
          target="_blank"
          rel="noreferrer nofollow">Buy me a coffee</a>.
      </span>
    </>
  );
}
