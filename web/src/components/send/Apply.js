import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, message, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import applyApi from "../../api/apply";
import dictDataApi from "../../api/dict-data";
import request from "../../common/request";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import ExportApplyModal from "../export/ApplyModal";
import ImportApplyModal from "../import/ApplyModal";
import ApplyModal from "./ApplyModal";
const { Content } = Layout;
const api = applyApi;
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
    const [applyStatusOptions, setApplyStatusOptions] = useState([]);
    const [discStatusOptions, setDiscStatusOptions] = useState([]);
    const [applyTypeOptions, setApplyTypeOptions] = useState([]);
    useEffect(() => {
        dictDataApi.list("sensitive_status").then(res => {
            setSensitiveStatusOptions(res)
        })
        dictDataApi.list("apply_status").then(res => {
            setApplyStatusOptions(res)
        })
        dictDataApi.list("disc_status").then(res => {
            setDiscStatusOptions(res)
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
            title: '任务描述',
            dataIndex: 'taskDesc',
            key: 'content',
            hideInSearch: true
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: (_, record) => {
                const discItem = applyStatusOptions.find(item => item.value === record.status);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {applyStatusOptions.map(item => {
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
            title: '操作人员',
            dataIndex: 'createBy',
            hideInSearch: true
        },
        {
            title: '操作日期',
            dataIndex: 'createTime',
            hideInSearch: true
        },
        {
            title: '所有者',
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true
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
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        查看
                    </a>
                </Show>,
                <Show menu={'send-apply'} key={'todo-apply'}>
                    <a
                        key="scan"
                        onClick={() => {
                            applyApi.sensitiveScan(record.id).then(res => {
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
                <Show menu={'send-apply'} key={'send-apply'}>
                    <a
                        key="apply"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        审批
                    </a>
                </Show>,
                (storage.sendDownload && <Show menu={'send-download'} key={'send-download'}>
                    <a
                        key="run"
                        onClick={() => {
                            setAssetVisible(true);
                            setSelectedRowKey(record['id']);
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
                    taskName: params.taskName,
                    name: params.name,
                    fileName: params.fileName,
                    status: params.status,
                    flag: params.flag,
                    sensitiveStatus: params.sensitiveStatus,
                    notStatus: '0',
                    field: field,
                    order: order
                }
                let result = await api.getSendPaging(queryParams);
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
            headerTitle="抄送申请列表"
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