import { ProTable } from "@ant-design/pro-components";
import { Badge, Button, Layout, message, Popconfirm, Select, Tooltip } from "antd";
import React, { useState } from 'react';
import dictTypeApi from "../../api/dict-type";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import DictDataDrawer from "./DictDataDrawer";
import ApplyModal from "./DictTypeModal";

const { Content } = Layout;
const api = dictTypeApi;
const actionRef = React.createRef();

const DictType = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '名称',
            dataIndex: 'name',
            allowClear: true,
        }, {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            copyable: true,
            allowClear: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: text => {

                if (text === '0') {
                    return (
                        <Tooltip title='正常'>
                            <Badge status="processing" text='正常' />
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title='不可用'>
                            <Badge status="error" text='不可用' />
                        </Tooltip>
                    )
                }
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select allowClear>
                        <Select.Option value="0">正常</Select.Option>
                        <Select.Option value="1">不可用</Select.Option>
                    </Select>
                );
            },
        },
        {
            title: '创建时间',
            key: 'createTime',
            dataIndex: 'createTime',
            hideInSearch: true,
        },
        {
            title: '备注',
            key: 'remark',
            dataIndex: 'remark',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'dict-type-edit'} key={'dict-type-edit'}>
                    <a
                        key="run"
                        onClick={() => {
                            setAssetVisible(true);
                            setSelectedRowKey(record['type']);
                        }}
                    >
                        选项配置
                    </a>
                </Show>,
                <Show menu={'dict-type-edit'} key={'dict-type-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        编辑
                    </a>
                </Show>,
                <Show menu={'dict-type-del'} key={'dict-type-del'}>
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
                </Show>,
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    return (<Content className="page-container">
        <ProTable
            scroll={{ x: 'max-content' }}
            columns={columns}
            actionRef={actionRef}
            columnsState={{
                value: columnsStateMap,
                onChange: setColumnsStateMap
            }}
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
                    type: params.type,
                    status : params.status,
                    field: field,
                    order: order
                }
                 
                let result = await api.getPaging(queryParams);
                return {
                    data: result['items'],
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
            headerTitle="字典列表"
            toolBarRender={() => [
                <Show menu={'dict-type-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        新建
                    </Button>
                </Show>,
            ]}
        />

        <ApplyModal
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

        <DictDataDrawer
            type={selectedRowKey}
            visible={assetVisible}
            handleCancel={() => {
                setSelectedRowKey(undefined);
                setAssetVisible(false);
            }}
            handleOk={(rows) => {
                if (rows.length === 0) {
                    message.warning('请至少选择一个资产');
                    return;
                }

                let cAssets = rows.map(item => {
                    return {
                        id: item['id'],
                        name: item['name']
                    }
                });

                window.location.href = '#/execute-dict-type?dict-typeId=' + selectedRowKey + '&assets=' + JSON.stringify(cAssets);
            }}
        />

        <ChangeOwner
            lastOwner={selectedRow?.owner}
            open={changeOwnerVisible}
            handleOk={async (owner) => {
                let success = await api.changeOwner(selectedRow?.id, owner);
                if (success) {
                    setChangeOwnerVisible(false);
                    actionRef.current.reload();
                }
            }}
            handleCancel={() => {
                setChangeOwnerVisible(false);
            }}
        />
    </Content>);
};

export default DictType;