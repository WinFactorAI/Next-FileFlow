import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, Popconfirm, Select, Tag, message } from "antd";
import React, { useEffect, useState } from 'react';
import workerApplyApi from "../../../api/worker/apply";
import workDictDataApi from "../../../api/worker/dict-data";
import request from "../../../common/request";
import ColumnState, { useColumnState } from "../../../hook/column-state";
import ApplyModal from "./ApplyModal";

import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

const { Content } = Layout;
const api = workerApplyApi;
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
        workDictDataApi.list("apply_status").then(res => {
            setApplyStatusOptions(res)
        })
        workDictDataApi.list("disc_status").then(res => {
            setDiscStatusOptions(res)
        })
        getDefaultStorage()
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

                <a
                    key="edit"
                    onClick={() => {
                        setVisible(true);
                        setSelectedRowKey(record['id']);
                    }}
                >
                    {record.status === '1' ? ('编辑') : ('查看')}
                </a>,
                (record.status === "3" && storage.importDownload && <a
                    key="run"
                    onClick={() => {
                        // setAssetVisible(true);
                        setSelectedRowKey(record['id']);
                        handleDownload(record)
                    }}
                >
                    下载
                </a>),
                (record.status === "3" && <Popconfirm
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
                </Popconfirm>)
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
        let fileName = url.substring(url.lastIndexOf("/"), url.length);
        let suffix = fileName.substring(fileName.lastIndexOf("."), fileName.length);
        if (suffix.indexOf(".") !== -1) {
            const a = document.createElement('a')
            a.setAttribute('download', name + suffix)
            a.setAttribute('target', '_blank')
            a.setAttribute('href', url)
            a.click()
        }
        else {
            this.fileLoading = this.$loading({
                lock: true,
                text: "正在压缩文件中...",
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            api.zipDownload({
                "id": row.id,
                "filePath": row.filePath,
                "taskName": row.taskName
            }).then(response => {
                this.fileLoading.close();
                url = response.data;
                fileName = url.substring(url.lastIndexOf("/"), url.length);
                suffix = fileName.substring(fileName.lastIndexOf("."), fileName.length);
                const a = document.createElement('a')
                a.setAttribute('download', name + suffix)
                a.setAttribute('target', '_blank')
                a.setAttribute('href', url)
                a.click()
                this.getList();
            });
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
    return (<Content className="user-page-container">
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
                let result = await workerApplyApi.getPaging(queryParams);
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
            headerTitle="导入申请列表"
            toolBarRender={() => [
                <Button key="button" type="primary" onClick={() => {
                    setVisible(true)
                }}>
                    新建
                </Button>,
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
    </Content>);
};

export default Apply;