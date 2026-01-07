import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, message, Popconfirm, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import applyApi from "../../api/apply";
import dictDataApi from "../../api/dict-data";
import taskApi from "../../api/task";
import request from "../../common/request";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import ExportApplyModal from "../export/ApplyModal";
import ImportApplyModal from "../import/ApplyModal";
import ApplyModal from "./TaskModal";
const { Content } = Layout;
const api = taskApi;
const actionRef = React.createRef();

const Apply = () => {
    let [statusVisible, setStatusVisible] = useState(false);
    const [storage, setStorage] = useState({});
    let [visible, setVisible] = useState(false);
    let [importVisible, setImportVisible] = useState(false);
    let [exportVisible, setExportVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

    const [sensitiveStatusOptions, setSensitiveStatusOptions] = useState([]);
    const [taskStatusOptions, setTaskStatusOptions] = useState([]);
    const [applyTypeOptions, setApplyTypeOptions] = useState([]);
    useEffect(() => {
        dictDataApi.list("sensitive_status").then(res => {
            setSensitiveStatusOptions(res)
        })
        dictDataApi.list("task_status").then(res => {
            setTaskStatusOptions(res)
        })
        dictDataApi.list("apply_type").then(res => {
            setApplyTypeOptions(res)
        })
        getDefaultStorage();
    }, [])
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '申请类型',
            dataIndex: 'flag',
            render: (_, record) => {
                const discItem = applyTypeOptions.find(item => item.value === record.flag);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {applyTypeOptions.map(item => {
                            return <Select.Option value={item['value']}><Tag color={item['listClass']}>{item['label']}</Tag></Select.Option>
                        })}
                    </Select>
                );
            },
        },
        {
            title: '申请名称',
            dataIndex: 'taskName',
        },

        {
            title: '来源/去向',
            dataIndex: 'source',
            hideInSearch: true,
        },
        {
            title: '文件大小',
            dataIndex: 'fileSize',
            hideInSearch: true,
        },
        {
            title: '文件类型',
            dataIndex: 'fileType',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            hideInSearch: true,
            render: (_, record) => {
                const discItem = taskStatusOptions.find(item => item.value === record.status);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {taskStatusOptions.map(item => {
                            return <Select.Option value={item['value']}><Tag color={item['listClass']}>{item['label']}</Tag></Select.Option>
                        })}
                    </Select>
                );
            },
        },
        {
            title: '敏感扫描状态',
            dataIndex: 'sensitiveStatus',
            render: (_, record) => {
                const discItem = sensitiveStatusOptions.find(item => item.value === record.sensitiveStatus);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {sensitiveStatusOptions.map(item => {
                            return <Select.Option value={item['value']}><Tag color={item['listClass']}>{item['label']}</Tag></Select.Option>
                        })}
                    </Select>
                );
            },
        },

        {
            title: '任务描述',
            dataIndex: 'taskDesc',
            key: 'taskDesc',
            hideInSearch: true,
        },
        {
            title: '文件',
            dataIndex: 'fileName',
        },
        {
            title: '申请人',
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true
        },
        {
            title: '创建时间',
            key: 'createTime',
            dataIndex: 'createTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'send-detail'} key={'send-detail'}>
                    <a
                        key="view"
                        onClick={() => {
                            if (record.flag === "1") {
                                setImportVisible(true)
                            } else {
                                setExportVisible(true)
                            }
                            // setVisible(true);
                            setSelectedRowKey(record['applyId']);
                        }}
                    >
                        查看
                    </a>
                </Show>,
                <Show menu={'todo-apply'} key={'todo-apply'}>
                    <a
                        key="scan"
                        onClick={() => {
                            applyApi.sensitiveScan(record.applyId).then(res => {
                                if (res) {
                                    message.success("敏感扫描任务已提交。请等待扫描结果。");
                                }

                                actionRef.current.reload();
                            })
                        }}
                    >
                        敏感扫描
                    </a>
                </Show>,
                <Show menu={'todo-apply'} key={'todo-apply'}>
                    <a
                        key="run"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        审批
                    </a>
                </Show>,
                (storage.todoDownload && <Show menu={'todo-download'} key={'todo-download'}>
                    <a
                        key="edit"
                        onClick={() => {
                            handleDownload(record);
                        }}
                    >
                        下载
                    </a>
                </Show>),
                <Show menu={'todo-revoke'} key={'todo-revoke'}>

                    <Popconfirm
                        key={'confirm-delete'}
                        title="您确认要撤销此行吗?"
                        onConfirm={async () => {
                            await api.revoke(record.id);
                            actionRef.current.reload();
                        }}
                        okText="确认"
                        cancelText="取消"
                    >
                        <a key='delete' className='danger'>撤销</a>
                    </Popconfirm>
                </Show>,

            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }
    const [loading, setLoading] = useState(false);
    const handleDownload = async (row) => {
        const { taskName, attachment, id, filePath } = row;
        const fileName = attachment?.substring(attachment.lastIndexOf("/")) || '';
        const suffix = fileName.substring(fileName.lastIndexOf("."));

        // 直接下载情况
        if (suffix.includes(".")) {
            const a = document.createElement('a');
            a.download = `${taskName}${suffix}`;
            a.href = attachment;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        // 需要压缩下载情况
        try {
            setLoading(true);
            const response = await api.zipDownload({
                id,
                filePath,
                taskName
            });

            const zipUrl = response.data;
            const zipFileName = zipUrl.substring(zipUrl.lastIndexOf("/"));
            const zipSuffix = zipFileName.substring(zipFileName.lastIndexOf("."));

            const a = document.createElement('a');
            a.download = `${taskName}${zipSuffix}`;
            a.href = zipUrl;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // 调用更新列表方法（根据实际场景调整）
            // await getList(); 
        } catch (error) {
            message.error('文件下载失败');
            console.error('Download error:', error);
        } finally {
            setLoading(false);
        }
    };
    const getDefaultStorage = async () => {
        let result = await request.get(`/account/storage`);
        if (result.code !== 1) {
            message.error(result['message']);
            return;
        }
        setStorage(result['data'])
    }
    return (<Content className="page-container">
        <ProTable
            scroll={{ x: 'max-content' }}
            spinning={loading}
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
                    flag: params.flag,
                    taskName: params.taskName,
                    fileName: params.fileName,
                    sensitiveStatus: params.sensitiveStatus,
                    status: "1",
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
            headerTitle="代审批申请列表"
            toolBarRender={() => [
                <Show menu={'command-add'}>
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
                    let success = await api.approval(values['id'], values);
                    if (success) {
                        message.success("审批提交成功!")
                        setVisible(false);
                    }
                    actionRef.current.reload();
                } finally {
                    setConfirmLoading(false);
                }
            }}
        />


        <ImportApplyModal
            id={selectedRowKey}
            visible={importVisible}
            confirmLoading={confirmLoading}
            handleCancel={() => {
                setImportVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={async (values) => {

            }}
        />

        <ExportApplyModal
            id={selectedRowKey}
            visible={exportVisible}
            confirmLoading={confirmLoading}
            handleCancel={() => {
                setExportVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={async (values) => {

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

export default Apply;