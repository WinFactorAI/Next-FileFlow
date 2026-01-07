import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, message, Popconfirm, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import dictDataApi from "../../api/dict-data";
import taskProcessApi from "../../api/task-process";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import FileTree from "./FileTree";
import TaskProcessModal from "./TaskProcessModal";
const { Content } = Layout;
const api = taskProcessApi;
const actionRef = React.createRef();

const TaskProcess = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);
    const [taskProcessStatusOptions, setTaskProcessStatusOptions] = useState([]);
    const [discStatusOptions, setDiscStatusOptions] = useState([]);
    const [instructionTypeOptions, setInstructionTypeOptions] = useState([]);
    useEffect(() => {
        dictDataApi.list("task_process_status").then(res => {
            setTaskProcessStatusOptions(res)
        })
        dictDataApi.list("disc_status").then(res => {
            setDiscStatusOptions(res)
        })
        dictDataApi.list("instruction_type").then(res => {
            setInstructionTypeOptions(res)
        })
    }, [])
    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'ID',
            dataIndex: 'id',
            hideInSearch: true,
        },
        {
            title: '指令类型',
            dataIndex: 'type',
            render: (_, record) => {
                const discItem = instructionTypeOptions.find(item => item.value === record.type);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {instructionTypeOptions.map(item => {
                            return <Select.Option value={item['value']}><Tag color={item['listClass']}>{item['label']}</Tag></Select.Option>
                        })}
                    </Select>
                );
            },
        },
        {
            title: '设备名称',
            dataIndex: 'deviceName',
        },
        {
            title: '业务ID',
            dataIndex: 'bussId',
        },
        {
            title: '任务名称',
            dataIndex: 'taskName',
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            render: (_, record) => {
                const discItem = taskProcessStatusOptions.find(item => item.value === record.status);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {taskProcessStatusOptions.map(item => {
                            return <Select.Option value={item['value']}><Tag color={item['listClass']}>{item['label']}</Tag></Select.Option>
                        })}
                    </Select>
                );
            },
        },
        {
            title: '设备状态',
            dataIndex: 'discStatus',
            render: (_, record) => {
                const discItem = discStatusOptions.find(item => item.value === record.discStatus);
                return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
            },
            renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
                if (type === 'form') {
                    return null;
                }
                return (
                    <Select allowClear>
                        {discStatusOptions.map(item => {
                            return <Select.Option value={item['value']}><Tag color={item['listClass']}>{item['label']}</Tag></Select.Option>
                        })}
                    </Select>
                );
            },
        },
        {
            title: '文件大小',
            dataIndex: 'fileSize',
            hideInSearch: true,
        },
        {
            title: '文件目录',
            dataIndex: 'fileList',
            hideInSearch: true,
            width: 360,
            render: (_, record) => {
                // 将 JSON 字符串解析为对象 JSON.parse(data.file_list != null ? data.file_list : [])
                let jsonObjectTree = undefined;
                let formattedJSON = record.fileList;
                try {
                    jsonObjectTree = JSON.parse(record.fileList);
                    const jsonObject = JSON.parse(record.fileList);
                    formattedJSON = JSON.stringify(jsonObject, null, 2); // 缩进2空格
                } catch (e) {
                    formattedJSON = record.fileList; // 非 JSON 则原样显示
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

                return <> {jsonObjectTree && <FileTree data={jsonObjectTree} width={'100%'} />} </>;
            },
        },
        {
            title: '远程目录',
            dataIndex: 'remotePath',
            hideInSearch: true,
        },
        {
            title: '文件路径',
            dataIndex: 'filePath',
            hideInSearch: true,
        },
        {
            title: '创建人',
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

                (record.status === "1" && <Show menu={'task-process-update'} key={'task-process-update'}>
                    <a
                        key="run"
                        onClick={() => {
                            // setAssetVisible(true);
                            setSelectedRowKey(record['id']);
                            handleUpdateStatus(record)
                        }}
                    >
                        状态更新
                    </a>
                </Show>),
                <Show menu={'task-process-del'} key={'task-process-del'}>
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
                </Show>
            ],
        },
    ];

    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }
    const handleUpdateStatus = (row) => {
        const id = row.id;
        api.getById(id).then(response => {
            let form = response.data;
            form.status = "2";
            form.remark = "手动更新状态更新为已完成";
            api.updateById(id, this.form).then(response => {
                message.info("状态更新为已完成");
                actionRef.current.reload();
            });
        });
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
                    type: params.type,
                    deviceName: params.deviceName,
                    bussId: params.bussId,
                    taskName: params.taskName,
                    status: params.status,
                    discStatus: params.discStatus,
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
            headerTitle="终端审计列表"
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

        <TaskProcessModal
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
 
    </Content>);
};

export default TaskProcess;