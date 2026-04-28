import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { PatternField } from '@admin/elements/Pattern';
import { AdminGame as Game, AdminGameRow as GameRow, AdminPattern as Pattern } from '@admin/types';

const { Title } = Typography;

export function GamesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GameRow | null>(null);
  const originalPatterns = useRef<number[]>([]);
  const [form] = Form.useForm();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['admin', 'games'],
    queryFn: async () => {
      const rawGames = getData(await apiClient.provide(Api.games.list, {})).items as Game[];
      return rawGames.map(({ patterns, ...g }) => ({ ...g, patternIds: patterns.map((p) => p.id) }));
    },
  });

  const { data: allPatterns = [] } = useQuery({
    queryKey: ['admin', 'patterns'],
    queryFn: async () => getData(await apiClient.provide(Api.patterns.list, {})).items as Pattern[],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'games'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.provide(Api.games.delete, { gameId: String(id) }),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { name: string; description?: string; isDefault?: boolean; patternIds: number[] }) => {
      const pats = values.patternIds ?? [];
      if (editing) {
        const added = pats.filter((id) => !originalPatterns.current.includes(id));
        const removed = originalPatterns.current.filter((id) => !pats.includes(id));
        return apiClient.provide(Api.games.update, {
          gameId: String(editing.id),
          name: values.name,
          description: values.description,
          isDefault: values.isDefault,
          patterns: { added, removed },
        });
      }
      return apiClient.provide(Api.games.create, {
        name: values.name,
        description: values.description,
        isDefault: values.isDefault,
        patterns: pats,
      });
    },
    onSuccess: () => {
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      invalidate();
    },
    onError: () => message.error('Save failed'),
  });

  const openCreate = () => {
    setEditing(null);
    originalPatterns.current = [];
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (g: GameRow) => {
    setEditing(g);
    originalPatterns.current = g.patternIds;
    form.setFieldsValue({ name: g.name, description: g.description, isDefault: g.isDefault, patternIds: g.patternIds });
    setModalOpen(true);
  };

  const patternLabel = (id: number) => allPatterns.find((p) => p.id === id)?.name ?? String(id);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Description', dataIndex: 'description', render: (v: string | null) => v ?? '' },
    { title: 'Default', dataIndex: 'isDefault', width: 80, render: (v: boolean) => v ? '✓' : '-' },
    {
      title: 'Patterns',
      dataIndex: 'patternIds',
      render: (ids: number[]) => ids.map((id) => patternLabel(id)).join(', ') || '',
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: GameRow) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} aria-label={`Edit ${record.name}`} />
          <Popconfirm title="Delete this game?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label={`Delete ${record.name}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Games</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Game</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={games} loading={isLoading} pagination={false} size="small" />
      <Modal
        title={editing ? 'Edit Game' : 'New Game'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        destroyOnHidden
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="isDefault" label="Default game" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="patternIds" label="Patterns">
            <Select
              mode="multiple"
              placeholder="Select patterns"
              options={allPatterns.map((p) => ({
                value: p.id,
                label: (
                  <Space>
                    {p.name}
                    <PatternField value={p.squares} size={14} />
                  </Space>
                ),
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
