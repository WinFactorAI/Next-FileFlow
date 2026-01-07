import { Button, Form, Input, Modal, message } from "antd";
import React, { useEffect, useState } from 'react';
import deviceApi from "../../api/device";
import workCommandApi from "../../api/worker/command";

const api = deviceApi;
const { TextArea } = Input;

const DeviceModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 生成授权码的请求处理
    const handleGenerateCode = async () => {
        try {
            setLoading(true);
            await api.getCode().then(code =>{
                form.setFieldValue( "authorizationCode", code);
                message.success('授权码生成成功');
            }); // 替换为实际API调用

        } catch (error) {
            message.error('授权码生成失败');
            console.error('生成失败:', error);
        } finally {
            setLoading(false);
        }
    };
    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
    };

    useEffect(() => {

        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workCommandApi.getById(id);
            } else {
                data = await api.getById(id);
            }
            if (data) {
                form.setFieldsValue(data);
            }
        }


        if (visible) {
            if (id) {
                getItem();
            } else {
                form.setFieldsValue({});
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (

        <Modal
            title={id ? '更新终端' : '新建终端'}
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
                <Form.Item label="客户端授权key" name='authorizationCode' rules={[{ required: true, message: '请输入指令名称' }]}>
                    <Input placeholder="请输入客户端授权key"
                        addonAfter={
                            <Button
                                type="primary"
                                onClick={handleGenerateCode}
                                loading={loading}
                                style={{ margin: '-5px -11px' }}
                            >
                                生成授权码
                            </Button>
                        }
                    />
                </Form.Item>
                <Form.Item label="审计员用户" name='userId' >
                    <Input placeholder="请选择审计员用户" />
                </Form.Item>
                {/* <Form.Item label="编号" name='code' rules={[{ required: true, message: '请输入指令名称' }]}>
                    <Input placeholder="请输入编号" />
                </Form.Item> */}
                <Form.Item label="设备名称" name='name' rules={[{ required: true, message: '请输入指令名称' }]}>
                    <Input placeholder="请输入设备名称" />
                </Form.Item>
                {/* <Form.Item label="文件系统" name='fileSystem' rules={[{ required: true, message: '请输入指令名称' }]}>
                    <Input placeholder="请输入文件系统" />
                </Form.Item> */}
                {/* <Form.Item label="MAC地址" name='mac' rules={[{ required: true, message: '请输入指令名称' }]}>
                    <Input placeholder="请输入MAC地址" />
                </Form.Item> */}
                <Form.Item label="设备描述" name='remark' rules={[{ required: true, message: '请输入指令内容' }]}>
                    <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder="一行一个指令" />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default DeviceModal;