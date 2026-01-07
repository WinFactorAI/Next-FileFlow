import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import dictDataApi from "../../api/dict-data";
import taskApi from "../../api/task";
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
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [importVisible, setImportVisible] = useState(false);
    let [exportVisible, setExportVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);
    const [applyStatusOptions, setApplyStatusOptions] = useState([]);
    const [discStatusOptions, setDiscStatusOptions] = useState([]);
    const [applyTypeOptions, setApplyTypeOptions] = useState([]);
    const [taskStatusOptions, setTaskStatusOptions] = useState([]);

    useEffect(() => {
        dictDataApi.list("apply_status").then(res => {
            setApplyStatusOptions(res)
        })
        dictDataApi.list("task_status").then(res => {
            setTaskStatusOptions(res)
        })
        dictDataApi.list("disc_status").then(res => {
            setDiscStatusOptions(res)
        })
        dictDataApi.list("apply_type").then(res => {
            setApplyTypeOptions(res)
        })
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
            title: '信息来源',
            dataIndex: 'source',
            hideInSearch: true
        },
        {
            title: '文件大小',
            dataIndex: 'fileSize',
            hideInSearch: true
        },
        {
            title: '文件类型',
            dataIndex: 'fileType',
            hideInSearch: true
        },
        {
            title: '文件类型',
            dataIndex: 'fileType',
            hideInSearch: true
        },

        {
            title: '任务描述',
            dataIndex: 'taskDesc',
            key: 'content',
            hideInSearch: true
        },
        {
            title: '文件',
            dataIndex: 'fileName',
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
            title: '审批意见',
            dataIndex: 'remark',
            hideInSearch: true
        },
        {
            title: '审核人',
            dataIndex: 'nickName',
            hideInSearch: true
        },
        {
            title: '审批时间',
            dataIndex: 'approverTime',
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
                // <Show menu={'command-edit'} key={'command-edit'}>
                //     <a
                //         key="edit"
                //         onClick={() => {
                //             setVisible(true);
                //             setSelectedRowKey(record['id']);
                //         }}
                //     >
                //         编辑
                //     </a>
                // </Show>,
                // <Show menu={'command-change-owner'} key={'command-change-owner'}>
                //     <a
                //         key="change-owner"
                //         onClick={() => {
                //             handleChangeOwner(record);
                //         }}
                //     >
                //         更换所有者
                //     </a>
                // </Show>,
                // <Show menu={'command-del'} key={'command-del'}>
                //     <Popconfirm
                //         key={'confirm-delete'}
                //         title="您确认要删除此行吗?"
                //         onConfirm={async () => {
                //             await api.deleteById(record.id);
                //             actionRef.current.reload();
                //         }}
                //         okText="确认"
                //         cancelText="取消"
                //     >
                //         <a key='delete' className='danger'>删除</a>
                //     </Popconfirm>
                // </Show>,
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
                    flag: params.flag,
                    taskName: params.taskName,
                    fileName: params.fileName,
                    notStatus: "1",
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
            headerTitle="已办申请列表"
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