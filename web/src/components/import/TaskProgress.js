import { Progress, Spin } from "antd";
import React from 'react';

const TaskProgress = ({ percent, title, taskStatusTip, taskStatus, isCanClose, lastOwner, open, handleOk, handleCancel }) => {
    return (
    <div>
        <div>提示信息:{taskStatusTip}</div>
        <Spin spinning={false}>
            <Progress percent={percent} status={taskStatus} />
        </Spin>
    </div>);
};

export default TaskProgress;