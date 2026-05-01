import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';
import { PatternSquare } from '@app/types';

import { PatternInput, PatternField } from '@admin/elements/Pattern';
import { AdminPattern as Pattern } from '@admin/types';

const { Title } = Typography;

export function PatternsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pattern | null>(null);
  const [form] = Form.useForm();

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['admin', 'patterns'],
    queryFn: async () => getData(await apiClient.provide(Api.patterns.list, {})).items as Pattern[],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'patterns'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.provide(Api.patterns.delete, { patternId: String(id) }),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { name: string; squares: PatternSquare[] }) => {
      const squaresJson = JSON.stringify(values.squares ?? []);
      return editing
        ? apiClient.provide(Api.patterns.update, { patternId: String(editing.id), name: values.name, squares: squaresJson })
        : apiClient.provide(Api.patterns.create, { name: values.name, squares: squaresJson });
    },
    onSuccess: () => {
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      invalidate();
    },
    onError: () => message.error('Save failed'),
  });

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: Pattern) => {
    setEditing(p);
    form.setFieldsValue({ name: p.name, squares: p.squares });
    setModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Pattern',
      dataIndex: 'squares',
      render: (squares: PatternSquare[]) => <PatternField value={squares} size={10} />,
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: Pattern) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} aria-label={`Edit ${record.name}`} />
          <Popconfirm title="Delete this pattern?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label={`Delete ${record.name}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Patterns</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Pattern</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={patterns} loading={isLoading} pagination={false} size="small" />
      <Modal
        title={editing ? 'Edit Pattern' : 'New Pattern'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="squares" label="Pattern">
            <PatternInput />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
