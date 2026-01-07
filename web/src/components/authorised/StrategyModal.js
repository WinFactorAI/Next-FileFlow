import { Checkbox, Divider, Form, Input, Modal, Switch } from "antd";
import React, { useEffect } from 'react';
import strategyApi from "../../api/strategy";

const api = strategyApi;

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

const StrategyModal = ({ visible, handleOk, handleCancel, confirmLoading, id }) => {

    const [form] = Form.useForm();

    useEffect(() => {

        const getItem = async () => {
            let data = await api.getById(id);
            if (data) {
                form.setFieldsValue(data);
            }
        }
        if (visible && id) {
            getItem();
        } else {
            form.setFieldsValue({
                upload: false,
                download: false,
                edit: false,
                delete: false,
                rename: false,
                copy: false,
                paste: false,
            });
        }
    }, [visible]);

    return (
        <Modal
            title={id ? '更新空间策略' : '新建空间策略'}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        let ok = await handleOk(values);
                        if (ok) {
                            form.resetFields();
                        }
                    });
            }}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText='确定'
            cancelText='取消'
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true} />
                </Form.Item>

                <Form.Item label="名称" name='name' rules={[{ required: true, message: '请输入名称' }]}>
                    <Input autoComplete="off" placeholder="空间策略名称" />
                </Form.Item>


                <Divider orientation="left" orientationMargin="0">
                 申请下载
                </Divider>
                <Form.Item label="导入下载" name='importDownload' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item label="导出下载" name='exportDownload' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <Form.Item label="审批下载" name='todoDownload' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <Form.Item label="抄送下载" name='sendDownload' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <Form.Item label="审计下载" name='applyDownload' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                
                <Divider orientation="left" orientationMargin="0">
                 文件空间
                </Divider>
                <Form.Item label="上传" name='upload' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item label="下载" name='download' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item label="编辑" name='edit' rules={[{ required: true }]} valuePropName="checked"
                    tooltip={'编辑需要先开启下载'}>
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item label="删除" name='delete' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item label="重命名" name='rename' rules={[{ required: true }]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                {/* <Form.Item label="复制" name='copy' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                </Form.Item>

                <Form.Item label="粘贴" name='paste' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                </Form.Item> */}
                <Divider orientation="left" orientationMargin="0">
                  访问控制
                </Divider>
                <Form.Item label="IP地址" name='ipGroup' rules={[{ required: true, message: '请输入IP地址' }]} extra='格式为逗号分隔的字符串, 0.0.0.0/0 匹配所有。例如: 192.168.0.1, 192.168.1.0/24, 192.168.2.0-192.168.2.20'>
                    <Input autoComplete="off" placeholder="请输入" />
                </Form.Item>

                {/* <Form.Item label="规则" name='rule' rules={[{required: true, message: '请选择规则'}]}>
                    <Radio.Group onChange={async (e) => {

                    }}>
                        <Radio value={'allow'}>允许</Radio>
                        <Radio value={'reject'}>拒绝</Radio>
                    </Radio.Group>
                </Form.Item> */}
                <Form.Item label="激活" name='enabled' valuePropName="checked" rules={[{ required: true }]}>
                    <Checkbox />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default StrategyModal;
