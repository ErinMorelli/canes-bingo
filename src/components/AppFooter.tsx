import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { GithubFilled, HeartFilled } from '@ant-design/icons';

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
        <div>
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noreferrer nofollow"
            className="license"
            title="Attribution-NonCommercial-ShareAlike 4.0 International"
          >
            <i className="icon-cc"></i>
            <i className="icon-cc-by"></i>
            <i className="icon-cc-nc"></i>
            <i className="icon-cc-sa"></i>
          </a> {new Date().getFullYear()}
        </div>
        <div>
          <span>Made with <HeartFilled /> by <a href="https://erin.dev" target="_blank">Erin Morelli</a></span>
        </div>
      </section>
      <section>
        <div>
          <a
            href="https://github.com/ErinMorelli/canes-bingo"
            target="_blank"
            rel="noreferrer nofollow"
          >
            <GithubFilled /> View on GitHub
          </a>
        </div>
        <div className="version">
          {!version ? (
            <Skeleton.Input size="small" active />
          ) : (
            <a
              href={`https://github.com/ErinMorelli/canes-bingo/commit/${version}`}
              target="_blank"
            >{version}</a>
          )}
        </div>
      </section>
    </>
  )
}
