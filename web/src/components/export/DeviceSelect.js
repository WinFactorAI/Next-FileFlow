import { Badge, Modal, Select, Space, Spin } from "antd";
import React, { useState } from 'react';
import { useQuery } from "react-query";
import deviceApi from "../../api/device";

const DeviceSelect = ({lastOwner, open, handleOk, handleCancel}) => {

    let [confirmLoading, setConfirmLoading] = useState(false);
    let [owner, setOwner] = useState(lastOwner);
    let deviceQuery = useQuery('deviceQuery', deviceApi.getAll, {
        enabled: open
    });

    return (<div>
        <Modal title="终端设备"
               confirmLoading={confirmLoading}
               open={open}
               onOk={async () => {
                   setConfirmLoading(true);
                   await handleOk(owner);
                   setConfirmLoading(false);
               }}
               onCancel={handleCancel}
               destroyOnClose={true}
        >
            {/*<Alert style={{marginBottom: `8px`}} message="Informational Notes" type="info" showIcon />*/}

            <Spin spinning={deviceQuery.isLoading}>
                <Select defaultValue={lastOwner}
                        style={{width: `100%`}}
                        onChange={(value) => {
                            setOwner(value);
                        }}>
                    {deviceQuery.data?.map(item => {
                        return <Select.Option key={item.id} value={item.id}> 
                            <Space>
                                {item.name} - 
                                {item.status === "0" ? <Badge status="success" text='在线'/> : <Badge status="error" text='离线'/> }
                            </Space>
                        </Select.Option>
                    })}
                </Select>
            </Spin>
        </Modal>
    </div>);
};

export default DeviceSelect;