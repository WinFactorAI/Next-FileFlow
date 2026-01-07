import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, Modal, Popconfirm, Select, Table, Tag } from "antd";
import React, { useState } from 'react';
import alarmLogApi from "../../api/worker/alarm-log";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { formatDate } from "../../utils/utils";

const api = alarmLogApi;
const { Content } = Layout;

const actionRef = React.createRef();

const MyAlarmLog = () => {

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
            title: '接收账号',
            dataIndex: 'username',
            key: 'username'
        },
        // {
        //     title: 'IP',
        //     dataIndex: 'clientIp',
        //     key: 'clientIp',
        //     hideInSearch: true,
        // }, 
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content'
        }, {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
            render: text => {
                if (text === '0') {
                    return <Tag color="error">失败</Tag>
                } else {
                    return <Tag color="success">成功</Tag>
                }
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        allowClear
                        options={[
                            { label: '失败', value: '0' },
                            { label: '成功', value: '1' },
                        ]}
                    >

                    </Select>
                );
            },
        }, {
            title: '原因',
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        }, {
            title: '时间',
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
                <Show menu={'sql-log-del'} key={'sql-log-del'}>
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
        <>
            <Content className='page-container-user border1'>
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
                            content: params.content,
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
                    headerTitle='通知日志'
                    toolBarRender={() => [
                        <Show menu={'sql-log-del'}>
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
                        <Show menu={'sql-log-clear'}>
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
        </>
    );
}

export default MyAlarmLog;
