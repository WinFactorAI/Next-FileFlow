import { Form, Input, Modal, Switch } from "antd";
import React, { useEffect } from 'react';
import dictTypeApi from "../../api/dict-type";
import workApplyApi from "../../api/worker/apply";

const api = dictTypeApi;
const { TextArea } = Input;

const DictTypeModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker
}) => {
    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
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
                data.status = data.status === '0' ? true : false;
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
            title={id ? '更新字典' : '新建字典'}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form.setFieldValue('status', form.getFieldValue('status') === true ? '0' : '1');
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
                    <Input placeholder="请输入名称" />
                </Form.Item>
                <Form.Item label="类型" name='type' rules={[{ required: true, message: '请输入类型' }]}>
                    <Input placeholder="请输入类型" />
                </Form.Item>
                <Form.Item label="状态" name='status'  valuePropName="checked"  rules={[{ required: true, message: '请输入状态' }]}>
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <Form.Item label="备注" name='remark' >
                    <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder="备注" />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default DictTypeModal;