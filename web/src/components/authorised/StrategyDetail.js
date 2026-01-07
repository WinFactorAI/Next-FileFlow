import { Layout, Tabs } from "antd";
import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";
import StrategyInfo from "./StrategyInfo";
import StrategyPolicyUser from "./StrategyPolicyUser";

const StrategyDetail = () => {
    let params = useParams();
    const id = params['strategyId'];
    const [searchParams, setSearchParams] = useSearchParams();
    let key = searchParams.get('activeKey');
    key = key ? key : 'info';

    let [activeKey, setActiveKey] = useState(key);

    const handleTagChange = (key) => {
        setActiveKey(key);
        setSearchParams({ 'activeKey': key });
    }

    return (
        <div>
            <Layout.Content className="page-detail-warp">
                <Tabs activeKey={activeKey} onChange={handleTagChange}>
                    <Tabs.TabPane tab="基本信息" key="info">
                        <StrategyInfo active={activeKey === 'info'} id={id} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="绑定用户" key="bind-user">
                        <StrategyPolicyUser active={activeKey === 'bind-user'} strategyPolicyId={id} />
                    </Tabs.TabPane>
                </Tabs>
            </Layout.Content>
        </div>
    );
};

export default StrategyDetail;