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
            title={id ? '更新已办申请' : '新建已办申请'}
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

                <Form.Item label="任务名称" name='taskName' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入审批人"/>
                </Form.Item>

                <Form.Item label="来源/去向" name='source' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入来源/去向"/>
                </Form.Item>

                <Form.Item label="文件大小" name='fileSize' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件大小"/>
                </Form.Item>

                <Form.Item label="文件类型" name='fileType' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件类型"/>
                </Form.Item>

                <Form.Item label="文件类别" name='classification' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件类别"/>
                </Form.Item>

                <Form.Item label="文件" name='attachment' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入文件"/>
                </Form.Item>

                <Form.Item label="任务描述" name='taskDesc' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入任务描述"/>
                </Form.Item>

                <Form.Item label="状态" name='status' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入状态"/>
                </Form.Item>

                <Form.Item label="审批人" name='approver' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请输入审批人"/>
                </Form.Item>
                <Form.Item label="审批时间" name='approvalTime' rules={[{required: true, message: '请输入指令名称'}]}>
                    <Input placeholder="请选择审批时间"/>
                </Form.Item>

                <Form.Item label="备注" name='remark' rules={[{required: true, message: '请输入指令内容'}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="一行一个指令"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default ApplyModal;