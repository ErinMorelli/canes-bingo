import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, Switch, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { CrudModal, RowActions } from '@admin/elements';
import { AdminCategory as Category, AdminGroup as Group } from '@admin/types';

const { Title } = Typography;

export function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => getData(await apiClient.provide(Api.categories.list, {})).items as Category[],
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['admin', 'groups'],
    queryFn: async () => getData(await apiClient.provide(Api.groups.list, {})).items as Group[],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.provide(Api.categories.delete, { categoryId: String(id) }),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { name: string; label: string; description?: string; groupId?: number; isDefault?: boolean }) =>
      editing
        ? apiClient.provide(Api.categories.update, { categoryId: String(editing.id), ...values })
        : apiClient.provide(Api.categories.create, values),
    onSuccess: () => {
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      invalidate();
    },
    onError: () => message.error('Save failed'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };

  const groupName = (id: number | null) => groups.find((g) => g.id === id)?.name ?? '—';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Label', dataIndex: 'label' },
    { title: 'Group', dataIndex: 'groupId', render: groupName },
    { title: 'Default', dataIndex: 'isDefault', render: (v: boolean) => v ? '✓' : '-' },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: Category) => (
        <RowActions
          onEdit={() => openEdit(record)}
          onDelete={() => deleteMutation.mutate(record.id)}
          deleteLabel="Delete this category?"
        />
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Categories</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Category</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={categories} loading={catsLoading} pagination={false} size="small" />
      <CrudModal
        entity="Category"
        editing={!!editing}
        open={modalOpen}
        isPending={saveMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="camelCaseName" />
          </Form.Item>
          <Form.Item name="label" label="Label" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="groupId" label="Group">
            <Select allowClear placeholder="None" options={groups.map((g) => ({ value: g.id, label: g.label }))} />
          </Form.Item>
          <Form.Item name="isDefault" label="Default for group" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </CrudModal>
    </>
  );
}
