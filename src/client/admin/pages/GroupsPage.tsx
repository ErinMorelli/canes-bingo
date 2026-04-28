import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { CrudModal, RowActions } from '@admin/elements';
import { AdminGroup as Group } from '@admin/types';

const { Title } = Typography;

export function GroupsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form] = Form.useForm();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['admin', 'groups'],
    queryFn: async () => getData(await apiClient.provide(Api.groups.list, {})).items as Group[],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'groups'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.provide(Api.groups.delete, { groupId: String(id) }),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { name: string; label: string; description?: string }) =>
      editing
        ? apiClient.provide(Api.groups.update, { groupId: String(editing.id), ...values })
        : apiClient.provide(Api.groups.create, values),
    onSuccess: () => {
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      invalidate();
    },
    onError: () => message.error('Save failed'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (g: Group) => { setEditing(g); form.setFieldsValue(g); setModalOpen(true); };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Label', dataIndex: 'label' },
    { title: 'Description', dataIndex: 'description', render: (v: string | null) => v ?? '' },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: Group) => (
        <RowActions
          onEdit={() => openEdit(record)}
          onDelete={() => deleteMutation.mutate(record.id)}
          deleteLabel="Delete this group?"
          entityName={record.name}
        />
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Groups</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Group</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={groups} loading={isLoading} pagination={false} size="small" />
      <CrudModal
        entity="Group"
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
        </Form>
      </CrudModal>
    </>
  );
}
