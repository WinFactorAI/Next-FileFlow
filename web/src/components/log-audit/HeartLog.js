import React, { useState } from 'react';

import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, Modal, Popconfirm, Popover, Table, Tag, Tooltip } from "antd";
import heartLogApi from "../../api/heart-log";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { isEmpty } from "../../utils/utils";

const api = heartLogApi;
const { Content } = Layout;

const actionRef = React.createRef();

const HeartLog = () => {

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
            title: '心跳ID',
            dataIndex: 'id',
            key: 'id'
        },
        {
            title: '终端名称',
            dataIndex: 'deviceName',
            key: 'deviceName'
        },
        {
            title: '设备代码',
            dataIndex: 'authorizationCode',
            key: 'authorizationCode'
        },
        {
            title: '信息',
            dataIndex: 'msg',
            key: 'msg'
        },
        {
            title: '参数',
            dataIndex: 'data',
            key: 'data',
            width: 300,
            render: (_, record) => {
                // 将 JSON 字符串解析为对象
                let formattedJSON = record.data;
                try {
                    const jsonObject = JSON.parse(record.data);
                    formattedJSON = JSON.stringify(jsonObject, null, 2); // 缩进2空格
                } catch (e) {
                    formattedJSON = record.data; // 非 JSON 则原样显示
                }

                const content = (
                    <pre style={{
                        maxHeight: '400px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {formattedJSON}
                    </pre>
                );
                return <Popover content={content} title="参数" trigger="hover">
                    <span style={{ cursor: 'pointer', color: '#1890ff' }} > 查看参数[{formattedJSON.length}]</span>
                </Popover>;
            },
        },
        {
            title: '请求参数',
            dataIndex: 'params',
            key: 'params',
            width: 300,
            render: (_, record) => {
                // 将 JSON 字符串解析为对象
                let formattedJSON = record.params;
                try {
                    const jsonObject = JSON.parse(record.params);
                    formattedJSON = JSON.stringify(jsonObject, null, 2); // 缩进2空格
                } catch (e) {
                    formattedJSON = record.params; // 非 JSON 则原样显示
                }

                const content = (
                    <pre style={{
                        maxHeight: '400px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {formattedJSON}
                    </pre>
                );
                return <Popover content={content} title="请求参数" trigger="hover">
                    <span style={{ cursor: 'pointer', color: '#1890ff' }} > 查看请求参数[{formattedJSON.length}]</span>
                </Popover>;
            },
        },
        {
            title: '请求状态',
            dataIndex: 'state',
            key: 'state',
            hideInSearch: true,
            render: text => {
                if (text === '0') {
                    return <Tag color="error">失败</Tag>
                } else {
                    return <Tag color="success">成功</Tag>
                }
            }
        }, {
            title: '失败原因',
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        }, {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            hideInSearch: true,
        }, {
            title: '浏览器',
            dataIndex: 'userAgent',
            key: 'userAgent',
            hideInSearch: true,
            render: (text, record) => {
                if (isEmpty(text)) {
                    return '未知';
                }
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text.split(' ')[0]}
                    </Tooltip>
                )
            }
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip'
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'heart-log-del'} key={'heart-log-del'}>
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

    return (
        <div>
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
                            id: params.id,
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
                    headerTitle="终端心跳日志"
                    toolBarRender={() => [
                        <Show menu={'heart-log-del'}>
                            <Button key="delete"
                                danger
                                disabled={selectedRowKeys.length === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: '您确定要删除选中的登录日志吗?',
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
                        <Show menu={'heart-log-clear'}>
                            <Button key="clear"
                                type="primary"
                                danger
                                disabled={total === 0}
                                onClick={async () => {
                                    Modal.confirm({
                                        title: '您确定要清空全部的文件登录日志吗?',
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
        </div>
    );
}

export default HeartLog;
