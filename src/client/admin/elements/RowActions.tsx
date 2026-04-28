import { Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel: string;
};

export function RowActions({ onEdit, onDelete, deleteLabel }: Readonly<RowActionsProps>) {
  return (
    <Space>
      <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
      <Popconfirm title={deleteLabel} onConfirm={onDelete}>
        <Button size="small" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    </Space>
  );
}
