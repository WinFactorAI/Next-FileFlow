import {
    AuditOutlined,
    BlockOutlined,
    CloudServerOutlined,
    CodeOutlined,
    ControlOutlined,
    DashboardOutlined,
    DesktopOutlined,
    DisconnectOutlined,
    ExportOutlined,
    FileDoneOutlined,
    FormOutlined,
    HddOutlined,
    ImportOutlined,
    InsuranceOutlined,
    LoginOutlined,
    MonitorOutlined,
    ProductOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
    SettingOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
    UserSwitchOutlined
} from "@ant-design/icons";
import React from "react";

export const routers = [
    {
        key: 'dashboard',
        label: '仪表面板',
        icon: <DashboardOutlined/>,
    },
    {
        key: 'file-apply',
        label: '文件申请',
        icon: <FormOutlined/>,
        children: [
            {
                key: 'import-apply',
                label: '导入申请',
                icon: <ImportOutlined/>,
            },
            {
                key: 'export-apply',
                label: '导出申请',
                icon: <ExportOutlined/>,
            },
        ]
    },
    {
        key: 'office-apply',
        label: '办公管理',
        icon: <CloudServerOutlined/>,
        children: [
            {
                key: 'todo',
                label: '待办申请',
                icon: <AuditOutlined/>,
            },
            {
                key: 'done',
                label: '已办申请',
                icon: <FileDoneOutlined/>,
            },
            {
                key: 'send',
                label: '抄送申请',
                icon: <SendOutlined/>,
            }
        ]
    },
    // {
    //     key: 'resource',
    //     label: '资源管理',
    //     icon: <CloudServerOutlined/>,
    //     children: [
    //         {
    //             key: 'asset',
    //             label: '资产管理',
    //             icon: <DesktopOutlined/>,
    //         },
    //         {
    //             key: 'credential',
    //             label: '授权凭证',
    //             icon: <IdcardOutlined/>,
    //         },
    //         {
    //             key: 'command',
    //             label: '动态指令',
    //             icon: <CodeOutlined/>,
    //         },
    //         {
    //             key: 'access-gateway',
    //             label: '接入网关',
    //             icon: <ApiOutlined/>,
    //         },
    //     ]
    // },
    {
        key: 'session-audit',
        label: '会话审计',
        icon: <AuditOutlined/>,
        children: [
            // {
            //     key: 'online-session',
            //     label: '在线会话',
            //     icon: <LinkOutlined/>,
            // },
            // {
            //     key: 'offline-session',
            //     label: '历史会话',
            //     icon: <DisconnectOutlined/>,
            // },
            {
                key: 'task-process',
                label: '终端任务',
                icon: <DisconnectOutlined/>,
            },
            {
                key: 'apply-audit',
                label: '申请审计',
                icon: <DisconnectOutlined/>,
            },
        ]
    },
    {
        key: 'log-audit',
        label: '日志审计',
        icon: <AuditOutlined/>,
        children: [
            {
                key: 'alarm-log',
                label: '通知日志',
                icon: <LoginOutlined/>,
            },
            {
                key: 'sensitive-log',
                label: '敏感日志',
                icon: <LoginOutlined/>,
            },
            {
                key: 'oper-log',
                label: '操作日志',
                icon: <LoginOutlined/>,
            },
            // {
            //     key: 'storage-log',
            //     label: '文件日志',
            //     icon: <LoginOutlined/>,
            // },
            {
                key: 'heart-log',
                label: '终端心跳',
                icon: <LoginOutlined/>,
            },
            {
                key: 'login-log',
                label: '登录日志',
                icon: <LoginOutlined/>,
            },
        ]
    },
    {
        key: 'ops',
        label: '系统运维',
        icon: <ControlOutlined/>,
        children: [
            {
                key: 'device',
                label: '终端管理',
                icon: <DesktopOutlined/>,
            },
            {
                key: 'sensitive-rule',
                label: '敏感规则',
                icon: <CodeOutlined/>,
            },
            {
                key: 'job',
                label: '计划任务',
                icon: <BlockOutlined/>,
            },
            {
                key: 'dict-type',
                label: '字典管理',
                icon: <ControlOutlined />,
            },
            {
                key: 'storage',
                label: '磁盘空间',
                icon: <HddOutlined/>,
            },
            {
                key: 'monitoring',
                label: '系统监控',
                icon: <MonitorOutlined/>,
            },

        ]
    },
    {
        key: 'security',
        label: '安全策略',
        icon: <SafetyCertificateOutlined/>,
        children: [
            {
                key: 'sensitive-rule-group',
                label: '敏感策略',
                icon: <ProductOutlined />,
            },
            {
                key: 'access-security',
                label: '访问安全',
                icon: <SafetyCertificateOutlined/>,
            },
            {
                key: 'login-policy',
                label: '登录策略',
                icon: <LoginOutlined/>,
            },
            {
                key: 'strategy',
                label: '空间策略',
                icon: <InsuranceOutlined/>,
            },
        ]
    },
    {
        key: 'identity',
        label: '用户管理',
        icon: <UserSwitchOutlined/>,
        children: [
            {
                key: 'user',
                label: '用户管理',
                icon: <UserOutlined/>,
            },
            {
                key: 'role',
                label: '角色管理',
                icon: <SolutionOutlined/>,
            },
            {
                key: 'user-group',
                label: '用户组管理',
                icon: <TeamOutlined/>,
            },
        ]
    },
    // {
    //     key: 'authorised',
    //     label: '授权策略',
    //     icon: <UserSwitchOutlined/>,
    //     children: [
    //         {
    //             key: 'strategy',
    //             label: '授权策略',
    //             icon: <InsuranceOutlined/>,
    //         },
    //     ]
    // },
    {
        key: 'setting',
        label: '系统设置',
        icon: <SettingOutlined/>,
    },
    {
        key: 'info',
        label: '个人中心',
        icon: <UserOutlined />,
    },
]