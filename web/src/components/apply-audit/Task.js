import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, message, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import dictDataApi from "../../api/dict-data";
import taskApi from "../../api/task";
import request from "../../common/request";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ExportApplyModal from "../export/ApplyModal";
import ImportApplyModal from "../import/ApplyModal";
import ApplyModal from "./TaskModal";
const { Content } = Layout;
const api = taskApi;
const actionRef = React.createRef();

const Apply = () => {
    let [assetVisible, setAssetVisible] = useState(false);

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
            // console.log(res)
            setTaskStatusOptions(res)
        })
        dictDataApi.list("apply_type").then(res => {
            // console.log(res)
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
            title: '申请名称',
            dataIndex: 'taskName',
        },
        {
            title: '申请描述',
            dataIndex: 'taskDesc',
            hideInSearch: true,
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
            title: '状态',
            dataIndex: 'status',
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
            title: '申请人',
            dataIndex: 'createByName',
            hideInSearch: true,
        },
        {
            title: '审批人',
            dataIndex: 'approverName',
            hideInSearch: true,
        },
        {
            title: '创建时间',
            key: 'createTime',
            dataIndex: 'createTime',
            hideInSearch: true,
        },
        {
            title: '审批意见',
            dataIndex: 'remark',
            hideInSearch: true,
        },
        {
            title: '更新时间',
            key: 'updateTime',
            dataIndex: 'updateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'apply-audit-detail'} key={'apply-audit-detail'}>
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
                        详情
                    </a>
                </Show>,
          
                (storage.applyDownload && <Show menu={'apply-audit-download'} key={'apply-audit-download'}>
                    <a
                        key="run"
                        onClick={() => {
                            // setAssetVisible(true);
                            setSelectedRowKey(record['id']);
                            handleDownload(record)
                        }}
                    >
                        下载
                    </a>
                </Show>),

            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    // 文件下载处理
    const handleDownload = (row) => {
        let name = row.taskName;
        let url = row.attachment;
        if (url !== undefined) {
            let suffix = url.substring(url.lastIndexOf("."), url.length);
            const a = document.createElement('a')
            a.setAttribute('download', name + suffix)
            a.setAttribute('target', '_blank')
            a.setAttribute('href', url)
            a.click()
        } else {
            message.error("下载地址无效")
        }
    }

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
                    status: params.status,
                    sensitiveStatus: params.sensitiveStatus,
                    // delFlag: "0",
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
            headerTitle="申请审计列表"
            toolBarRender={() => [
                <Show menu={'apply-audit-add'}>
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
 
    </Content>);
};

export default Apply;