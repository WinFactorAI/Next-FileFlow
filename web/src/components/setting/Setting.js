import { InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Alert, Badge, Button, Checkbox, Descriptions, Form, Input, message, Select, Space, Switch, Tabs, Typography } from "antd";
import React, { Component } from 'react';
import brandingApi from "../../api/branding";
import ftpApi from "../../api/ftp";
import { GetLicense, GetMachineId } from "../../api/license";
import sensitiveApi from "../../api/sensitive";
import { server } from "../../common/env";
import request from "../../common/request";
import { download, getToken } from "../../utils/utils";
const { Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

const formItemLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};

const formTailLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};


class Setting extends Component {
    constructor(props) {
        super(props);
        // 绑定事件处理函数
        this.handleResize = this.handleResize.bind(this);
    }
    state = {
        refs: [],
        properties: {},
        ldapUserSyncLoading: false,
        license: {
            name: '免费版',
            expired: undefined
        },
        machineId: '',
        showDot: false,
        versionInfo: {
            version: '',
            detail: '',
            downUrl: '',
        },
        branding: {},
        buttonLoading: false,
        ftpStatusServer: false,
        sensitiveStatusServer: false,
        isMini: false // 初始状态
    }

    rdpSettingFormRef = React.createRef();
    sshSettingFormRef = React.createRef();
    vncSettingFormRef = React.createRef();
    guacdSettingFormRef = React.createRef();
    mailSettingFormRef = React.createRef();
    ftpSettingFormRef = React.createRef();
    ldapSettingFormRef = React.createRef();
    aiSettingFormRef = React.createRef();
    logSettingFormRef = React.createRef();
    otherSettingFormRef = React.createRef();

    componentDidMount() {
        // eslint-disable-next-line no-extend-native
        String.prototype.bool = function () {
            return (/^true$/i).test(this);
        };

        this.setState({
            refs: [
                this.rdpSettingFormRef,
                this.sshSettingFormRef,
                this.vncSettingFormRef,
                this.guacdSettingFormRef,
                this.mailSettingFormRef,
                this.ftpSettingFormRef,
                this.ldapSettingFormRef,
                this.aiSettingFormRef,
                this.logSettingFormRef,
                this.otherSettingFormRef
            ]
        }, this.getProperties)

        window.addEventListener('resize', this.handleResize);
        this.handleResize(); // 初始化时立即执行
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({
            isMini: window.innerWidth <= 768
        });
    }
    changeProperties = async (values) => {
        let result = await request.put('/properties', values);
        if (result.code === 1) {
            message.success('修改成功');
        } else {
            message.error(result.message);
        }
    }

    getProperties = async () => {

        let result = await request.get('/properties');
        if (result['code'] === 1) {
            let properties = result['data'];

            for (let key in properties) {
                if (!properties.hasOwnProperty(key)) {
                    continue;
                }
                if (properties[key] === '-') {
                    properties[key] = '';
                }
                if (key.startsWith('enable') || key.startsWith("disable" || key === 'swap-red-blue')) {
                    properties[key] = properties[key].bool();
                }
            }

            this.setState({
                properties: properties
            })

            for (let ref of this.state.refs) {
                if (ref.current) {
                    ref.current.setFieldsValue(properties)
                }
            }

            ftpApi.status().then(status => {
                this.setState({
                    ftpStatusServer: status
                })
            }).catch(() => message.error('获取服务状态失败'))

            sensitiveApi.status().then(status => {
                this.setState({
                    sensitiveStatusServer: status
                })
            })
        } else {
            message.error(result['message']);
        }
        this.checkVersion();
        let branding = await brandingApi.getBranding();
        this.setState({
            branding: branding
        })
    }

    handleOnTabChange = (key) => {
        if (key === 'license') {
            this.getMachineId();
            this.getLicense();
        } else {
            this.getProperties();
        }
    }

    getLicense = async () => {
        let data = await GetLicense();
        if (data) {
            this.setState({
                license: data
            })
        }
    }

