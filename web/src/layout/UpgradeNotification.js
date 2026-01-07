import { Button, message, notification, Space } from 'antd';
import React, { useEffect, useRef } from 'react';
import brandingApi from "../api/branding";
import { debugLog } from "../common/logger";
import request from "../common/request";
import { NT_PACKAGE } from "../utils/utils";
let _package = NT_PACKAGE();
const UpgradeNotification = () => {
    const [visible, setVisible] = React.useState(false);
    const [brandingVersion, setBrandingVersion] = React.useState('');
    const [newVersion, setNewVersion] = React.useState('');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const upgradeTimerRef = useRef(null);
    const handleUpgrade = async (isProcessing) => {
        setIsProcessing(isProcessing)
        // 定时器{i18next.t('settings.base.updateButton')}进度
        await request.get('/properties/app/upgrade');
        var upgradeMsg = message.info("新版本提醒", 0);
        upgradeTimerRef.current = setInterval(() => {
            debugLog('  newVersion  ', newVersion);
            if (newVersion === brandingVersion) {
                clearInterval(upgradeTimerRef.current);
                setIsProcessing(false)
                message.success("升级成功", 3);
                upgradeMsg.close();
                window.location.reload();
            }
            checkVersion();
        }, 5000);
    };
    const checkVersion = async () => {
        let branding = await brandingApi.getVersion();
        setBrandingVersion(branding['version'])
        debugLog(' brandingVersion ', branding['version'])
        let result = await request.get('/properties/app/checkVersion');
        if (result['code'] === 1) {
            debugLog(' newversion ', result['data'].version)
            setNewVersion(result['data'].version)
        }
    }
    const close = () => {
        debugLog(
            'Notification was closed. Either the close button was clicked or duration time elapsed.',
        );
    };
    const openNotification = () => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="primary" size="small" loading={isProcessing} onClick={() => { handleUpgrade() }}>
                    升级
                </Button>
                <Button type="primary" size="small" onClick={() => {
                    notification.close(key)
                    setVisible(false)
                }}>
                    稍后提醒
                </Button>
            </Space>
        );
        notification.open({
            message: "发现新版本",
            description: `${newVersion} ${'请尽快升级体验更多功能。'} `,
            btn,
            key,
            onClose: close,
        });
    };

    useEffect(() => {
        checkVersion();
    }, []);
    useEffect(() => {
        debugLog(" visible ", visible)
        debugLog(" newVersion ", newVersion)
        debugLog(" brandingVersion ", brandingVersion)
        if (newVersion !== brandingVersion) {
            openNotification();
        }

    }, [newVersion]);
    return (
        <></>
    );
}

export default UpgradeNotification;