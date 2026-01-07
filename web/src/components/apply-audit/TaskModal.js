import { Form, Input, Modal } from "antd";
import React, { useEffect } from 'react';
import taskApi from "../../api/task";
import workApplyApi from "../../api/worker/apply";

const api = taskApi;
const {TextArea} = Input;

const ApplyModal = ({
                          visible,
                          handleOk,
                          handleCancel,
                          confirmLoading,
                          id,
                          worker
                      }) => {
    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    useEffect(() => {

        const getItem = async () => {
            let data;
            if (worker === true) {
                data = await workApplyApi.getById(id);
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
            title={id ? '更新申请审计' : '新建申请审计'}
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
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label="文件名" name='fileName' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件名"/>
                </Form.Item>

                <Form.Item label="申请名称" name='taskName' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入申请名称"/>
                </Form.Item>

                <Form.Item label="信息去向" name='source' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入信息去向"/>
                </Form.Item>

                <Form.Item label="文件类别" name='classification' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件类别"/>
                </Form.Item>

                <Form.Item label="文件大小" name='fileSize' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件大小"/>
                </Form.Item>

                <Form.Item label="申请描述" name='taskDesc' rules={[{required: true, message: '请输入指令内容'}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="一行一个指令"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default ApplyModal;