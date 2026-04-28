import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Row,
  Spin,
  Typography,
  message,
} from 'antd';

import { apiClient, getData } from '@app/api';
import { ConfigKey } from '@app/constants';
import { Api } from '@app/api-endpoints';

const { Title } = Typography;

const CONFIG_FIELDS: { key: ConfigKey; label: string; help?: string }[] = [
  { key: ConfigKey.HeaderText,    label: 'Header Text',      help: 'Text displayed in the page header' },
  { key: ConfigKey.FreeSpace,     label: 'Free Space Label', help: 'Text for the center free square' },
  { key: ConfigKey.CustomClass,   label: 'Custom CSS Class', help: 'Extra class applied to the app root' },
  { key: ConfigKey.Theme,         label: 'Default Theme',    help: 'Default UI theme name' },
  { key: ConfigKey.FestiveLights, label: 'Festive Lights',   help: '"on" or "off"' },
];

export function ConfigPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm();

  const { data: configItems = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: async () => getData(await apiClient.provide(Api.config.list, {})).items,
  });

  useEffect(() => {
    if (configItems.length && !form.isFieldsTouched()) {
      form.setFieldsValue(Object.fromEntries(configItems.map((i) => [i.key, i.value])));
    }
  }, [configItems, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const original = Object.fromEntries(configItems.map((i) => [i.key, i.value]));
      const changed = CONFIG_FIELDS.filter(({ key }) => values[key] !== original[key]);
      const results = await Promise.allSettled(
        changed.map(({ key }) =>
          apiClient.provide(Api.config.update, { configId: key, key, value: values[key] ?? '' }).then(getData)
        )
      );
      const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (failed.length > 0) throw new Error(`${failed.length} config update(s) failed`);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'config'] }),
    onSuccess: () => message.success('Config saved'),
    onError: (err) => message.error(err instanceof Error ? err.message : 'Failed to save config'),
  });

  if (isLoading) return <Spin />;
  if (isError) return <Alert type="error" message="Failed to load config" />;

  return (
    <>
      <Title level={4} style={{ marginBottom: 24 }}>Config</Title>
      <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
        <Row wrap gutter={[24, 24]}>
          {CONFIG_FIELDS.map(({ key, label, help }) => (
            <Col span={8} key={key}>
              <Form.Item name={key} label={label} help={help}>
                <Input />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <div style={{ marginTop: 24 }}>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>Save</Button>
          </Form.Item>
        </div>
      </Form>
    </>
  );
}
