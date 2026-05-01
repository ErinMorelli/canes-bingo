import { Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel: string;
  entityName?: string;
};

export function RowActions({ onEdit, onDelete, deleteLabel, entityName }: Readonly<RowActionsProps>) {
  return (
    <Space>
      <Button
        size="small"
        icon={<EditOutlined />}
        onClick={onEdit}
        aria-label={entityName ? `Edit ${entityName}` : 'Edit'}
      />
      <Popconfirm title={deleteLabel} onConfirm={onDelete}>
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          aria-label={entityName ? `Delete ${entityName}` : 'Delete'}
        />
      </Popconfirm>
    </Space>
  );
}
