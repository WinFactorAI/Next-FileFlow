import { ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, Layout, Modal, Popconfirm, Table, Tag } from "antd";
import React, { useState } from 'react';
import operLogApi from "../../api/oper-log";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { formatDate } from "../../utils/utils";

const api = operLogApi;
const {Content} = Layout;

const actionRef = React.createRef();

const OperLog = () => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);

 

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'IP',
            dataIndex: 'clientIp',
            key: 'clientIp',
        }, 
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '调用方法',
            dataIndex: 'method',
            key: 'method',
            hideInSearch: true,
        },
        {
            title: '返回状态',
            dataIndex: 'statusCode',
            key: 'statusCode',
            hideInSearch: true,
            render: text => {
                if (text === 1) {
                    return <Tag color="success">成功</Tag>
                } else {
                    return <Tag color="error">失败</Tag>
                }
            }
        },
        {
            title: '调用地址',
            dataIndex: 'path',
            key: 'path'
        },
        {
            title: '浏览器',
            dataIndex: 'userAgent',
            key: 'userAgent',
            hideInSearch: true,
        },         
        {
            title: '原因',
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        },  {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
            render: (text, record) => {
                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        }, 
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'oper-log-del'} key={'oper-log-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title='确认'
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText='确定'
                        cancelText='取消'
                    >
                        <a key='delete' className='danger'>删除</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (
        <ConfigProvider  >
            <Content className="page-container">
                <ProTable
                    scroll={{ x: 'max-content' }}
                    columns={columns}
                    actionRef={actionRef}
                    columnsState={{
                        value: columnsStateMap,
                        onChange: setColumnsStateMap
                    }}
                    rowSelection={{
                        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                        // 注释该行则默认不显示下拉选项
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        selectedRowKeys: selectedRowKeys,
                        onChange: (keys) => {
                            setSelectedRowKeys(keys);
                        }
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
                            username: params.username,
                            clientIp: params.clientIp,
                            path: params.path,
                            name: params.name,
                            method: params.method,
                            state: params.state,
                            field: field,
                            order: order
                        }
                        let result = await api.getPaging(queryParams);
                        setTotal(result['total']);
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
                        pageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle='操作日志'
                    toolBarRender={() => [
                        <Show menu={'oper-log-del'}>
                            <Button key="delete"
                                    danger
                                    disabled={selectedRowKeys.length === 0}
                                    onClick={async () => {
                                        Modal.confirm({
                                            title: '确认删除？',
                                            content: '删除之后无法进行恢复，请慎重考虑。',
                                            okText: '确定',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                await api.deleteById(selectedRowKeys.join(","));
                                                actionRef.current.reload();
                                                setSelectedRowKeys([]);
                                            }
                                        });
                                    }}>
                                删除
                            </Button>
                        </Show>,
                        <Show menu={'oper-log-clear'}>
                            <Button key="clear"
                                    type="primary"
                                    danger
                                    disabled={total === 0}
                                    onClick={async () => {
                                        Modal.confirm({
                                            title: '确认清空操作日志？',
                                            content: '清空之后无法进行恢复，请慎重考虑。',
                                            okText: '确定',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async () => {
                                                await api.Clear();
                                                actionRef.current.reload();
                                            }
                                        });
                                    }}>
                                清空
                            </Button>
                        </Show>,
                    ]}
                />
            </Content>
        </ConfigProvider>
    );
}

export default OperLog;
