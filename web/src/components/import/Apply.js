import { ProTable } from "@ant-design/pro-components";
import { Button, DatePicker, Layout, message, Popconfirm, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import applyApi from "../../api/apply";
import dictDataApi from "../../api/dict-data";
import request from "../../common/request";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import ApplyModal from "./ApplyModal";
const { RangePicker } = DatePicker;

const { Content } = Layout;
const api = applyApi;
const actionRef = React.createRef();

const Apply = () => {
    let [assetVisible, setAssetVisible] = useState(false);
    const [storage, setStorage] = useState({});
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);
    const [applyStatusOptions, setApplyStatusOptions] = useState([]);
    const [discStatusOptions, setDiscStatusOptions] = useState([]);

    useEffect(() => {
        dictDataApi.list("apply_status").then(res => {
            setApplyStatusOptions(res)
        })
        dictDataApi.list("disc_status").then(res => {
            setDiscStatusOptions(res)
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
            allowClear: true,
        },
        {
            title: '信息来源',
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
            title: '申请描述',
            dataIndex: 'taskDesc',
            hideInSearch: true,
        },
        {
            title: '文件',
            dataIndex: 'fileName',
            allowClear: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            allowClear: true,
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
            title: '终端状态',
            dataIndex: 'discStatus',
            hideInSearch: true,
            render: (_, record) => {
                const discItem = discStatusOptions.find(item => item.value === record.discStatus);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
        },

        {
            title: '所有者',
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            hideInSearch: true
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
                <Show menu={'import-apply-edit'} key={'import-apply-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        {record.status === '1' ? ('编辑') : ('查看')}
                    </a>
                </Show>,
                (storage.importDownload && <Show menu={'import-apply-download'} key={'import-apply-download'}>
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
                <Show menu={'import-apply-del'} key={'import-apply-del'}>
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
                    fileName: params.fileName,
                    status: params.status,
                    flag: 1,
                    notStatus: '0',
                    delFlag: '0',
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
            headerTitle="导出申请列表"
            toolBarRender={() => [
                <Show menu={'import-apply-add'}>
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
                actionRef.current.reload();
                setVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={async (values) => {
                setConfirmLoading(true);
                // console.log(" values ", values);
                try {
                    let success;
                    if (values['id']) {
                        success = await api.updateById(values['id'], values);
                    } else {
                        success = await api.create(values);
                    }
                    if (success) {
                        actionRef.current.reload();
                        // setVisible(false);
                        return success;
                    }
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

export default Apply;