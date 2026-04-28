import { Modal } from 'antd';

type CrudModalProps = {
  entity: string;
  editing: boolean;
  open: boolean;
  isPending: boolean;
  onCancel: () => void;
  onOk: () => void;
  children: React.ReactNode;
};

export function CrudModal({ entity, editing, open, isPending, onCancel, onOk, children }: Readonly<CrudModalProps>) {
  return (
    <Modal
      title={editing ? `Edit ${entity}` : `New ${entity}`}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={isPending}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}
