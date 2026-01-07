import React, { useEffect, useState } from 'react';

import { Descriptions } from "antd";
import sensitiveRuleGroupApi from "../../api/sensitive-rule-group";

const api = sensitiveRuleGroupApi;

const SensitiveRuleGroupInfo = ({active, id}) => {

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
                <Descriptions.Item label="内容">{item['content']}</Descriptions.Item>
                <Descriptions.Item label="敏感引擎">{item['engine']}</Descriptions.Item>
                <Descriptions.Item label="文件类型">{item['fileExte']}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{item['created']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default SensitiveRuleGroupInfo;