import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { CoffeeOutlined, GithubFilled, HeartFilled } from '@ant-design/icons';

const VERSION_URL = 'https://api.github.com/repos/ErinMorelli/canes-bingo/commits';

async function getAppVersion() {
  try {
    const resp = await fetch(VERSION_URL);
    const commits: Array<{ sha: string }> = await resp.json();
    return commits[0].sha.slice(0, 7);
  } catch {
    return '';
  }
}

export default function AppFooter() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    getAppVersion().then((v) => {
      setVersion(v);
    });
  }, []);

  return (
    <>
      <section>
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
          </a> With <HeartFilled /> from a <a href="https://erin.dev"
                             target="_blank"
                             title="Erin Morelli">huge caniac</a>.
        </span>
        <span className="coffee">
          <CoffeeOutlined /> <a href="https://www.buymeacoffee.com/ErinMorelli"
                             target="_blank"
                             rel="noreferrer nofollow">
            <strong>Buy me a coffee</strong>
          </a>
        </span>
      </section>
      <section>
        <span>
          <GithubFilled/> <a
            href="https://github.com/ErinMorelli/canes-bingo"
            target="_blank"
            rel="noreferrer nofollow"
          >
            View on GitHub
          </a>
        </span>
        <span className="version">
          {!version ? (
            <Skeleton.Input size="small" active/>
          ) : (
            <a
              href={`https://github.com/ErinMorelli/canes-bingo/commit/${version}`}
              target="_blank"
              aria-label={`version ${version}`}
            >{version}</a>
          )}
        </span>
      </section>
    </>
  )
}
