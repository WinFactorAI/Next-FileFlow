import { ProTable } from "@ant-design/pro-components";
import { Badge, Button, Drawer, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
import React, { useEffect, useState } from 'react';
import dictTypeApi from "../../api/dict-data";

import { PROTOCOL_COLORS } from "../../common/constants";
import Show from "../../dd/fi/show";
import DictDataModal from "./DictDataModal";

const { Title } = Typography;

const actionRef = React.createRef();

const DictDataDrawer = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    type,
}) => {

    let [visibleModal, setVisibleModal] = useState(false);
    let [confirmLoadingModal, setConfirmLoadingModal] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    let [rows, setRows] = useState([]);


    const addRows = (selectedRows) => {
        selectedRows.forEach(selectedRow => {
            let exist = rows.some(row => {
                return row.id === selectedRow.id;
            });
            if (exist === false) {
                rows.push(selectedRow);
            }
        });
        setRows(rows.slice());
    }

    const removeRows = (selectedRows) => {
        selectedRows.forEach(selectedRow => {
            rows = rows.filter(row => row.id !== selectedRow.id);
        });
        setRows(rows.slice());
    }

    const removeRow = (rowKey) => {
        let items = rows.filter(row => row.id !== rowKey);
        setRows(items.slice());
    }

    useEffect(() => {
        // console.log(" visible ", visible);
        // console.log(" type ", type);
        // if (visible) {
        //     actionRef.current.reload();
        // }
        if (visible) {
            actionRef.current.setPageInfo({     // 分页重置
                current: 1,
                pageSize: 10
            });
            actionRef.current.clearSelected();  // 清空选择
            actionRef.current.reload();         // 数据刷新

        }
    }, [type, visible]);

    const columns = [{
        title: '编码',
        dataIndex: 'code',
        key: 'code',
        allowClear: true,
        render: (name, record) => {
            let short = name;
            if (short && short.length > 20) {
                short = short.substring(0, 20) + " ...";
            }
            return (
                <Tooltip placement="topLeft" title={name}>
                    {short}
                </Tooltip>
            );
        }
    },
    {
        title: '标签',
        dataIndex: 'label',
        key: 'label',
        allowClear: true,
        render: (tags, record) => {
            if (tags) {
                return tags.split(',')
                    .filter(tag => tag !== '-')
                    .map(tag => {
                        return <Tag key={tag} color={record.listClass}>{tag}</Tag>;
                    });
            }
            return null;
        },
        // renderFormItem: (item, {type, defaultRender, ...rest}, form) => {
        //     if (type === 'form') {
        //         return null;
        //     }

        //     return (
        //         <Select mode="multiple" allowClear>
        //             {
        //                 tagQuery.data?.map(tag => {
        //                     if (tag === '-') {
        //                         return undefined;
        //                     }
        //                     return <Select.Option color={tagQuery.data} key={tag}>{tag}</Select.Option>
        //                 })
        //             }
        //         </Select>
        //     );
        // },
    },
    {
        title: '键值',
        dataIndex: 'value',
        key: 'value',
        allowClear: true,
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: text => {

            if (text === "0") {
                return (
                    <Tooltip title='正常'>
                        <Badge status="processing" text='正常' />
                    </Tooltip>
                )
            } else {
                return (
                    <Tooltip title='不可用'>
                        <Badge status="error" text='不可用' />
                    </Tooltip>
                )
            }
        },
        renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
            if (type === 'form') {
                return null;
            }

            return (
                <Select allowClear>
                    <Select.Option value="0">正常</Select.Option>
                    <Select.Option value="1">不可用</Select.Option>
                </Select>
            );
        },
    }, {
        title: '顺序',
        dataIndex: 'sort',
        key: 'sort',
        sort: true,
        hideInSearch: true,
    }, {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        hideInSearch: true,
    }, {
        title: '操作',
        valueType: 'option',
        key: 'option',
        render: (text, record, _, action) => [
            <Show menu={'dict-data-edit'} key={'dict-data-edit'}>
                <a
                    key="edit"
                    onClick={() => {
                        setVisibleModal(true);
                        setSelectedRowKey(record['id']);
                    }}
                >
                    编辑
                </a>
            </Show>,
            <Show menu={'dict-data-del'} key={'dict-data-del'}>
                <Popconfirm
                    key={'confirm-delete'}
                    title="您确认要删除此行吗?"
                    onConfirm={async () => {
                        // await api.deleteById(record.id);
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
    const [width, setWidth] = useState('60%');

    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setWidth('100%');
            } else {
                setWidth('60%');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (
        <div>
            <Drawer
                title="字典配置"
                visible={visible}
                width={width}
                centered={true}
                onOk={() => {
                    handleOk(rows);
                }}
                // onCancel={handleCancel}
                closable={true}
                maskClosable={true}
                onClose={() => {
                    handleCancel()
                }}
            >
                <div style={{ paddingLeft: 24, paddingRight: 24 }}>
                    <Title level={5}>选项配置列表</Title>
                    <div>
                        {
                            rows.map(item => {
                                return <Tag color={PROTOCOL_COLORS[item['protocol']]} closable
                                    onClose={() => removeRow(item['id'])}
                                    key={item['id']}>{item['name']}</Tag>
                            })
                        }
                    </div>
                </div>

                <ProTable
                    scroll={{ x: 'max-content' }}
                    columns={columns}
                    actionRef={actionRef}
                    rowSelection={{
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    }}
                    tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
                        <Space size={24}>
                            <span>
                                已选 {selectedRowKeys.length} 项
                            </span>
                            <span>
                                <a onClick={() => addRows(selectedRows)}>
                                    加入待执行列表
                                </a>
                            </span>
                            <span>
                                <a onClick={() => removeRows(selectedRows)}>
                                    从待执行列表移除
                                </a>
                            </span>
                        </Space>
                    )}
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
                            code: params.code,
                            label: params.label,
                            value: params.value,
                            status: params.status,
                            type: type,
                            active: params.active,
                            'tags': params.tags?.join(','),
                            field: field,
                            order: order
                        }
                        let result = await dictTypeApi.getPaging(queryParams);
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
                        pageSize: 5,
                    }}
                    dateFormatter="string"
                    headerTitle="资产列表"
                    toolBarRender={() => [
                        <Show menu={'dict-data-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisibleModal(true)
                            }}>
                                新建
                            </Button>
                        </Show>,
                    ]}
                />
            </Drawer>

            <DictDataModal
                id={selectedRowKey}
                type={type}
                visible={visibleModal}
                confirmLoading={confirmLoadingModal}
                handleCancel={() => {
                    setVisibleModal(false);
                    setSelectedRowKey(undefined);
                }}
                handleOk={async (values) => {
                    setConfirmLoadingModal(true);

                    try {
                        let success;
                        if (values['id']) {
                            success = await dictTypeApi.updateById(values['id'], values);
                        } else {
                            success = await dictTypeApi.create(values);
                        }
                        if (success) {
                            setVisibleModal(false);
                        }
                        actionRef.current.reload();
                    } finally {
                        setConfirmLoadingModal(false);
                    }
                }}
            />
        </div>
    );
};

export default DictDataDrawer;