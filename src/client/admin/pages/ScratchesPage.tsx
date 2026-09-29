import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Flex,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';

import { apiClient, getData } from '@app/api';
import { ConfigKey, Group } from '@app/constants';
import { Api } from '@app/api-endpoints';
import { parseScratchList } from '@app/utils';
import { fetchSchedule, selectTodaysGame } from '@app/nhl';
import type { Category } from '@app/types';

const { Title, Text, Paragraph } = Typography;

/** The two rosters worth scratching: the players and the broadcast crew. */
const ROSTER_GROUPS: { name: string; heading: string }[] = [
  { name: Group.PLAYERS, heading: 'Players' },
  { name: Group.BALLY, heading: 'Broadcast crew' },
];

export function ScratchesPage() {
  const qc = useQueryClient();

  const { data: configItems = [], isLoading: configLoading, isError: configError } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: async () => getData(await apiClient.provide(Api.config.list, {})).items,
  });

  const { data: groupItems = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['admin', 'groups'],
    queryFn: async () => getData(await apiClient.provide(Api.groups.list, {})).items,
  });

  /*
    The same schedule the app itself reads, so the game this list is pinned to
    is the game players will be watching. Without it there is nothing to scope
    to and the list cannot safely be published at all.
  */
  const { data: game, isLoading: scheduleLoading, isError: scheduleError } = useQuery({
    queryKey: ['admin', 'nhl', 'schedule'],
    queryFn: fetchSchedule,
    select: (schedule) => selectTodaysGame(schedule),
  });

  const storedRow = configItems.find((item) => item.key === ConfigKey.Scratches);
  const stored = useMemo(() => parseScratchList(storedRow?.value), [storedRow]);

  const [checked, setChecked] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  /*
    Seeded once, and only from a list published for *this* game. A list left
    over from the previous game is ignored here for the same reason the app
    ignores it: it describes a night that has already happened.
  */
  useEffect(() => {
    if (loaded || configLoading || scheduleLoading) return;
    const applies = stored && game && stored.gameId === game.id;
    setChecked(applies ? stored.ids : []);
    setLoaded(true);
  }, [loaded, configLoading, scheduleLoading, stored, game]);

  const rosters = useMemo(
    () =>
      ROSTER_GROUPS.map(({ name, heading }) => ({
        heading,
        categories: ((groupItems.find((g) => g.name === name)?.categories ?? []) as Category[])
          .slice()
          .sort((a, b) => a.label.localeCompare(b.label)),
      })).filter((roster) => roster.categories.length),
    [groupItems]
  );

  const save = useMutation({
    mutationFn: async (ids: number[]) => {
      if (!game) throw new Error('No game scheduled to pin this list to');

      // Empty means "nobody is out", which the client treats as nothing
      // published — so it is stored as an empty string rather than a list of
      // none, and the two cannot drift apart.
      const value = ids.length ? JSON.stringify({ gameId: game.id, ids }) : '';

      /*
        `updateConfigByKey` runs an UPDATE and then re-reads by key, so it
        404s when the row does not exist yet. The key is created on first
        save instead of being seeded by hand.
      */
      const body = { key: ConfigKey.Scratches, value };
      const result = storedRow
        ? await apiClient.provide(Api.config.update, { configId: ConfigKey.Scratches, ...body })
        : await apiClient.provide(Api.config.create, body);
      return getData(result);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'config'] }),
    onSuccess: () => message.success('Scratches published'),
    onError: (err) => message.error(err instanceof Error ? err.message : 'Failed to publish'),
  });

  if (configLoading || groupsLoading || scheduleLoading) return <Spin />;
  if (configError) return <Alert type="error" message="Failed to load config" />;

  const toggle = (id: number) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const publishedForAnotherGame = stored && game && stored.gameId !== game.id;

  return (
    <>
      <Title level={4} style={{ marginBottom: 8 }}>Tonight&apos;s Scratches</Title>
      <Paragraph type="secondary" style={{ maxWidth: 620 }}>
        Anyone ticked here is left off every card dealt for this game. Players can
        still change it for themselves — this sets the starting point, not a rule.
      </Paragraph>

      {scheduleError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Could not reach the NHL schedule"
          description="A list has to be pinned to a game, so publishing is unavailable until the schedule loads."
        />
      )}

      {!scheduleError && !game && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="No game scheduled"
          description="There is nothing to pin a list to right now."
        />
      )}

      {game && (
        <Space style={{ marginBottom: 16 }}>
          <Text strong>
            {game.awayTeam.abbrev} @ {game.homeTeam.abbrev}
          </Text>
          <Text type="secondary">{game.gameDate}</Text>
          <Tag>game {game.id}</Tag>
        </Space>
      )}

      {publishedForAnotherGame && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="The saved list belongs to an earlier game"
          description="It is already being ignored by the app. Publishing here replaces it."
        />
      )}

      {rosters.length === 0 ? (
        <Empty description="No player or broadcaster categories found" />
      ) : (
        <Flex gap={48} wrap>
          {rosters.map((roster) => (
            <div key={roster.heading}>
              <Title level={5}>{roster.heading}</Title>
              <Flex orientation="vertical" gap={8}>
                {roster.categories.map((category) => (
                  <Checkbox
                    key={category.id}
                    checked={checked.includes(category.id)}
                    onChange={() => toggle(category.id)}>
                    {category.label}
                  </Checkbox>
                ))}
              </Flex>
            </div>
          ))}
        </Flex>
      )}

      <Space style={{ marginTop: 24 }}>
        <Button
          type="primary"
          disabled={!game}
          loading={save.isPending}
          onClick={() => save.mutate(checked)}>
          Publish {checked.length > 0 && `(${checked.length})`}
        </Button>
        <Button
          disabled={!game || checked.length === 0}
          onClick={() => { setChecked([]); save.mutate([]); }}>
          Clear
        </Button>
      </Space>
    </>
  );
}
