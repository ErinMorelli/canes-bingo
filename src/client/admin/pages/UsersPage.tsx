import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Popconfirm, Table, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { AdminUser as User } from '@admin/types';

const { Title } = Typography;

export function UsersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => getData(await apiClient.provide(Api.users.list, {})).items as User[],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.provide(Api.users.delete, { userId: String(id) }),
    onSuccess: () => { message.success('Deleted'); invalidate(); },
    onError: () => message.error('Delete failed'),
  });

  const createMutation = useMutation({
    mutationFn: (values: { username: string; password: string }) =>
      apiClient.provide(Api.users.create, values),
    onSuccess: () => {
      message.success('User created');
      setModalOpen(false);
      form.resetFields();
      invalidate();
    },
    onError: () => message.error('Create failed'),
  });

  const handleCreate = (values: { username: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([{ name: 'confirmPassword', errors: ['Passwords do not match'] }]);
      return;
    }
    createMutation.mutate({ username: values.username, password: values.password });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Username', dataIndex: 'username' },
    {
      title: '',
      width: 80,
      render: (_: unknown, record: User) => (
        <Popconfirm title="Delete this user?" onConfirm={() => deleteMutation.mutate(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Users</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          New User
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={users} loading={isLoading} pagination={false} size="small" />
      <Modal
        title="New User"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
