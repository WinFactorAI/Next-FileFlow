import { ProTable } from "@ant-design/pro-components";
import { Badge, Button, Layout, Popconfirm, Select, Tooltip } from "antd";
import React, { useEffect, useState } from 'react';
import deviceApi from "../../api/device";
import dictDataApi from "../../api/dict-data";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import DeviceModal from "./DeviceModal";

const {Content} = Layout;
const api = deviceApi;
const actionRef = React.createRef();

const Device = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);
    const [deviceStatusOptions, setDeviceStatusOptions] = useState([]);
 
    useEffect(() => {
        dictDataApi.list("sys_normal_disable").then(res => {
            // console.log(res)
            setDeviceStatusOptions(res)
        })
 
    }, [])
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        // {
        //     title: '终端ID',
        //     dataIndex: 'id',
        // },
        {
            title: '客户端授权key',
            dataIndex: 'authorizationCode',
        }, 
        {
            title: '终端名称',
            dataIndex: 'name',
        }, 
        // {
        //     title: '编号',
        //     dataIndex: 'code',
        // }, 
        {
            title: '状态',
            dataIndex: 'status',
            // render: (_, record) => {
            //     const discItem = deviceStatusOptions.find(item => item.value === record.status);
            //     return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            // },
            render: (text, record) => {
                if (text==="0") {
                    return (
                        <Tooltip title='在线'>
                            <Badge status="success" text='在线'/>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={record['activeMessage']}>
                            <Badge status="error" text='离线'/>
                        </Tooltip>
                    )
                }
            },
            renderFormItem: (item, {type, defaultRender, ...rest}, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select allowClear>
                        <Select.Option value="1">离线</Select.Option>
                        <Select.Option value="0">在线</Select.Option>
                    </Select>
                );
            },
        }, 

        // {
        //     title: '文件系统',
        //     dataIndex: 'fileSystem',
        // }, 
        {
            title: '设备描述',
            dataIndex: 'remark',
            hideInSearch: true,
        }, 
        {
            title: 'IP地址',
            dataIndex: 'ip',
        },
        {
            title: '审计员',
            dataIndex: 'userName',
            key: 'userName',
            hideInSearch: true
        },    
        // {
        //     title: '所有者',
        //     dataIndex: 'ownerName',
        //     key: 'ownerName',
        //     hideInSearch: true
        // },
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
                <Show menu={'device-edit'} key={'device-edit'}>
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
                <Show menu={'device-change-owner'} key={'device-change-owner'}>
                    <a
                        key="change-owner"
                        onClick={() => {
                            handleChangeOwner(record);
                        }}
                    >
                        更换所有者
                    </a>
                </Show>,
                <Show menu={'device-del'} key={'device-del'}>
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
                    authorizationCode: params.authorizationCode,
                    ip: params.ip,
                    name: params.name,
                    status: params.status,
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
            headerTitle="终端列表"
            toolBarRender={() => [
                <Show menu={'device-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        新建
                    </Button>
                </Show>,
            ]}
        />

        <DeviceModal
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

export default Device;