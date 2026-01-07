import { AppstoreOutlined, DesktopOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Dropdown, Layout, Menu, Popconfirm } from "antd";
import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import accountApi from "../api/account";
import Landing from "../components/Landing";
import { setTitle } from "../hook/title";
import { getCurrentUser } from "../service/permission";
import FooterComponent from "./FooterComponent";
import { routers } from "./router";
import UpgradeNotification from "./UpgradeNotification";
const {Sider, Header} = Layout;

const breadcrumbMatchMap = {
    '/asset/': '资产详情',
    '/user/': '用户详情',
    '/role/': '角色详情',
    '/user-group/': '用户组详情',
    '/login-policy/': '登录策略详情',
    '/command-filter/': '命令过滤器详情',
    '/strategy/': '授权策略详情',
};
const breadcrumbNameMap = {};

routers.forEach(r => {
    if (r.children) {
        r.children.forEach(c => {
            breadcrumbNameMap['/' + c.key] = c.label;
        })
    } else {
        breadcrumbNameMap['/' + r.key] = r.label;
    }
});

const ManagerLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();

    let currentUser = getCurrentUser();

    let userMenus = currentUser['menus'] || [];
    let menus = routers.filter(router => userMenus.includes(router.key)).map(router => {
        if (router.children) {
            router.children = router.children.filter(r => userMenus.includes(r.key));
        }
        return router;
    });

    let [collapsed, setCollapsed] = useState(false);

    let _current = location.pathname.split('/')[1];


    let [current, setCurrent] = useState(_current);
    let [logoText, setLogoText] = useState("FileFlow");
    // let [logo, setLogo] = useState(LogoWithName);
    let [logoWidth, setLogoWidth] = useState(140);
    let [openKeys, setOpenKeys] = useState(JSON.parse(sessionStorage.getItem('openKeys')));

    useEffect(() => {
        setCurrent(_current);
        setTitle(breadcrumbNameMap['/' + _current]);
    }, [_current]);

    const pathSnippets = location.pathname.split('/').filter(i => i);

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        let label = breadcrumbNameMap[url];
        if (!label) {
            for (let k in breadcrumbMatchMap) {
                if (url.includes(k)) {
                    label = breadcrumbMatchMap[k];
                    break;
                }
            }
        }
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{label}</Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <Link to="/">首页</Link>
        </Breadcrumb.Item>,
    ].concat(extraBreadcrumbItems);

    const onCollapse = () => {
        let _collapsed = !collapsed;
        if (_collapsed) {
            setLogoText("FF")
            // setLogo(Logo);
            setLogoWidth(46);
            setCollapsed(_collapsed);
        } else {
            setLogoText("FileFlow")
            // setLogo(LogoWithName);
            setLogoWidth(140);
            setCollapsed(false);
        }
    };

    const subMenuChange = (openKeys) => {
        setOpenKeys(openKeys);
        sessionStorage.setItem('openKeys', JSON.stringify(openKeys));
    }

    const menu = (
        <Menu>
            <Menu.Item>
                <Link to={'/my-import'} ><DesktopOutlined/> 我的申请</Link>
            </Menu.Item>
            {/* <Menu.Item>
                <Link to={'/debug/pprof'}><BugTwoTone/> 硬件客户端</Link>
                <a target='_blank' href={`/debug/pprof/`} rel="noreferrer"></a>
            </Menu.Item> */}
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
                    <LogoutOutlined/> 退出登录
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );

    const [isMini, setIsMini] = useState(true);
    
    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setIsMini(true);
                // document.body.style.overflow = 'hidden';
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
        <Layout className="layout" style={{minHeight: '100vh'}}>
            { (isMini && !collapsed) || !isMini ?  (<Sider
                collapsible
                collapsed={collapsed}
                onCollapse={onCollapse}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 9999,
                }}
            >
                <div className="logo">
                    {/* <img src={logo} alt='logo' width={logoWidth}/> */}
                    <div className="logo-text">{logoText}</div>
                </div>

                <Menu
                    onClick={(e) => {
                        navigate(e.key);
                        setCurrent(e.key);
                    }}
                    selectedKeys={[current]}
                    onOpenChange={subMenuChange}
                    defaultOpenKeys={openKeys}
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['']}
                    items={menus}
                >
                </Menu>
            </Sider>): null}

            <Layout className="site-layout" style={{marginLeft: isMini ? 0 : (collapsed ? 80 : 200)}}>
                <Header style={{padding: 0, height: 60, zIndex: 20}}>
                    <div className='layout-header'>
                        <div className='layout-header-left'>
                            <div style={{"paddingTop": 10}}>
                                {isMini && <Button style={{padding: '0px'}} onClick={onCollapse} type="text" icon={<AppstoreOutlined style={{ fontSize: '24px' }} />}> </Button> }
                                <Breadcrumb className="responsive-breadcrumb"  key={`breadcrumb-`}>{breadcrumbItems}</Breadcrumb>
                            </div>
                        </div>

                        <div className='layout-header-right'>
                            <Dropdown overlay={menu}>
                                <div className='nickname layout-header-right-item no-selection'>
                                    {getCurrentUser()['nickname']} &nbsp;<DownOutlined/>
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </Header>

                <Suspense fallback={<div className={'page-container'}><Landing/></div>}>
                    <Outlet/>
                </Suspense>

                <FooterComponent/>
            </Layout>
            { isMini && !collapsed &&  (
                <div
                className="overlay"
                onClick={() => {
                    setCollapsed(true);
                    document.body.style.overflow = 'auto';
                }} // 点击遮蔽层关闭 Sider
                />
            )}
            <UpgradeNotification/>
        </Layout>
    );
}

export default ManagerLayout;