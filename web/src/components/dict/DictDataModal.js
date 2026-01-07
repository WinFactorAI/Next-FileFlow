import { Form, Input, InputNumber, Modal, Select, Switch, Tag } from "antd";
import React, { useEffect, useState } from 'react';
import dictDataApi from "../../api/dict-data";
import workApplyApi from "../../api/worker/apply";

const api = dictDataApi;
const { TextArea } = Input;
const { Option } = Select;
const DictDataModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    type,
    worker
}) => {
    const [form] = Form.useForm();
    const [listClassOptions, setListClassOptions] = useState([
        {
            value: 'magenta',
            label: 'magenta',
        },
        {
            value: 'red',
            label: 'red',
        },
        {
            value: 'volcano',
            label: 'volcano',
        },
        {
            value: 'orange',
            label: 'orange',
        },
        {
            value: 'gold',
            label: 'gold',
        },
        {
            value: 'lime',
            label: 'lime',
        },
        {
            value: 'green',
            label: 'green',
        },
        {
            value: 'cyan',
            label: 'cyan',
        },
        {
            value: 'blue',
            label: 'blue',
        },
        {
            value: 'geekblue',
            label: 'geekblue',
        },
        {
            value: 'purple',
            label: 'purple',
        },
    ]);

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
                data.sort = parseInt(data.sort)
                form.setFieldsValue(data);
               
            }
        }


        if (visible) {
            if (id) {
                getItem();
            } else {
                // console.log('id', id);
                // console.log('type', type);
                form.setFieldsValue({});
                form.setFieldValue("type",type );
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (

        <Modal
            title={id ? '更新字典选项' : '新建字典选项'}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form.setFieldValue('status', form.getFieldValue('status') === true ? '0' : '1');
                form.setFieldValue('sort', form.getFieldValue('sort')+"");
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
   
                <Form.Item label="字典类型" name='type' rules={[{ required: true, message: '请输入字典类型' }]}>
                    <Input placeholder="请输入字典类型" readOnly/>
                </Form.Item>
                <Form.Item label="编码" name='code' rules={[{ required: true, message: '请输入字典类型' }]}>
                    <Input placeholder="请输入编码"/>
                </Form.Item>
                <Form.Item label="数据标签" name='label' rules={[{ required: true, message: '请输入数据标签' }]}>
                    <Input placeholder="请输入数据标签" />
                </Form.Item>
                <Form.Item label="数据键值" name='value' rules={[{ required: true, message: '请输入数据键值' }]}>
                    <Input placeholder="请输入数据键值" />
                </Form.Item>
                {/* <Form.Item label="样式属性" name='cssClass'>
                    <Input placeholder="请输入样式属性" />
                </Form.Item> */}
                <Form.Item label="顺序" name='sort' >
                    <InputNumber min={1} max={10000} defaultValue={1} />
                </Form.Item>
                <Form.Item label="回现样式" name='listClass' >
                    <Select allowClear>
                        {listClassOptions.map((item) => (
                            <Option key={item.value} value={item.value} label={item.label}>
                                <Tag color={item.value}>{item.label}</Tag>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="状态" name='status' valuePropName="checked"   rules={[{ required: true, message: '请输入状态' }]}>
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                <Form.Item label="备注" name='remark'>
                    <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder="一行一个指令" />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default DictDataModal;