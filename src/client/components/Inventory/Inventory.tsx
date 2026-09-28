import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfigProvider, Flex, Input, Layout, Spin } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useDebounce } from 'use-debounce';

import { useConfig, useMediaQuery, useSquareCategories, useSubmit } from '@hooks';

import { BP_COMPACT, BP_WIDE, ConfigKey } from '@app/constants';
import { Square } from '@app/types';
import { fetchAllSquares, fetchConfigValue } from '@app/utils';

import { SubmitSquare } from '@components/Submit';

import { InventoryFooter } from './InventoryFooter';

const { Header, Content, Footer } = Layout;

/** Sort key that ignores a leading quote, so `"Mercy!"` files under M. */
function sortKey(square: Square) {
  return square.value.replaceAll('"', '').toLowerCase();
}

export function Inventory() {
  const { theme } = useConfig();
  const { open: openSubmit } = useSubmit();

  const [squares, setSquares] = useState<Array<Square>>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>('');
  const [activeChip, setActiveChip] = useState<string>('all');
  const [headerText, setHeaderText] = useState<string>();
  const [customClass, setCustomClass] = useState<string>();

  const [debouncedQuery] = useDebounce(query, 250);

  // The header collapses to a back arrow and a short wordmark on phones; the
  // list becomes a table only once there is room for three columns.
  const isCompact = useMediaQuery(`(max-width: ${BP_COMPACT}px)`);
  const isTable = useMediaQuery(`(min-width: ${BP_WIDE}px)`);

  const themeClass = useMemo(() => theme.customClass, [theme]);

  useEffect(() => {
    fetchAllSquares()
      .then(setSquares)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConfigValue(ConfigKey.HeaderText).then(setHeaderText);
  }, []);

  useEffect(() => {
    fetchConfigValue(ConfigKey.CustomClass).then((serverClass) => {
      setCustomClass([serverClass, themeClass].filter(Boolean).join(' ') || undefined);
    });
  }, [themeClass]);

  /** Only active squares are in the pool, so only those belong on the page. */
  const pool = useMemo(
    () => squares.filter((s) => s.active).sort((a, b) => sortKey(a).localeCompare(sortKey(b))),
    [squares]
  );

  const { chips, categoriesFor } = useSquareCategories(pool);

  const chip = useMemo(
    () => chips.find((c) => c.key === activeChip) ?? chips[0],
    [chips, activeChip]
  );

  const results = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return pool
      .filter((s) => chip?.matches(s) ?? true)
      .filter((s) =>
        !needle ||
        s.value.toLowerCase().includes(needle) ||
        (s.description ?? '').toLowerCase().includes(needle)
      );
  }, [pool, chip, debouncedQuery]);

  const countText = useMemo(() => {
    const n = results.length;
    return `${n} ${n === 1 ? 'square' : 'squares'}`;
  }, [results.length]);

  /**
   * A square's labels, ordered: *when* it is eligible (location, broadcast)
   * first, then *who* it is about (players, broadcasters). They all render as
   * the same filled chip, so the split only decides reading order.
   */
  const labelsFor = (square: Square) => {
    const all = categoriesFor(square);
    const when = all.filter((c) => c.group === 'location' || c.group === 'broadcast');
    return [...when, ...all.filter((c) => !when.includes(c))];
  };

  const search = (
    <Input
      className="db-search"
      value={query}
      onChange={({ target }) => setQuery(target.value)}
      prefix={<SearchOutlined />}
      placeholder="Search squares"
      allowClear
      aria-label="Search squares"
    />
  );

  const chipRow = (
    /*
      A real <fieldset> rather than role="group": the native element carries
      that role, and its <legend> is the accessible name, so the grouping is
      announced even where the ARIA attribute is not honoured. The legend is
      visually hidden because the design has no heading here.

      The fieldset wraps the row rather than being it. `.db-chips` is a flex
      container that scrolls horizontally on phones, and fieldset is a
      long-standing problem case for exactly those two properties — it has
      its own anonymous rendering box. Keeping it a plain block wrapper and
      leaving the flex and the overflow on an ordinary div means the layout
      is byte-for-byte what it was, and only the semantics changed.
    */
    <fieldset className="db-chips-group">
      <legend className="sr-only">Filter by category</legend>
      <div className="db-chips">
      {chips.map((c) => (
        <button
          type="button"
          key={c.key}
          className={`db-chip${c.key === chip?.key ? ' selected' : ''}`}
          aria-pressed={c.key === chip?.key}
          onClick={() => setActiveChip(c.key)}>
          {c.label}
        </button>
      ))}
      </div>
    </fieldset>
  );

  return (
    <ConfigProvider theme={theme.config}>
      <div className={['app-shell', customClass].filter(Boolean).join(' ')}>
        <Layout className="app squares-db">
          <Header>
            <Flex className="header" justify="space-between" align="center">
              <div className="header-title">
                {isCompact ? (
                  <>
                    <span>Squares </span>
                    <span className="end">Database</span>
                  </>
                ) : (
                  <>
                    <span>{headerText}</span>
                    <span className="end"> Bingo</span>
                  </>
                )}
              </div>
              <div className="header-right">
                <Link className="db-back" to="/">
                  <ArrowLeftOutlined />
                  {!isCompact && <span>Back to my card</span>}
                </Link>
                {!isCompact && (
                  <button type="button" className="db-submit" onClick={openSubmit}>
                    Submit a Square
                  </button>
                )}
              </div>
            </Flex>
          </Header>
          <Content>
            {!isCompact && (
            <div className="db-intro">
              <div className="db-intro-inner">
                <div className="db-intro-copy">
                  <h1 className="db-title">Squares Database</h1>
                  <p className="db-subtitle">
                    Every possible bingo square, and what it means.
                    Check here before you submit an idea.
                  </p>
                </div>
                {search}
              </div>
            </div>
            )}
            <div className="db-body">
              {isCompact && <div className="db-search-row">{search}</div>}
              <div className="db-filters">
                {chipRow}
                <span className="db-count">{countText}</span>
              </div>

              <Spin size="large" spinning={loading}>
                {isTable ? (
                  <div className="db-table" role="table">
                    <div className="db-table-head" role="row">
                      <span role="columnheader">Square</span>
                      <span role="columnheader">What it means</span>
                      <span role="columnheader">Category</span>
                    </div>
                    {results.map((s) => (
                      <div className="db-row" role="row" key={s.id}>
                        <span className="db-value" role="cell">{s.value}</span>
                        <span className="db-meaning" role="cell">{s.description}</span>
                        {/* All of a square's labels share the last column:
                            under the name they crowded it, and they all answer
                            the same question about a square. */}
                        <div className="db-row-labels" role="cell">
                          {labelsFor(s).map((l) => (
                            <span className="db-label" key={l.id}>{l.label}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="db-cards">
                    {results.map((s) => {
                      const labels = labelsFor(s);
                      return (
                        <div className="db-card" key={s.id}>
                          <span className="db-value">{s.value}</span>
                          <span className="db-meaning">{s.description}</span>
                          {labels.length > 0 && (
                            <div className="db-card-labels">
                              {labels.map((l) => (
                                <span className="db-label" key={l.id}>{l.label}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <p className="db-empty">
                    No squares match that. Try a different search or category.
                  </p>
                )}
              </Spin>

            </div>
          </Content>
          <Footer>
            <InventoryFooter isCompact={isCompact} />
          </Footer>
        </Layout>
        <SubmitSquare />
      </div>
    </ConfigProvider>
  );
}
