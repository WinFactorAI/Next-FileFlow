import { Modal, Progress, Spin } from "antd";
import React, { useEffect, useState } from 'react';
import { useQuery } from "react-query";
import userApi from "../../api/user";

const TaskProgress = ({ percent, title,taskStatusTip,isCanClose,lastOwner, open, handleOk, handleCancel }) => {

    let [confirmLoading, setConfirmLoading] = useState(false);
    let [owner, setOwner] = useState(lastOwner);
    let usersQuery = useQuery('usersQuery', userApi.getAll, {
        enabled: open
    });

    let [percentValue, setPercentValue] = useState(percent);
    useEffect(() => {
        setPercentValue(percent)
    }, [percent]);

    return (<div>
        <Modal title={title}
            confirmLoading={confirmLoading}
            open={open}
            onOk={async () => {
                setConfirmLoading(true);
                await handleOk(owner);
                setConfirmLoading(false);
            }}
            onCancel={handleCancel}
            destroyOnClose={true}
            okButtonProps={{
                disabled: true,
            }}
            cancelButtonProps={{
                disabled: true,
            }}
            closable={isCanClose}
            footer={null}
        >
            {/*<Alert style={{marginBottom: `8px`}} message="Informational Notes" type="info" showIcon />*/}
            <div>提示信息:{taskStatusTip}</div>
            <Spin spinning={usersQuery.isLoading}>
                <Progress percent={percentValue} status="active" />
            </Spin>
           
        </Modal>
    </div>);
};

export default TaskProgress;