import {
    AppstoreOutlined,
    CodeOutlined,
    DashboardOutlined,
    DesktopOutlined,
    DownOutlined,
    ExportOutlined,
    ImportOutlined,
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Breadcrumb, Button, Dropdown, Layout, Menu, Popconfirm, Space } from "antd";
import React, { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import accountApi from "../api/account";
import Landing from "../components/Landing";
import { setTitle } from "../hook/title";
import { getCurrentUser, isAdmin } from "../service/permission";
import FooterComponent from "./FooterComponent";

const { Header, Content } = Layout;

const breadcrumbNameMap = {
    '/my-import': '我的导入申请',
    '/my-export': '我的导出申请',
    '/my-info': '个人中心',
};

const UserLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();

    let _current = location.pathname.split('/')[1];

    useEffect(() => {
        // console.log('_current', _current);
        setTitle(breadcrumbNameMap['/' + _current]);
    }, [_current]);

    const pathSnippets = location.pathname.split('/').filter(i => i);

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{breadcrumbNameMap[url]}</Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <Link to="/my-import">首页</Link>
        </Breadcrumb.Item>,
    ].concat(extraBreadcrumbItems);

    const menu = (
        <Menu>
            {
                isAdmin() &&
                <Menu.Item>
                    <Link to={'/dashboard'}><DashboardOutlined /> 后台管理</Link>
                </Menu.Item>
            }

            <Menu.Item>
                <Popconfirm
                    key='login-btn-pop'
                    title="您确定要退出登录吗?"
                    onConfirm={async () => {
                        await accountApi.logout();
                        navigate('/login');
                        window.location.reload();
                    }}
                    okText="确定"
                    cancelText="取消"
                    placement="left"
                >
                    <LogoutOutlined /> 退出登录
                </Popconfirm>
            </Menu.Item>

        </Menu>
    );

    const miniMenu = (
        <Menu>
            <Menu.Item>
                <Link to={'/my-import'}> <DesktopOutlined /> 导入申请 </Link>
            </Menu.Item>
            <Menu.Item>
                <Link to={'/my-export'}> <CodeOutlined />  导出申请 </Link>
            </Menu.Item>
            <Menu.Item>
                <Link to={'/my-info'}> <UserOutlined />  个人中心 </Link>
            </Menu.Item>
        </Menu>
    );
    const [isMini, setIsMini] = useState(true);

    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setIsMini(true);
            } else {
                setIsMini(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header style={{ padding: 0 }}>
                <div className={`km-header ${isMini ? 'is-mini' : ''}`}>
                    <div style={{ flex: '1 1 0%', marginLeft: isMini ? '24px' : 'default', }} className="km-header-left">
                        {isMini ? (<Space>
                            <Dropdown overlay={miniMenu}>
                                <Button type="text" style={{ color: 'white', padding: ' 0px' }} icon={<AppstoreOutlined style={{ fontSize: '24px' }} />}> </Button>
                            </Dropdown>
                        </Space>
                        ) : (<Space>
                            <Link to={'/my-import'}>
                                {/* <img src={LogoWithName} alt='logo' width={120} /> */}
                                 <div className="logo-text">FileFlow</div>
                            </Link>

                            <Link to={'/my-import'} className={_current === 'my-import' ? 'user-tab-active' : ''}>
                                <Button type="text" style={{ color: 'white' }}
                                    icon={<ImportOutlined />}>
                                    导入申请
                                </Button>
                            </Link>

                            <Link to={'/my-export'} className={_current === 'my-export' ? 'user-tab-active' : ''}>
                                <Button type="text" style={{ color: 'white' }}
                                    icon={<ExportOutlined />}>
                                    导出申请
                                </Button>
                            </Link>

                            <Link to={'/my-info'} className={_current === 'my-info' ? 'user-tab-active' : ''}>
                                <Button type="text" style={{ color: 'white' }}
                                    icon={<UserOutlined />}>
                                    个人中心
                                </Button>
                            </Link>
                        </Space>)
                        }
                    </div>
                    <div className='km-header-right'>
                        <Dropdown overlay={menu}>
                            <div className={'nickname layout-header-right-item no-selection'}>
                                {getCurrentUser()['nickname']} &nbsp;<DownOutlined />
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </Header>

            <Content className='nt-container'>
                <div style={{ marginBottom: 16 }}>
                    <Breadcrumb>{breadcrumbItems}</Breadcrumb>
                </div>
                <Suspense fallback={<Landing />}>
                    <Outlet />
                </Suspense>
            </Content>
            <FooterComponent />
        </Layout>
    );
}

export default UserLayout;