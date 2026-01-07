import { Descriptions, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import strategyApi from "../../api/strategy";

const api = strategyApi;

const renderStatus = (text) => {
    if (text === true) {
        return <Tag color={'green'}>开启</Tag>
    } else {
        return <Tag color={'red'}>关闭</Tag>
    }
}

const StrategyInfo = ({ active, id }) => {
    let [item, setItem] = useState({});

    useEffect(() => {
        const getItem = async (id) => {
            let item = await api.getById(id);
            if (item) {
                setItem(item);
            }
        };
        if (active && id) {
            getItem(id);
        }
    }, [active]);

    return (
        <div className={'page-detail-info'}>
            <Descriptions column={1}>
                <Descriptions.Item label="名称">{item['name']}</Descriptions.Item>

                <Descriptions.Item label="导入下载">{renderStatus(item['importDownload'])}</Descriptions.Item>
                <Descriptions.Item label="导出下载">{renderStatus(item['exportDownload'])}</Descriptions.Item>
                <Descriptions.Item label="审批下载">{renderStatus(item['todoDownload'])}</Descriptions.Item>
                <Descriptions.Item label="抄送下载">{renderStatus(item['sendDownload'])}</Descriptions.Item>
                <Descriptions.Item label="审计下载">{renderStatus(item['applyDownload'])}</Descriptions.Item>
                <Descriptions.Item label="上传">{renderStatus(item['upload'])}</Descriptions.Item>
                <Descriptions.Item label="下载">{renderStatus(item['download'])}</Descriptions.Item>
                <Descriptions.Item label="编辑">{renderStatus(item['edit'])}</Descriptions.Item>
                <Descriptions.Item label="删除">{renderStatus(item['delete'])}</Descriptions.Item>
                <Descriptions.Item label="重命名">{renderStatus(item['rename'])}</Descriptions.Item>
                {/* <Descriptions.Item label="复制">{renderStatus(item['copy'])}</Descriptions.Item>
                <Descriptions.Item label="粘贴">{renderStatus(item['paste'])}</Descriptions.Item> */}
                <Descriptions.Item label="创建时间">{item['created']}</Descriptions.Item>

                <Descriptions.Item label="IP地址">{item['ipGroup']}</Descriptions.Item>
                <Descriptions.Item label="激活">{item['enabled'] ? '✅' : '❌'}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default StrategyInfo;