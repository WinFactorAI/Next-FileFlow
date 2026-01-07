import { ProTable } from "@ant-design/pro-components";
import { Button, Drawer } from "antd";
import React, { useEffect, useState } from 'react';
import jobApi from "../../api/job";

const actionRef = React.createRef();

const JobLog = ({
                    visible,
                    handleCancel,
                    id,
                }) => {

    let [loading, setLoading] = useState(false);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '执行时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            hideInSearch: true,
            sorter: true,
        },
        {
            title: '日志',
            dataIndex: 'message',
            key: 'message',
            hideInSearch: true,
            valueType: 'code',
        }
    ]
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
                title={'计划任务日志'}
                placement="right"
                width={width}
                closable={true}
                maskClosable={true}
                onClose={handleCancel}
                open={visible}
            >
                {visible ?
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
                                name: params.name,
                                field: field,
                                order: order
                            }
                            let result = await jobApi.getLogPaging(id, queryParams);
                            let items = result['items'];

                            return {
                                data: items,
                                success: true,
                                total: result['total']
                            };
                        }}
                        rowKey="id"
                        search={false}
                        pagination={{
                            defaultPageSize: 5,
                            pageSizeOptions: [5, 10, 20, 50, 100],
                            showSizeChanger: true,
                        }}
                        dateFormatter="string"
                        headerTitle="计划任务日志"
                        toolBarRender={() => [
                            <Button
                                key="button"
                                type="primary"
                                loading={loading}
                                danger
                                onClick={async () => {
                                    setLoading(true);
                                    await jobApi.deleteLogByJobId(id);
                                    actionRef.current.reload();
                                    setLoading(false);
                                }}
                            >
                                清空
                            </Button>,
                        ]}
                    /> : undefined}

            </Drawer>
        </div>
    );
};

export default JobLog;