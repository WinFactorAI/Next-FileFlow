import { Layout, Tabs } from "antd";
import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import SensitiveRuleGroupInfo from "./SensitiveRuleGroupInfo";
import SensitiveRuleGroupList from "./SensitiveRuleGroupList";

const SensitiveRuleGroupDetail = () => {
    let params = useParams();
    const id = params['sensitiveRuleGroupId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({'activeKey': key});
    }

    return (
        <div>
            <Layout.Content className="page-detail-warp">
                <Tabs activeKey={activeKey} onChange={handleTagChange}>
                    <Tabs.TabPane tab="基本信息" key="info">
                        <SensitiveRuleGroupInfo active={activeKey === 'info'} id={id}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="敏感规则" key="list">
                        <SensitiveRuleGroupList active={activeKey === 'list'} id={id}/>
                    </Tabs.TabPane>
                </Tabs>
            </Layout.Content>
        </div>
    );
};

export default SensitiveRuleGroupDetail;