import React, { useState } from 'react';

import { ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Layout, Popconfirm, Select, Switch } from "antd";
import { Link, useNavigate } from "react-router-dom";
import userGroupApi from "../../api/user-group";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { hasMenu } from "../../service/permission";
import UserGroupModal from "./UserGroupModal";

const api = userGroupApi;
const { Content } = Layout;

const actionRef = React.createRef();

const UserGroup = () => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.USER_GROUP);
    let navigate = useNavigate();

    const columns = [
        // {
        //     dataIndex: 'index',
        //     valueType: 'indexBorder',
        //     width: 48,
        // },
        {
            title: '名称',
            dataIndex: 'name',
            render: (text, record) => {
                let view = <div>{text}</div>;
                if (hasMenu('user-group-detail')) {
                    view = <Link to={`/user-group/${record['id']}`}>{text}</Link>;
                }
                return view;
            },
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            render: (status, record, index) => {
                return <Switch checkedChildren="启用" unCheckedChildren="禁用"
                    checked={status !== 'disabled'}
                    onChange={checked => {
                        handleChangeUserStatus(record['id'], checked, index);
                    }} />
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select allowClear>
                        <Select.Option value="enabled">启用</Select.Option>
                        <Select.Option value="disabled">禁止</Select.Option>
                    </Select>
                );
            },
        },
        {
            title: '顺序',
            key: 'sort',
            dataIndex: 'sort',
            hideInSearch: true,
        },
        {
            title: '创建时间',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'user-group-edit'} key={'user-group-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        编辑
                    </a>
                </Show>
                ,
                <Show menu={'user-group-del'} key={'user-group-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title="您确认要删除此行吗?"
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText="确认"
                        cancelText="取消"
                    >
                        <a key='delete' className='danger'>删除</a>
                    </Popconfirm>
                </Show>
                ,
                <TableDropdown
                    key="actionGroup"
                    onSelect={(key) => {
                        switch (key) {
                            case 'user-group-detail':
                                navigate(`/user-group/${record['id']}?activeKey=info`);
                                break;
                            case 'user-group-authorised-asset':
                                navigate(`/user-group/${record['id']}?activeKey=asset`);
                                break;
                        }
                    }}
                    menus={[
                        { key: 'user-group-detail', name: '详情', disabled: !hasMenu('user-group-detail') },
                        // {key: 'user-group-authorised-asset', name: '授权资产', disabled: !hasMenu('user-group-authorised-asset')},
                    ]}
                />,
            ],
        },
    ];
    const handleChangeUserStatus = async (id, checked, index) => {
        await api.changeStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [allParentKeys,setAllParentKeys] = useState([]);
    // 切换展开/折叠
    const toggleExpand = () => {
        // console.log(allParentKeys);
        setExpandedKeys(prev =>
            prev.length === allParentKeys.length ? [] : allParentKeys
        );
    };
    return (<Content className="page-container">
        <ProTable
            scroll={{ x: 'max-content' }}
            // 配置子节点字段名（默认是 'children'，可省略）
            expandable={{
                expandedRowKeys: expandedKeys,
                childrenColumnName: 'children',
                onExpandedRowsChange: (keys) => setExpandedKeys(keys),
                indentSize: 14  // 缩进宽度
            }}
            columns={columns}
            actionRef={actionRef}
            columnsState={{
                value: columnsStateMap,
                onChange: setColumnsStateMap
            }}
            // dataSource={treeData}
            request={async (params = {}, sort, filter) => {

                let field = '';
                let order = '';
                if (Object.keys(sort).length > 0) {
                    field = Object.keys(sort)[0];
                    order = Object.values(sort)[0];
                }

                let queryParams = {
                    pageIndex: params.current,
                    pageSize: params.pageSize,
                    name: params.name,
                    status : params.status,
                    field: field,
                    order: order
                }
                let result = await api.getPaging(queryParams);
                const convertTreeData = (data) => {
                    return data.map(item => ({
                        name: item.name,  // 将原始字段映射到 name
                        id: item.id,      // 映射到 id
                        status: item.status,
                        sort: item.sort,
                        created: item.created,
                        children: item.subItems ? convertTreeData(item.subItems) : undefined
                    }));
                };
                const getKeys = (data) => {
                    return data.reduce((acc, node) => {
                        if (node.children) {
                            return [...acc, node.id, ...getKeys(node.children)];
                        }
                        return acc;
                    }, []);
                };
                var resultItems = convertTreeData(result['items'])
                setAllParentKeys(getKeys(resultItems))
                return {
                    data: resultItems,
                    success: true,
                    total: result['total']
                };
            }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            pagination={{
                defaultPageSize: 10,
            }}
            dateFormatter="string"
            headerTitle="用户组列表"
            toolBarRender={() => [
                <Show menu={'user-group-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        新建
                    </Button>
                </Show>,
                <Show menu={'user-group-add'}>
                    <Button key="button" type="primary" onClick={toggleExpand}>
                        {expandedKeys.length ? '折叠全部' : '展开全部'}
                    </Button>
                </Show>,
            ]}
        />

        <UserGroupModal
            id={selectedRowKey}
            visible={visible}
            confirmLoading={confirmLoading}
            handleCancel={() => {
                setVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={async (values) => {
                setConfirmLoading(true);

                try {
                    let success;
                    if (values['id']) {
                        success = await api.updateById(values['id'], values);
                    } else {
                        success = await api.create(values);
                    }
                    if (success) {
                        setVisible(false);
                    }
                    actionRef.current.reload();
                } finally {
                    setConfirmLoading(false);
                }
            }}
        />

    </Content>);
}

export default UserGroup;
