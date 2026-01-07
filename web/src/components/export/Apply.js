import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, message, Popconfirm, Select, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import applyApi from "../../api/apply";
import dictDataApi from "../../api/dict-data";
import request from "../../common/request";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import ApplyModal from "./ApplyModal";
import DeviceSelect from "./DeviceSelect";
import TaskProgress from "./TaskProgress";
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

    const [taskStatusTip, setTaskStatusTip] = useState("");
    const [taskStatus, setTaskStatus] = useState("exception");
    const [isCanClose, setIsCanClose] = useState(false);
    const [oldAntiVirusStatus, setOldAntiVirusStatus] = useState(null);
    let [taskProgressVisible, setTaskProgressVisible] = useState(false);
    let [percent, setPercent] = useState(0);
    const [deviceSelectVisible, setDeviceSelectVisible] = useState(false);
    const [deviceKey, setDeviceKey] = useState("")
    const [id, setId] = useState("")
    const [oldBurnStatus, setOldBurnStatus] = useState(null);

    const setBurnTime = (id) => {
        const burnTimer = setInterval(() => {
            applyApi.getById(id).then(response => {
                const data = response.data;
                if (data.discStatus !== oldBurnStatus.current) {
                    setOldBurnStatus(data.discStatus);
                    // 更新状态提示
                    if (data.discStatus === '4') {
                        setTaskStatusTip(prev => prev + "-----4 光盘刻录成功");
                        setTaskStatus('success');
                    } else if (data.discStatus === '5') {
                        setTaskStatusTip(prev => prev + "-----5 光盘刻录失败");
                        setTaskStatus('exception');
                    } else if (data.discStatus === '7') {
                        setPercent(33);
                        setTaskStatusTip("7: 下载文件中");
                    } else if (data.discStatus === '6') {
                        setPercent(66);
                        setTaskStatusTip(prev => prev + "-----6 刻录中");
                    } else if (data.discStatus === '0') {
                        setTaskStatusTip("0: 待插入光盘");
                        setTaskStatus('exception');
                    } else if (data.discStatus === '8') {
                        setTaskStatusTip("8: 光盘状态异常");
                        setTaskStatus('exception');
                    } else if (data.discStatus === '9') {
                        setTaskStatusTip("9: 光盘内存不足");
                        setTaskStatus('exception');
                    }


                    // 处理完成状态
                    if (['0', '4', '5', '8', '9'].includes(data.discStatus)) {
                        setPercent(100);
                        setIsCanClose(true);
                        clearInterval(burnTimer);
                        //   onCancel(); // 关闭模态框
                    }
                }
            });
        }, 5000);
    }
    const burnRun = (row) => {
        applyApi.burn(row).then(response => {
            message.info("开始刻录光盘");
            // console.log(" ###response", response)
            setTaskProgressVisible(true)
            setBurnTime(row.id)
        })
    }
    const handleBurn = (row) => {
        applyApi.getImportDevice().then(response => {
            let devices = response
            if (devices.length === 0) {
                message.error("没有可用终端设备")
                return
            }
            if (devices.length === 1 || deviceKey !== "") {
                if (devices[0].status === "1") {
                    message.error(devices[0].name + "终端状态不可用")
                    return
                }
                row.deviceKey = devices[0].id
                burnRun(row)
            } else if (devices.length > 1) {
                setDeviceSelectVisible(true)
            }
        })
    }


    const [applyStatusOptions, setApplyStatusOptions] = useState([]);
    const [taskProcessStatusOptions, setTaskProcessStatusOptions] = useState([]);
    const [discStatusOptions, setDiscStatusOptions] = useState([]);


    useEffect(() => {
        dictDataApi.list("apply_status").then(res => {
            setApplyStatusOptions(res)
        })
        dictDataApi.list("task_process_status").then(res => {
            setTaskProcessStatusOptions(res)
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
        },
        {
            title: '信息去向',
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
        // {
        //     title: '设备状态',
        //     dataIndex: 'discStatus',
        //     render: (_, record) => {
        //         const discItem = discStatusOptions.find(item => item.value === record.discStatus);
        //         return <Tag color={discItem?.listClass}> {discItem?.label} </Tag>;
        //     },
        //     hideInSearch: true,
        // },
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

                <Show menu={'export-apply-edit'} key={'export-apply-edit'}>
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
                (record.status === "3" &&
                    <>
                        {storage.exportDownload && <Show menu={'export-apply-download'} key={'export-apply-download'}>
                            <a
                                key="edit"
                                onClick={() => {
                                    setSelectedRowKey(record['id']);
                                    handleDownload(record)
                                }}
                            >
                                下载
                            </a>
                        </Show>}
                        <Show menu={'export-apply-burn'} key={'export-apply-burn'}>
                            <a
                                key="edit"
                                onClick={() => {
                                    setSelectedRowKey(record['id']);
                                    handleBurn(record)
                                }}
                            >
                                刻录
                            </a>
                        </Show>
                        <Show menu={'export-apply-finalize'} key={'export-apply-finalize'}>
                            <a
                                key="edit"
                                onClick={() => {
                                    setSelectedRowKey(record['id']);
                                    handleBurn(record)
                                }}
                            >
                                刻录封盘
                            </a>
                        </Show>
                    </>
                ),
                <Show menu={'export-apply-del'} key={'export-apply-del'}>
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
                // <TableDropdown
                //     key="actionGroup"
                //     onSelect={(key) => {
                //         if (key === 'download') {
                //             setSelectedRowKey(record['id']);
                //             handleDownload(record)
                //         }
                //         if (key === 'burn') {
                //             setSelectedRowKey(record['id']);
                //             handleBurn(record)
                //         }
                //         if (key === 'burn-block') {
                //             record['id'].burnType = 'block'
                //             setSelectedRowKey(record['id']);
                //             handleBurn(record)
                //         }
                //     }}
                //     menus={[
                //         { key: 'download', name: '下载', disabled: !isShowBurnButton(record) && !hasMenu('export-apply-exec') },
                //         { key: 'burn', name: '刻录', disabled: !isShowBurnButton(record) && !hasMenu('export-apply-exec') },
                //         { key: 'burn-block', name: '刻录封盘', disabled: !isShowBurnButton(record) && !hasMenu('export-apply-exec') },
                //     ]}
                // />,

            ],
        },
    ];

    const isShowBurnButton = (row) => {
        if (row.status === "3" && row.discStatus !== "4") {
            return true;
        }
        else {
            return false;
        }
    }
    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }
    // 文件下载处理
    const handleDownload = (row) => {
        let name = row.taskName;
        let url = row.attachment;
        let suffix = url.substring(url.lastIndexOf("."), url.length);
        const a = document.createElement('a')
        a.setAttribute('download', name + suffix)
        a.setAttribute('target', '_blank')
        a.setAttribute('href', url)
        a.click()
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
                    flag: 2,
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
            headerTitle="导入申请列表"
            toolBarRender={() => [
                <Show menu={'export-apply-add'}>
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

        <DeviceSelect
            open={deviceSelectVisible}
            handleOk={async (deviceId) => {
                selectedRow.deviceKey = deviceId
                burnRun(selectedRow)
                setDeviceSelectVisible(false);
            }}
            handleCancel={() => {
                setDeviceSelectVisible(false);
            }} />

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
        <TaskProgress
            // lastOwner={selectedRow?.owner}
            title="任务进度"
            taskStatusTip={taskStatusTip}
            isCanClose={isCanClose}
            percent={percent}
            open={taskProgressVisible}
            handleOk={async (owner) => {
                // let success = await api.changeOwner(selectedRow?.id, owner);

            }}
            handleCancel={() => {
                setTaskProgressVisible(false);
            }} />
    </Content>);
};

export default Apply;