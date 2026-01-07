import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, message, Modal, Typography } from "antd";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import brandingApi from "../api/branding";
import request from "../common/request";
import PromptModal from "../dd/prompt-modal/prompt-modal";
import bgImage from '../images/login/bg.png';
import docx from '../images/login/docx.png';
import pdf from '../images/login/pdf.png';
import xlsx from '../images/login/xls.png';
import zip from '../images/login/zip.png';

import FooterComponent from "../layout/FooterComponent";
import { setCurrentUser } from "../service/permission";
import strings from "../utils/strings";
import { setToken } from "../utils/utils";
import './Login.css';

const {Title, Text} = Typography;

const LoginForm = () => {

    const navigate = useNavigate();

    let [inLogin, setInLogin] = useState(false);
    let [branding, setBranding] = useState({});
    let [prompt, setPrompt] = useState(false);
    let [account, setAccount] = useState({});

    useEffect(() => {
        const x = async () => {
            let branding = await brandingApi.getBranding();
            document.title = branding['name'];
            setBranding(branding);
        }
        x();
    }, []);

    const afterLoginSuccess = async (data) => {
        // 跳转登录
        sessionStorage.removeItem('current');
        sessionStorage.removeItem('openKeys');
        setToken(data['token']);

        let user = data['info'];
        setCurrentUser(user);
        if (user) {
            if (user['type'] === 'user') {
                navigate('/my-import');
            } else {
                navigate('/');
            }
        }
    }

    const login = async (values) => {
        let result = await request.post('/login', values);
        if (result['code'] === 1) {
            Modal.destroyAll();
            await afterLoginSuccess(result['data']);
        }
    }

    const handleOk = (loginAccount, totp) => {
        if (!strings.hasText(totp)) {
            message.warn("请输入双因素认证码");
            return false;
        }
        loginAccount['totp'] = totp;
        login(loginAccount);
        return false;
    }

    const handleSubmit = async params => {
        setInLogin(true);

        try {
            let result = await request.post('/login', params);
            if (result.code === 100) {
                // 进行双因素认证
                setPrompt(true);
                setAccount(params);
                return;
            }
            if (result.code !== 1) {
                return;
            }

            afterLoginSuccess(result['data']);
        } catch (e) {
            message.error(e.message);
        } finally {
            setInLogin(false);
        }
    };

    return (
        <div className='login-box' style={{ backgroundImage: `url(${bgImage})` }} >
            <div className="w-100"  >
                 <img src={docx} alt="docx" className='login-docx'/>
                 <img src={pdf} alt="pdf" className='login-pdf'/>
                 <img src={xlsx} alt="xlsx" className='login-xls'/>
                 <img src={zip} alt="zip" className='login-zip'/>
            </div>
            <Card className='login-card' title={null}>
                <div style={{textAlign: "center", margin: '15px auto 30px auto', color: '#1890ff'}}>
                    <Title level={1}>{branding['name']}</Title>
                    <Text>{branding['description']}</Text>
                </div>
                <Form onFinish={handleSubmit} className="login-form">
                    <Form.Item name='username' rules={[{required: true, message: '请输入登录账号！'}]}>
                        <Input prefix={<UserOutlined/>} placeholder="登录账号"/>
                    </Form.Item>
                    <Form.Item name='password' rules={[{required: true, message: '请输入登录密码！'}]}>
                        <Input.Password prefix={<LockOutlined/>} placeholder="登录密码"/>
                    </Form.Item>
                    <Form.Item name='remember' valuePropName='checked' initialValue={false}>
                        <Checkbox>保持登录</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button"
                                loading={inLogin}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <PromptModal
                title={'双因素认证'}
                open={prompt}
                onOk={(value) => {
                    handleOk(account, value)
                }}
                onCancel={() => setPrompt(false)}
                placeholder={"请输入双因素认证码"}
            >

            </PromptModal>
            <div className="login-footer">
                <FooterComponent />  
            </div>
        </div>

    );
}

export default LoginForm;
