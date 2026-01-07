import { Form, Input, Modal, Select } from "antd";
import React, { useEffect, useState } from 'react';
import dictDataApi from "../../api/dict-data";
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
    const [applyStatusVisible, setApplyStatusVisible] = useState(false);
    const [taskStatusOptions, setTaskStatusOptions] = useState([]);
    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    useEffect(() => {
        dictDataApi.list("task_apply_status").then(res => {
            setTaskStatusOptions(res)
        })
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
        <>
        <Modal
            title={id ? '更新代办审批' : '新建代办审批'}
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

                <Form.Item label="审批状态" name='status' rules={[{required: true, message: '请输入指令名称'}]}>
                    {/* <Input placeholder="请输入审批人"/> */}
                    <Select 
                        style={{width: `100%`}}
                        onChange={(value) => {
                           
                        }}
                        >
                    {taskStatusOptions?.map(item => {
                        return <Select.Option key={item.id} value={item.code}>{item.label}</Select.Option>
                    })}
                </Select>
                </Form.Item>

                <Form.Item label="审批意见" name='remark' rules={[{required: true, message: '请输入指令内容'}]}>
                    <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="请输入内容"/>
                </Form.Item>
            </Form>
        </Modal>
         
        </>
    )
};

export default ApplyModal;