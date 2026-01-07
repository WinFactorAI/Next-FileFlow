import { Form, Input, InputNumber, Modal, Switch, TreeSelect } from "antd";
import React, { useState } from 'react';
import { useQuery } from "react-query";
import userApi from "../../api/user";
import userGroupApi from "../../api/user-group";
import strings from "../../utils/strings";
const api = userGroupApi;

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

const UserGroupModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
}) => {

    const [form] = Form.useForm();

    useQuery('userGroupQuery', () => api.getById(id), {
        enabled: visible && strings.hasText(id),
        onSuccess: (data) => {
            data.members = data.members.map(item => item.id);
            data.status = data.status === "enabled" ? true : false;
            form.setFieldsValue(data);
        }
    });

    let usersQuery = useQuery('usersQuery', userApi.getAll, {
        enabled: visible,
    });

    let users = usersQuery.data || [];

    const [treeData, setTreeData] = useState([]);
    useQuery('treeData', () => api.getAll(), {
        enabled: visible,
        onSuccess: (data) => {
            const convertTreeData = (data) => {
                return data.map(item => ({
                    title: item.name,  // 将原始字段映射到 name
                    value: item.id,      // 映射到 id
                    children: item.subItems ? convertTreeData(item.subItems) : undefined
                }));
            };

            setTreeData(convertTreeData(data))
        }
    });

    const onChange = (newValue) => {
        // setValue(newValue);
    };
    return (
        <Modal
            title={id ? '更新用户组' : '新建用户组'}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        values.status = (values.status === true ? "enabled" : "disabled");
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


                <Form.Item label="父节点" name='parentId'  >
                    <TreeSelect
                        showSearch
                        treeData={treeData}
                        style={{
                            width: '100%',
                        }}
                        dropdownStyle={{
                            maxHeight: 400,
                            overflow: 'auto',
                        }}
                        placeholder="请选择父节点"
                        allowClear
                        treeDefaultExpandAll
                        onChange={onChange}

                    />
                </Form.Item>
                <Form.Item label="名称" name='name' rules={[{ required: true, message: '请输入用户组名称' }]}>
                    <Input autoComplete="off" placeholder="请输入用户组名称" />
                </Form.Item>

                <Form.Item label="顺序" name='sort' >
                    <InputNumber placeholder="请输入顺序" />
                </Form.Item>

                <Form.Item label="是否启用" name='status' valuePropName="checked" rules={[{ required: true, message: '请输入状态' }]}>
                    <Switch checkedChildren="启用" unCheckedChildren="禁用"  />
                </Form.Item>

                {/* <Form.Item label="用户组成员" name='members'>
                    <Select
                        showSearch
                        mode="multiple"
                        allowClear
                        placeholder='用户组成员'
                        filterOption={false}
                    >
                        {users.map(d => <Select.Option key={d.id}
                            value={d.id}>{d['nickname']}</Select.Option>)}
                    </Select>
                </Form.Item> */}
            </Form>
        </Modal>
    )
};

export default UserGroupModal;