    getMachineId = async () => {
        let data = await GetMachineId();
        this.setState({
            machineId: data
        })
    }

    handleImport = () => {
        let files = window.document.getElementById('file-upload').files;
        if (files.length === 0) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            let backup = JSON.parse(reader.result.toString());
            this.setState({
                importBtnLoading: true
            })
            try {
                let result = await request.post('/backup/import', backup);
                if (result['code'] === 1) {
                    message.success('恢复成功', 3);
                } else {
                    message.error(result['message'], 10);
                }
            } finally {
                this.setState({
                    importBtnLoading: false
                })
                window.document.getElementById('file-upload').value = "";
            }
        };
        reader.readAsText(files[0]);
    }

    ldapUserSync = async () => {
        const id = 'ldap-user-sync'
        try {
            this.setState({
                ldapUserSyncLoading: true
            });
            message.info({ content: '同步中...', key: id, duration: 5 });
            let result = await request.post(`/properties/ldap-user-sync`);
            if (result.code !== 1) {
                message.error({ content: result.message, key: id, duration: 10 });
                return;
            }
            message.success({ content: '同步成功。', key: id, duration: 3 });
        } finally {
            this.setState({
                ldapUserSyncLoading: false
            });
        }
    }

    handleImportLicense = () => {
        let files = window.document.getElementById('import-license').files;
        if (files.length === 0) {
            return;
        }
        let file = files[0];
        const reader = new FileReader();
        reader.onload = async () => {
            // 当读取完成时，内容只在`reader.result`中
            let license = reader.result;
            let result = await request.post('/license', { 'license': license });
            if (result['code'] !== 1) {
                message.error(result['message']);
            } else {
                this.getLicense();
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    handleDownloadUpgrade = () => {
        // download('/upgrade');
        this.setState({
            isDownload: true
        })
    }
    checkVersion = async () => {
        let result = await request.get('/properties/app/checkVersion');
        if (result['code'] === 1) {
            this.setState({
                versionInfo: result['data']
            })
        }
    }
    handleUpgrade = async (isProcessing) => {
        this.setState({
            showProgress: isProcessing
        })
        if (isProcessing) {
            // 定时器{i18next.t('settings.base.updateButton')}进度
            await request.get('/properties/app/upgrade');
            var upgradeMsg = message.info('开始升级,系统自动重启,请稍后...', 0);
            this.upgradeTimer = setInterval(() => {
                if (this.state.versionInfo.version === this.state.branding.version) {
                    clearInterval(this.upgradeTimer);
                    this.setState({
                        showProgress: false
                    })
                    message.success('更新成功', 3);
                    upgradeMsg.close();
                }
                this.checkVersion();
            }, 1000);
        }
    };

    handleFTPStart = async () => {
        this.setState({ buttonLoading: true });
        try {
            let success = await ftpApi.start();
            message.success('FTP 服务已启动');
            this.setState({
                ftpStatusServer: success
            });
        } catch (err) {
            message.error('启动服务失败');
        } finally {
            this.setState({
                buttonLoading: false
            });
        }
    };
    handleFTPStop = async () => {
        this.setState({ buttonLoading: true });
        try {
            let success = await ftpApi.stop();
            message.success('FTP 服务停止成功');
            this.setState({
                ftpStatusServer: false
            });
        } catch (err) {
            message.error('停止服务失败');
        } finally {
            this.setState({
                buttonLoading: false
            });
        }
    };

    handleEmailTest = async () => {
        try {
            const form = this.mailSettingFormRef.current;
            const values = form.getFieldsValue();
            // console.log(" values ", values);
            if (values['mail-test'] === undefined &&
                values['mail-host'] === undefined &&
                values['mail-port'] === undefined &&
                values['mail-username'] === undefined &&
                values['mail-password'] === undefined
            ) {
                message.error("请填写完整信息重试", 10);
                return
            }
            let result = await request.post('/properties/email-test', { 'mail-test': values['mail-test'] });
            if (result['code'] === 1) {
                message.success("发送成功", 10);
            } else {
                message.error("发送失败" + result, 10);
            }
        } finally {

        }
    }

    render() {

        const renderType = (type) => {
            switch (type) {
                case 'free':
                    return '企业版';
                case 'test':
                    return '测试版';
                case 'vip':
                    return '会员版';
                case 'pro':
                    return '专业版';
                case 'enterprise':
                    return '企业版';
                default:
                    return type;
            }
        }

        const renderCount = (count) => {
            if (count <= 0) {
                return '无限制';
            }
            return count;
        }

        const renderTime = (time, type) => {
       
            let suffix = '';
            let color = '';
            if (this.state.license.Message?.includes("已过期")) {
                suffix = <span style={{ color: 'red' }}>{this.state.license.Message}</span>;
                color = 'red';
            } else {
                suffix = <span style={{ color: 'green' }}>{this.state.license.Message}</span>;
                color = 'green';
            }
            return <>
                {/* <span style={{ color: color }}>{type === "format" ? time : dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')}</span> */}
                &nbsp;{suffix}
            </>;
            // if (!time) {
            //     return '-';
            // }
            // if (time < 0) {
            //     return '永久授权';
            // }
            // let suffix = '';
            // let color = '';
            // if (new Date().getTime() > time * 1000) {
            //     suffix = <span style={{ color: 'red' }}>已过期</span>;
            //     color = 'red';
            // } else {
            //     suffix = <span style={{ color: 'green' }}>正常可用</span>;
            //     color = 'green';
            // }
            // return <>
            //     <span style={{ color: color }}>{type === "format"? time:dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')}</span>
            //     &nbsp;{suffix}
            // </>;
        }

        const restart = async () => {
            await request.get('/properties/app/restart');
            const restartMsg = message.info({ content: '请耐心等待,重启中...', duration: 0 });
            //启动定时器检查
            this.timer = setInterval(async () => {
                let status = await request.get('/properties/app/status');
                if (status['code'] === 1) {
                    clearInterval(this.timer);
                    restartMsg();
                    message.success('启动成功');
                }
            }, 1000)
        }
        const stop = async () => {
            await request.get('/properties/app/stop');
            message.success({ content: '停止运行成功，请手动关闭窗口。', duration: 0 });
        }
        const { isMini } = this.state;
        const onChange = (checkedValues) => {
            // console.log('checked = ', checkedValues);
        };
        const plainOptions = ['敏感规则自动审批通过'];

        return (
            <div className="page-container-white">
                <Tabs tabPosition={isMini ? 'top' : 'left'} onChange={this.handleOnTabChange} tabBarStyle={{ ...(isMini ? {} : { width: 150 }), }}>
                    <TabPane tab="基础配置" key="base">
                        <Title level={4}>基础配置</Title>
                        <Form ref={this.otherSettingFormRef} name="other" onFinish={this.changeProperties}
                            layout="vertical">
                            <Form.Item {...formItemLayout} label="敏感规则AI模型服务状态">
                                <Space>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.sensitiveStatusServer ? 'green' : 'red', }}>
                                        <SyncOutlined spin={this.state.sensitiveStatusServer} />
                                    </div>
                                    <div style={{ color: this.state.sensitiveStatusServer ? 'green' : 'red', }}>
                                        {this.state.sensitiveStatusServer ? "运行" : "停止"}
                                    </div>

                                </Space>
                            </Form.Item>
                            <Form.Item label="自动审批处理" name="auto-apply" tooltip="当全部规则没有符合的时候，是否自动审批处理，请谨慎设置。">
                                <Checkbox.Group options={plainOptions} defaultValue={['auto']} onChange={onChange} />
                            </Form.Item>

                            {/* <Form.Item label="文件空间绑定IP访问" name="file-space-ip"  tooltip="开启后文件空间只能在指定IP地址使用。">
                                <Checkbox.Group options={plainOptions} defaultValue={['yes']} onChange={onChange} />
                            </Form.Item> */}

                            <Form.Item
                                {...formItemLayout}
                                name="user-default-storage-size"
                                label="用户空间默认大小"
                                tooltip='无限制请填写-1'
                            >
                                <Input type={'number'} min={-1} suffix="MB" />
                            </Form.Item>


                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="FTP服务器" key="ftp">
                        <Title level={4}>FTP服务器配置</Title>
                        {/* <Space direction="vertical"> */}
                        <Alert
                            message="配置FTP服务器后，服务器将开机自动启动，请确保FTP服务器已安装并配置好。"
                            type="info"
                            style={{ marginBottom: 10 }}
                        />
                        <Form ref={this.ftpSettingFormRef} name='ftp' onFinish={this.changeProperties}
                            layout="vertical">

                            <Form.Item {...formItemLayout} label="服务器状态">
                                <Space>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: this.state.ftpStatusServer ? 'green' : 'red', }}>
                                        <SyncOutlined spin={this.state.ftpStatusServer} />
                                    </div>
                                    <div style={{ color: this.state.ftpStatusServer ? 'green' : 'red', }}>
                                        {this.state.ftpStatusServer ? "运行" : "停止"}
                                    </div>
                                    <Space>
                                        {this.state.ftpStatusServer ? (
                                            <Button type="dashed" onClick={() => {
                                                this.handleFTPStop()
                                            }} size='small'
                                                loading={this.state.buttonLoading}
                                                disabled={this.state.buttonLoading}
                                            >
                                                停止
                                            </Button>
                                        ) : (
                                            <Button type="primary" onClick={() => {
                                                this.handleFTPStart()
                                            }} size='small'
                                                loading={this.state.buttonLoading}
                                                disabled={this.state.buttonLoading}
                                            >
                                                启动
                                            </Button>
                                        )}
                                    </Space>
                                </Space>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="enable-ftp-auto-start"
                                label="自启用FTP服务"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="ftp-host"
                                label="服务器地址"
                                rules={[
                                    {
                                        required: true,
                                        message: 'FTP服务器地址',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入FTP服务器地址" defaultValue="127.0.0.1" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="ftp-port"
                                label="服务器端口"
                                rules={[
                                    {
                                        required: true,
                                        message: 'FTP服务器端口',
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='number' placeholder="请输入FTP服务器端口" defaultValue={21} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="端口范围"
                                name="ftp-port-range"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入端口范围（如 49152-65535）',
                                    },
                                    {
                                        pattern: /^(\d+-\d+|\d+)$/, // 支持单个端口或范围
                                        message: '格式应为 "起始端口-结束端口"（如 49152-65535）',
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (value.includes('-')) {
                                                const [start, end] = value.split('-').map(Number);
                                                if (start >= 0 && end <= 65535 && start <= end) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject('端口范围无效（0-65535，且起始 ≤ 结束）');
                                            }
                                            const port = Number(value);
                                            if (port >= 0 && port <= 65535) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject('端口号无效（0-65535）');
                                        },
                                    },
                                ]}
                            >
                                <Input placeholder="请输入端口范围（如 49152-65535）" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="ftp-username"
                                label="账号"
                                rules={[
                                    {
                                        required: true,
                                        type: "text",
                                        message: '请输入正确的FTP账号',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入FTP账号" defaultValue={"root"} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="ftp-password"
                                label="密码"
                                rules={[
                                    {
                                        required: true,
                                        message: 'FTP密码',
                                    },
                                ]}
                            >
                                <Input.Password placeholder="请输入FTP密码" defaultValue={"root"} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="ftp-path"
                                label="根目录"
                                rules={[
                                    {
                                        required: true,
                                        message: 'FTP根目录',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入FTP根目录" defaultValue={"/"} />
                            </Form.Item>
                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                        {/* </Space> */}
                    </TabPane>
                    <TabPane tab="LDAP配置" key="ldap">
                        <Title level={4}>LDAP服务器配置</Title>
                        {/* <Space direction="vertical"> */}
                        <Alert
                            message="配置LDAP服务器后，服务器将开机自动启动，请确保LDAP服务器已安装并配置好。"
                            type="info"
                            style={{ marginBottom: 10 }}
                        />
                        <Form ref={this.ldapSettingFormRef} name='ldap' onFinish={this.changeProperties}
                            layout="vertical">
                            {/* <Form.Item
                                    {...formItemLayout}
                                    name="enable-ldap-status"
                                    label="启用LDAP"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                                </Form.Item> */}
                            <Form.Item
                                {...formItemLayout}
                                name="ldap-host"
                                label="服务器地址"
                                rules={[
                                    {
                                        required: false,
                                        message: 'LDAP服务器地址',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入LDAP服务器地址" value="127.0.0.1" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="ldap-port"
                                label="服务器端口"
                                rules={[
                                    {
                                        required: false,
                                        message: 'LDAP服务器端口',
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='number' placeholder="请输入LDAP服务器端口" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="ldap-dn"
                                label="基础DN"
                                rules={[
                                    {
                                        required: false,
                                        message: 'LDAP基础DN',
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入LDAP基础DN" />
                            </Form.Item>


                            <Form.Item
                                {...formItemLayout}
                                name="ldap-username"
                                label="账号"
                                rules={[
                                    {
                                        required: false,
                                        type: "text",
                                        message: '请输入正确的LDAP账号',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入LDAP账号" />
                            </Form.Item>
                            <input type='password' hidden={true} autoComplete='new-password' />
                            <Form.Item
                                {...formItemLayout}
                                name="ldap-password"
                                label="密码"
                                rules={[
                                    {
                                        required: false,
                                        message: 'LDAP密码',
                                    },
                                ]}
                            >
                                <Input.Password type='password' placeholder="请输入LDAP密码" />
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                        {/* </Space> */}
                    </TabPane>
                    <TabPane tab={"AI大模型"} key="ai">
                        <Title level={4}>AI大模型</Title>
                        {/* <Descriptions title=""  column={1}>
                            <Descriptions.Item label={i18next.t('settings.base.hint-label')}>服务器管理是为提供开发与数据库客户端使用TCP方式进行连接Next-dbm的管理配置界面。</Descriptions.Item>
                        </Descriptions> */}
                        <Form ref={this.aiSettingFormRef} name="ai" onFinish={this.changeProperties} layout="vertical">
                            {/* <Form.Item
                                {...formItemLayout}
                                name="enable-ai-status"
                                label="启用AI大模型"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                            </Form.Item> */}
                            <Form.Item
                                {...formItemLayout}
                                name="ai-base-url"
                                label="服务器地址"
                                initialValue=""
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入模型URL" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="ai-api-key"
                                label="apiKey"
                                initialValue=""
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input.Password placeholder="请输入apiKey" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="ai-max-tokens"
                                label="maxTokens"
                                initialValue=""
                            >
                                <Input type='text' placeholder="请输入maxTokens" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="ai-model"
                                label="model"
                                initialValue="deepseek-coder"
                            >
                                <Input type='text' placeholder="请输入model" />
                            </Form.Item>
                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    {/* <TabPane tab="RDP配置" key="rdp">
                        <Form ref={this.rdpSettingFormRef} name="rdp" onFinish={this.changeProperties}
                              layout="vertical">

                            <Title level={4}>RDP配置(远程桌面)</Title>
                            <Form.Item
                                {...formItemLayout}
                                name="enable-wallpaper"
                                label="启用桌面墙纸"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="enable-theming"
                                label="启用桌面主题"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="enable-font-smoothing"
                                label="启用字体平滑（ClearType）"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="enable-full-window-drag"
                                label="启用全窗口拖拽"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="enable-desktop-composition"
                                label="启用桌面合成效果（Aero）"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="enable-menu-animations"
                                label="启用菜单动画"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="disable-bitmap-caching"
                                label="禁用位图缓存"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="disable-offscreen-caching"
                                label="禁用离屏缓存"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="TELNET配置" key="telnet">
                        <Form ref={this.sshSettingFormRef} name="ssh" onFinish={this.changeProperties}
                              layout="vertical">

                            <Title level={4}>TELNET配置</Title>

                            <Form.Item
                                {...formItemLayout}
                                name="color-scheme"
                                label="配色方案"
                                rules={[
                                    {
                                        required: true,
                                        message: '配色方案',
                                    },
                                ]}
                                initialValue="gray-black"
                            >
                                <Select style={{width: 120}} onChange={null}>
                                    <Option value="gray-black">黑底灰字</Option>
                                    <Option value="green-black">黑底绿字</Option>
                                    <Option value="white-black">黑底白字</Option>
                                    <Option value="black-white">白底黑字</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="font-name"
                                label="字体名称"
                                rules={[
                                    {
                                        required: true,
                                        message: '字体名称',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入字体名称"/>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="font-size"
                                label="字体大小"
                                rules={[
                                    {
                                        required: true,
                                        message: '字体大小',
                                    },
                                ]}
                            >
                                <Input type='number' placeholder="请输入字体大小"/>
                            </Form.Item>

                            <Form.Item
                                name="backspace"
                                label="退格键映射"
                                {...formItemLayout}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">默认</Option>
                                    <Option value="127">删除键(Ctrl-?)</Option>
                                    <Option value="8">退格键(Ctrl-H)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="terminal-type"
                                label="终端类型"
                                {...formItemLayout}
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">默认</Option>
                                    <Option value="ansi">ansi</Option>
                                    <Option value="linux">linux</Option>
                                    <Option value="vt100">vt100</Option>
                                    <Option value="vt220">vt220</Option>
                                    <Option value="xterm">xterm</Option>
                                    <Option value="xterm-256color">xterm-256color</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="VNC配置" key="vnc">
                        <Form ref={this.vncSettingFormRef} name="vnc" onFinish={this.changeProperties}
                              layout="vertical">

                            <Title level={4}>VNC配置</Title>

                            <Form.Item
                                {...formItemLayout}
                                name="color-depth"
                                label="色彩深度"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">默认</Option>
                                    <Option value="16">低色（16位）</Option>
                                    <Option value="24">真彩（24位）</Option>
                                    <Option value="32">真彩（32位）</Option>
                                    <Option value="8">256色</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="cursor"
                                label="光标"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">默认</Option>
                                    <Option value="local">本地</Option>
                                    <Option value="remote">远程</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="swap-red-blue"
                                label="交换红蓝成分"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label='目标主机'
                                tooltip='连接到VNC代理（例如UltraVNC Repeater）时要请求的目标主机。'
                                name='dest-host'>
                                <Input placeholder="目标主机"/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label='目标端口'
                                tooltip='连接到VNC代理（例如UltraVNC Repeater）时要请求的目标端口。'
                                name='dest-port'>
                                <Input type='number' min={1} max={65535}
                                       placeholder='目标端口'/>
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="录屏配置" key="guacd">
                        <Title level={4}>录屏配置</Title>
                        <Form ref={this.guacdSettingFormRef} name="guacd" onFinish={this.changeProperties}
                              layout="vertical">

                            <Form.Item
                                {...formItemLayout}
                                name="enable-recording"
                                label="开启录屏"
                                valuePropName="checked"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => {
                                    this.setState({
                                        properties: {
                                            ...this.state.properties,
                                            'enable-recording': checked,
                                        }
                                    })
                                }}/>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="session-saved-limit"
                                label="会话录屏保存时长"
                                initialValue=""
                            >
                                <Select onChange={null} disabled={!this.state.properties['enable-recording']}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane> */}
                    <TabPane tab="邮箱配置" key="mail">
                        <Title level={4}>邮箱配置</Title>

                        <Form ref={this.mailSettingFormRef} name='mail' onFinish={this.changeProperties}
                            layout="vertical">
                            <Alert
                                message="配置邮箱后，添加用户将向对方的邮箱发送账号密码。"
                                type="info"
                                style={{ marginBottom: 10 }}
                            />
                            <Form.Item
                                {...formItemLayout}
                                name="mail-host"
                                label="邮件服务器地址"
                                rules={[
                                    {
                                        required: false,
                                        message: '邮件服务器地址',
                                    },
                                ]}
                            >
                                <Input type='text' placeholder="请输入邮件服务器地址" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="mail-port"
                                label="邮件服务器端口"
                                rules={[
                                    {
                                        required: false,
                                        message: '邮件服务器端口',
                                        min: 1,
                                        max: 65535
                                    },
                                ]}
                            >
                                <Input type='number' placeholder="请输入邮件服务器端口" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="mail-username"
                                label="邮箱账号"
                                rules={[
                                    {
                                        required: false,
                                        type: "email",
                                        message: '请输入正确的邮箱账号',
                                    },
                                ]}
                            >
                                <Input type='email' placeholder="请输入邮箱账号" />
                            </Form.Item>
                            <input type='password' hidden={true} autoComplete='new-password' />
                            <Form.Item
                                {...formItemLayout}
                                name="mail-password"
                                label="邮箱密码"
                                rules={[
                                    {
                                        required: false,
                                        message: '邮箱密码',
                                    },
                                ]}
                            >
                                <Input.Password placeholder="请输入邮箱密码" />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="测试接收邮箱"
                                name="mail-test"
                                rules={[
                                    {
                                        required: false,
                                        type: "email",
                                        message: '请输入正确的邮箱账号',
                                    },
                                ]}
                            >
                                <Input type='email' placeholder="请输入邮箱账号" />
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        更新
                                    </Button>
                                    <Button type="dashed" onClick={() => {
                                        this.handleEmailTest()
                                    }}  >
                                        发送验证
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>

                    </TabPane>

                    <TabPane tab="日志配置" key="log">
                        <Title level={4}>日志配置</Title>
                        <Form ref={this.logSettingFormRef} name="log" onFinish={this.changeProperties}
                            layout="vertical">

                            <Form.Item
                                {...formItemLayout}
                                name="login-log-saved-limit"
                                label="登录日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="cron-log-saved-limit"
                                label="计划任务日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="alarm-log-saved-limit"
                                label="通知日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="sensitive-log-saved-limit"
                                label="敏感日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="oper-log-saved-limit"
                                label="操作日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                name="file-log-saved-limit"
                                label="文件日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                name="heart-log-saved-limit"
                                label="心跳日志保留时长"
                                initialValue=""
                            >
                                <Select onChange={null}>
                                    <Option value="">永久</Option>
                                    <Option value="1">1天</Option>
                                    <Option value="3">3天</Option>
                                    <Option value="7">7天</Option>
                                    <Option value="30">30天</Option>
                                    <Option value="60">60天</Option>
                                    <Option value="180">180天</Option>
                                    <Option value="360">360天</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item {...formTailLayout}>
                                <Button type="primary" htmlType="submit">
                                    更新
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="许可证" key="license">
                        <Title level={4}>许可证</Title>

                        <Space direction="vertical">
                            <Descriptions title="许可证" column={1}>
                                <Descriptions.Item label='许可类型'>{renderType(this.state.license.AuthorizedType)}</Descriptions.Item>
                                <Descriptions.Item label='机器码'>
                                    <Paragraph
                                        style={{ marginBottom: 0 }}
                                        copyable={{ text: this.state.machineId, }}>
                                        {this.state.machineId}
                                    </Paragraph>
                                </Descriptions.Item>
                                <Descriptions.Item label='最大并发数'>{renderCount(this.state.license.UserCount)}</Descriptions.Item>
                                <Descriptions.Item label='许可到期时间'>{renderTime()}</Descriptions.Item>
                            </Descriptions>

                            <Space>
                                <Button type="primary" loading={this.state['importBtnLoading']} onClick={() => {
                                    window.document.getElementById('import-license').click();
                                }}>
                                    导入证书
                                </Button>

                                <Button type="dashed" onClick={() => {
                                    window.open("http://license.aiputing.com/");
                                }}>
                                    在线申请
                                </Button>
                                <input type="file" id="import-license" style={{ display: 'none' }}
                                    onChange={this.handleImportLicense} />
                            </Space>
                        </Space>

                    </TabPane>

                    <TabPane tab="备份与恢复" key="backup">
                        <Title level={4}>备份与恢复</Title>

                        <Space direction="vertical">
                            <Alert
                                message="恢复数据时，如存在登录账号相同的用户时，会保留原系统中的数据，此外由于登录密码加密之后不可逆，恢复的账户密码将随机产生。"
                                type="info"
                            />

                            <Space>
                                <Button type="primary" onClick={() => {
                                    download(`${server}/backup/export?X-Auth-Token=${getToken()}&t=${new Date().getTime()}`);
                                }}>
                                    导出备份
                                </Button>

                                <Button type="dashed" loading={this.state['importBtnLoading']} onClick={() => {
                                    window.document.getElementById('file-upload').click();
                                }}>
                                    恢复备份
                                </Button>
                                <input type="file" id="file-upload" style={{ display: 'none' }}
                                    onChange={this.handleImport} />
                            </Space>
                        </Space>

                    </TabPane>
                    <TabPane tab={
                        <Space>
                            <Badge dot={this.state.versionInfo.version && this.state.versionInfo.version !== this.state.branding.version} >更新升级</Badge>
                        </Space>
                    } key="upgrade">
                        <Title level={4}>更新升级</Title>
                        <Space direction="vertical">
                            <Space direction='vertical'>
                                <Space direction="vertical">
                                    <span>当前版本{this.state.branding.version}</span>
                                    {/* <TextArea readOnly rows={8} value={_upgrade['upgrade']} style={{width: '100%'}}/> */}
                                    <pre>
                                        {this.state.branding.upgrade}
                                    </pre>
                                </Space>
                                {
                                    this.state.versionInfo.version && this.state.versionInfo.version !== this.state.branding.version && <Space direction="vertical">
                                        <Space style={{ color: 'red' }}>
                                            <span >新版本{this.state.versionInfo.version}</span>
                                            <a href={this.state.versionInfo.detail} target="_blank" rel="noreferrer"><InfoCircleOutlined />发行说明</a>
                                        </Space>
                                    </Space>
                                }
                            </Space>
                            {
                                this.state.versionInfo.version && this.state.versionInfo.version !== this.state.branding.version &&
                                <Space style={{ marginTop: '20px' }}>
                                    <Button type="primary" loading={this.state['showProgress']} onClick={() => { this.handleUpgrade(true) }}>
                                        升级更新
                                    </Button>
                                </Space>
                            }
                        </Space>

                    </TabPane>
                    <TabPane tab='重启/停止' key="stop">
                        <Title level={4}>重启/停止</Title>
                        <Space>
                            <Button onClick={() => { restart() }}>
                                重启
                            </Button>
                            <Button onClick={() => { stop() }}>
                                停止
                            </Button>
                        </Space>
                    </TabPane>

                    <TabPane tab='关于' key="about">
                        <Title level={4}>关于</Title>
                        <Space direction="vertical">
                            <Space direction='vertical'>
                                <div>版权所有 {new Date().getFullYear()} 北京胜利因子科技有限公司</div>
                                <div>除非有其他约定，此插件的使用应遵循aiputing.com 终端用户协议。</div>
                                <div>此插件包括Apache软件基金开发的软件。</div>
                                <div>此插件也包含第三方代码</div>
                                <div>插件中的"licenses"目录中，有关于此插件和其他的第三方代码的更多细节，包括适用的版权、法律和许可证通知书。</div>
                            </Space>

                        </Space>

                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default Setting;
