import { Form, Input, Modal } from "antd";
import React, { useEffect } from 'react';
import taskProcessApi from "../../api/task-process";
import workCommandApi from "../../api/worker/command";

const api = taskProcessApi;
const {TextArea} = Input;

const TaskProcessModal = ({
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
            title={id ? '更新终端审计' : '新建终端审计'}
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

                <Form.Item label="设备ID" name='key' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入设备ID"/>
                </Form.Item>

                <Form.Item label="业务ID" name='bussId' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入业务ID"/>
                </Form.Item>
                <Form.Item label="任务名称" name='taskName' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入任务名称"/>
                </Form.Item>
                <Form.Item label="文件路径" name='filePath' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件路径"/>
                </Form.Item>
                <Form.Item label="备注" name='remark' rules={[{required: true, message: '请输入指令内容'}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="一行一个指令"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default TaskProcessModal;