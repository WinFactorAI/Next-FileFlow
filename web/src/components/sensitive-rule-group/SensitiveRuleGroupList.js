import { ProTable } from "@ant-design/pro-components";
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import sensitiveRuleGroupMembersApi from "../../api/sensitive-rule-group-members";
import Show from "../../dd/fi/show";

const actionRef = React.createRef();

const SensitiveRuleGroupList = ({active, id}) => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        if (active) {
            actionRef.current.reload();
        }
    }, [active]);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '名称',
            dataIndex: 'name',
            render: ((text, record) => {
                return <Link to={`/user/${record['userId']}`}>{text}</Link>
            })
        },
        // {
        //     title: 'Tag',
        //     dataIndex: 'tag',
        //     hideInSearch: true,
        //     render: (tag) => <Tag>{tag}</Tag>,
        // },
        {	
            title: '规则表达式',
            dataIndex: 'content',
        },
        // {
        //     title: '授权日期',
        //     key: 'created',
        //     dataIndex: 'created',
        //     hideInSearch: true,
        // },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 50,
            render: (text, record, _, action) => [
                <Show menu={'sensitive-rule-group-del'} key={'unbind-acc'}>
                    <a
                        key="unbind"
                        onClick={async () => {
                            await sensitiveRuleGroupMembersApi.deleteById(record['id']);
                            actionRef.current.reload();
                        }}
                    >
                        移除
                    </a>
                </Show>,
            ],
        },
    ];

    return (
        <div>
            <ProTable
                scroll={{ x: 'max-content' }}
                columns={columns}
                actionRef={actionRef}
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
                        ruleName: params.name,
                        ruleContent: params.content,
                        ruleGroupId: id,
                        field: field,
                        order: order
                    }
                    let result = await sensitiveRuleGroupMembersApi.getPaging(queryParams);
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
                headerTitle="绑定的敏感规则列表"
                toolBarRender={() => [
                    // <Show menu={'asset-authorised-user-add'} key={'bind-acc'}>
                    //     <Button key="button" type="primary" onClick={() => {
                    //         setVisible(true);
                    //     }}>
                    //         授权
                    //     </Button>
                    // </Show>
                    // ,
                ]}
            />

 
        </div>
    );
};

export default SensitiveRuleGroupList;