import { ReloadOutlined } from "@ant-design/icons";
import { Button, Form, Image, Input, message, Space, Typography } from "antd";
import React, { useState } from 'react';
import { useQuery } from "react-query";
import accountApi from "../api/account";
import MyFileShare from "./worker/MyFileShare";

const {Title} = Typography;

const FileSpace = () => {

    let infoQuery = useQuery('infoQuery', accountApi.getUserInfo);
    let [totp, setTotp] = useState({});

    const resetTOTP = async () => {
        let totp = await accountApi.reloadTotp();
        setTotp(totp);
    }

    const confirmTOTP = async (values) => {
        values['secret'] = totp['secret'];
        let success = await accountApi.confirmTotp(values);
        if (success) {
            message.success('TOTP启用成功');
            await infoQuery.refetch();
            setTotp({});
        }
    }

    const renderBindingTotpPage = (qr) => {
        if (!qr) {
            return undefined;
        }
        return <Form hidden={!totp.qr} onFinish={confirmTOTP}>
            <Form.Item label="二维码"
                       extra={'有效期30秒，在扫描后请尽快输入。推荐使用Google Authenticator, Authy 或者 Microsoft Authenticator。'}>
                <Space size={12} direction='horizontal'>
                    <Image
                        style={{padding: 20}}
                        width={280}
                        src={"data:image/png;base64, " + totp.qr}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined/>}
                        onClick={resetTOTP}
                    >
                        重新加载
                    </Button>
                </Space>
            </Form.Item>
            <Form.Item
                name="totp"
                label="TOTP"
                rules={[
                    {
                        required: true,
                        message: '请输入双因素认证APP中显示的授权码',
                    },
                ]}
            >
                <Input placeholder="请输入双因素认证APP中显示的授权码"/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    确认
                </Button>
            </Form.Item>
        </Form>
    }

    return (
        <div>
            <MyFileShare/>
        </div>
    );
};

export default FileSpace;