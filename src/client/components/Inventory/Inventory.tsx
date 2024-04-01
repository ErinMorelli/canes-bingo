import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Col,
  ConfigProvider,
  Input,
  Layout, Row,
  Space,
  Table,
  TableProps,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useDebounce } from 'use-debounce';

import { Square } from '@app/types.ts';
import { themes } from '@app/themes.ts';
import { fetchAllSquares } from '@app/utils.ts';
import AppFooter from '@app/components/App/AppFooter.tsx';

const { Header, Content, Footer } = Layout;

export function Inventory() {
  const [squares, setSquares] = useState<Array<Square>>([]);
  const [query, setQuery] = useState<string>('');

  const [debouncedQuery] = useDebounce(query, 250);

  useEffect(() => {
    fetchAllSquares().then(setSquares);
  }, []);

  const dataSource = useMemo(
    () => squares
      .filter((s) => {
        return s.value.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(debouncedQuery.toLowerCase());
      })
      .sort((a, b) => {
        const aVal = a.value.replace('"', '').toLowerCase();
        const bVal = b.value.replace('"', '').toLowerCase();
        return aVal > bVal ? 1 : 0;
      }),
    [debouncedQuery, squares]
  );

  const columns: TableProps<Square>['columns'] = [
    {
      title: 'Content',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
  ];

  return (
    <ConfigProvider theme={themes.default}>
      <Layout className="app squares-db">
        <Header>
          <h1>Carolina Hurricanes Bingo</h1>
        </Header>
        <Layout>
          <Content style={{ padding: '20px 80px 40px' }}>
            <Row style={{ paddingBottom: '10px' }}>
              <Col span={24} style={{ textAlign: 'left' }}>
                <Link to="/">
                  <ArrowLeftOutlined /> Back to Bingo Board
                </Link>
              </Col>
            </Row>
            <Row style={{ paddingBottom: '20px' }}>
              <Col
                span={12}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                <h2 style={{ color: 'black' }}>Squares Database</h2>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Space>
                  <Input
                    value={query}
                    onChange={({ target }) => setQuery(target.value)}
                    addonAfter={<SearchOutlined/>}
                    placeholder="Search squares"
                  />
                  <Button
                    type="primary"
                    icon={<BulbOutlined />}
                    href="https://forms.gle/LS87Lr95QDixh9At5"
                    target="_blank">
                    Submit a Square Idea
                  </Button>
                </Space>
              </Col>
            </Row>
            <Row style={{ paddingBottom: '20px' }}>
              <Col span={24}>
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  rowKey="id"
                  rowHoverable={false}
                  loading={!squares.length}
                  pagination={false}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <a href="#root">Back to Top <ArrowUpOutlined /></a>
              </Col>
            </Row>
          </Content>
        </Layout>
        <Footer>
          <AppFooter />
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}