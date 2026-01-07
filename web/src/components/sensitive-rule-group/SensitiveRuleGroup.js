import { ProTable } from "@ant-design/pro-components";
import { Button, Layout, notification, Popconfirm, Switch } from "antd";
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import sensitiveRuleGroupApi from "../../api/sensitive-rule-group";
import Show from "../../dd/fi/show";
import ColumnState, { useColumnState } from "../../hook/column-state";
import ChangeOwner from "../asset/ChangeOwner";
import SensitiveRuleGroupModal from "./SensitiveRuleGroupModal";

const { Content } = Layout;
const api = sensitiveRuleGroupApi;
const actionRef = React.createRef();
function downloadImportExampleCsv() {
    let csvString = 'name,content';
    //前置的"\uFEFF"为“零宽不换行空格”，可处理中文乱码问题
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=gb2312;' });
    let a = document.createElement('a');
    a.download = 'sample.csv';
    a.href = URL.createObjectURL(blob);
    a.click();
}

const importExampleContent = <>
    <a onClick={downloadImportExampleCsv}>下载示例</a>
    <div>导入敏感策略</div>
</>
const SensitiveRuleGroup = () => {
    let [assetVisible, setAssetVisible] = useState(false);

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.CREDENTIAL);

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [changeOwnerVisible, setChangeOwnerVisible] = useState(false);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '名称',
            dataIndex: 'name',
            copyable: true,
        }, {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (status, record, index) => {
                return <Switch checkedChildren="启用" unCheckedChildren="禁用"
                    checked={status !== 'disabled'}
                    onChange={checked => {
                        handleChangeStatus(record['id'], checked, index);
                    }} />
            }
        },
        // {
        //     title: '所有者',
        //     dataIndex: 'ownerName',
        //     key: 'ownerName',
        //     hideInSearch: true
        // },
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
                <Show menu={'sensitive-rule-group-detail'} key={'sensitive-rule-group-get'}>
                    <Link key="get" to={`/sensitive-rule-group/${record['id']}?activeKey=info`}>详情</Link>
                </Show>,
                <Show menu={'sensitive-rule-group-detail'} key={'sensitive-rule-group-get'}>
                    <Link key="get" to={`/sensitive-rule-group/${record['id']}?activeKey=list`}>敏感规则</Link>
                </Show>,
                <Show menu={'sensitive-rule-group-edit'} key={'sensitive-rule-group-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        编辑
                    </a>
                </Show>,
                <Show menu={'sensitive-rule-group-del'} key={'sensitive-rule-group-del'}>
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
    const handleChangeStatus = async (id, checked, index) => {
        await api.changeStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }
    const handleChangeOwner = (row) => {
        setSelectedRow(row);
        setChangeOwnerVisible(true);
    }

    const handleImportSensitiveRule = async (file) => {

        let [success, data] = await api.importSensitiveRule(file);
        if (success === false) {
            notification['error']({
                message: '导入动态命令失败',
                description: data,
            });
            return false;
        }

        let successCount = data['successCount'];
        let errorCount = data['errorCount'];
        if (errorCount === 0) {
            notification['success']({
                message: '导入动态命令成功',
                description: '共导入成功' + successCount + '条动态命令。',
            });
        } else {
            notification['info']({
                message: '导入动态命令完成',
                description: `共导入成功${successCount}条动态命令，失败${errorCount}条动态命令。`,
            });
        }
        actionRef.current.reload();
        return false;
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
                    name: params.name,
                    content: params.content,
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
            headerTitle="敏感策略列表"
            toolBarRender={() => [
                <Show menu={'sensitive-rule-group-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        新建
                    </Button>
                </Show>,
                // <Show menu={'asset-import'}>
                //     <Popover content={importExampleContent}>
                //         <Upload
                //             maxCount={1}
                //             beforeUpload={handleImportSensitiveRule}
                //             showUploadList={false}
                //         >
                //             <Button key='import'>导入</Button>
                //         </Upload>
                //     </Popover>
                // </Show>,
            ]}
        />

        <SensitiveRuleGroupModal
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

export default SensitiveRuleGroup;