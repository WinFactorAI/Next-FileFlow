import { ProTable } from "@ant-design/pro-components";
import { Button, Col, ConfigProvider, Layout, Modal, Popconfirm, Row, Table, Typography } from "antd";
import React, { useEffect, useRef, useState } from 'react';
import sensitiveLogApi from "../../api/sensitive-log";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import { formatDate } from "../../utils/utils";

const api = sensitiveLogApi;
const { Content } = Layout;
const { Title } = Typography;
const actionRef = React.createRef();

const SensitiveLog = ({
    batchId,
    loading,
    onReload
}) => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);

    const timerRef = useRef(null);
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);
    useEffect(() => {
        if(loading){
            timerRef.current = setInterval(async () => {
                await api.getByBatchId(batchId).then(res => {
                    // console.log(" res ", res)
                    if (res.length > 0) {
                        actionRef.current.reload();
                        clearTimeout(timerRef.current);
                        onReload()
                    }
                    // timerRef.current = null; // 清除引用
                })
            }, 2000);
        } else {
            actionRef.current.reload();
            clearTimeout(timerRef.current);
        }
    }, [batchId, loading]);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },

        {
            title: '敏感规则',
            dataIndex: 'sensitiveRulesName',
            key: 'sensitiveRulesName',
            hideInSearch: true,
        },
        // {
        //     title: '敏感规则策略',
        //     dataIndex: 'sensitiveRuleGroupsName',
        //     key: 'sensitiveRuleGroupsName',
        //     hideInSearch: true,
        // }, 
        // {
        //     title: '批次ID',
        //     dataIndex: 'batchId',
        //     key: 'batchId'
        // },
        {
            title: '文件',
            dataIndex: 'fileName',
            key: 'fileName'
        },
        {
            title: '扫描结果',
            dataIndex: 'msg',
            key: 'msg',
            hideInSearch: true,
        },
        {
            title: '路径',
            dataIndex: 'filePath',
            key: 'filePath'
        },
        // {
        //     title: '类型',
        //     dataIndex: 'type',
        //     key: 'type',
        //     hideInSearch: true,
        // },
        {
            title: '大小',
            dataIndex: 'size',
            key: 'size',
            hideInSearch: true,
        },
        {
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
                <Show menu={'sensitive-log-del'} key={'sensitive-log-del'}>
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
            <Content>
                <div style={{ marginTop: '.5em' }}>
                    <Row justify="space-around" align="middle" gutter={[12, 12]}>
                        <Col xs={24} sm={24} md={24} key={1}>
                            <Title level={4}>结果</Title>
                        </Col>

                    </Row>
                </div>
                <ProTable
                    scroll={{ x: 'max-content' }}
                    className="ant-card-bordered"
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
                            batchId: params.batchId,
                            fileName: params.fileName,
                            filePath: params.filePath,
                            state: params.state,
                            type: "test",
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
                    headerTitle='敏感扫描日志'
                    toolBarRender={() => [
                        <Show menu={'sensitive-log-del'}>
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
                        <Show menu={'sensitive-log-clear'}>
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
                                            await api.clearByType("test");
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

export default SensitiveLog;
