import { useCallback, useEffect, useState } from 'react';

type UseHashResult = {
  hash: string;
  updateHash: (newHash: string) => void;
};

export function useHash(): UseHashResult {
  const  [hash, setHash ] = useState(() => window.location.hash);

  const hashChangeHandler = useCallback(() => {
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', hashChangeHandler);
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler);
    };
  }, [hashChangeHandler]);

  const updateHash = useCallback((newHash: string) => {
    if (newHash !== hash) {
      window.location.hash = newHash;
    }
  }, [hash]);

  return {
    hash: hash.slice(1),  // remove #
    updateHash
  };
}
