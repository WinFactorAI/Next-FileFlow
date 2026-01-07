import { Form, Input, Modal } from "antd";
import React, { useEffect } from 'react';
import sensitiveRuleApi from "../../api/sensitive-rule";
import workSensitiveCommandApi from "../../api/worker/command";

const api = sensitiveRuleApi;
const {TextArea} = Input;

const SensitiveRuleModal = ({
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
                data = await workSensitiveCommandApi.getById(id);
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
            title={id ? '更新敏感规则' : '新建敏感规则'}
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

                <Form.Item label="名称" name='name' rules={[{required: true, message: '请输入名称'}]}>
                    <Input placeholder="请输入指令名称"/>
                </Form.Item>

                <Form.Item label="内容" name='content' rules={[{required: true, message: '请输入内容'}]} help="当配置AI模型提示时，如：我需要你分析一下这段文字是否包含“message”如果包含返回 AI模型引擎匹配到,如果不包含返回 AI模型引擎没有匹配到 返回格式:AI模型引擎匹配到了 第几行第几列" >
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="一行一个指令"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default SensitiveRuleModal;