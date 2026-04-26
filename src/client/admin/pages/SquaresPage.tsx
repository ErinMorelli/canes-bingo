import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography, message } from 'antd';
import { BulbOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { AdminCategory as Category, AdminSquareWithCats as SquareWithCats } from '@admin/types';

const { Title } = Typography;

function parseCategoryIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
}

export function SquaresPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SquareWithCats | null>(null);
  const originalCats = useRef<number[]>([]);
  const [form] = Form.useForm();

  const { data: squares = [], isLoading } = useQuery({
    queryKey: ['admin', 'squares'],
    queryFn: async () => {
      const raw = getData(await apiClient.provide(Api.squares.list, {})).items;
      return raw.map((s) => ({ ...s, categoryIds: parseCategoryIds(s.categories) })) as SquareWithCats[];
    },
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => getData(await apiClient.provide(Api.categories.list, {})).items as Category[],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'squares'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.provide(Api.squares.delete, { squareId: String(id) }),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { content: string; description?: string; active: boolean; categoryIds: number[] }) => {
      const cats = values.categoryIds ?? [];
      if (editing) {
        const added = cats.filter((id) => !originalCats.current.includes(id));
        const removed = originalCats.current.filter((id) => !cats.includes(id));
        return apiClient.provide(Api.squares.update, {
          squareId: String(editing.id),
          content: values.content,
          description: values.description,
          active: values.active,
          categories: { added, removed },
        });
      }
      return apiClient.provide(Api.squares.create, {
        content: values.content,
        description: values.description,
        active: values.active,
        categories: cats,
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
    originalCats.current = [];
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalOpen(true);
  };

  const openEdit = (s: SquareWithCats) => {
    setEditing(s);
    originalCats.current = s.categoryIds;
    form.setFieldsValue({ content: s.value, description: s.description, active: s.active, categoryIds: s.categoryIds });
    setModalOpen(true);
  };

  const catLabel = (id: number) => allCategories.find((c) => c.id === id)?.label ?? String(id);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Value', dataIndex: 'value' },
    { title: 'Active', dataIndex: 'active', width: 70, render: (v: boolean) => v ? '✓' : '-' },
    {
      title: 'Categories',
      dataIndex: 'categoryIds',
      render: (ids: number[]) => ids.map((id) => <Tag key={id}>{catLabel(id)}</Tag>),
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: SquareWithCats) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this square?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Squares</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button type="default" icon={<BulbOutlined />} href="https://emorel.li/bingo-suggestions" target="_blank">
            Suggestions
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Square</Button>
        </div>
      </div>
      <Table rowKey="id" columns={columns} dataSource={squares} loading={isLoading} pagination={{ pageSize: 50 }} size="small" />
      <Modal
        title={editing ? 'Edit Square' : 'New Square'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="content" label="Value" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="categoryIds" label="Categories">
            <Select
              mode="multiple"
              placeholder="Select categories"
              options={allCategories.map((c) => ({ value: c.id, label: c.label }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
