import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Space } from 'antd';
import {
  AppstoreOutlined,
  TagsOutlined,
  FolderOutlined,
  BuildOutlined,
  TrophyOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  LinkOutlined,
} from '@ant-design/icons';

import { useAuth } from '@admin/context/auth';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: 'config',     label: 'Config',     icon: <SettingOutlined /> },
  { key: 'squares',    label: 'Squares',    icon: <AppstoreOutlined /> },
  { key: 'categories', label: 'Categories', icon: <TagsOutlined /> },
  { key: 'groups',     label: 'Groups',     icon: <FolderOutlined /> },
  { key: 'patterns',   label: 'Patterns',   icon: <BuildOutlined /> },
  { key: 'games',      label: 'Games',      icon: <TrophyOutlined /> },
  { key: 'users',      label: 'Users',      icon: <TeamOutlined /> },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const selectedKey = location.pathname.replace('/admin/', '').split('/')[0] || 'squares';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Text strong style={{ color: '#fff', fontSize: 14 }}>Canes Bingo</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(`/admin/${key}`)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '0 16px' }}>
          <Space>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>{user?.username}</Text>
            <Button
              type="text"
              icon={<LinkOutlined />}
              href="/"
              target="_blank"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: '#141414' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
