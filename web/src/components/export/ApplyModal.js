import { CloudUploadOutlined, FileDoneOutlined, FileUnknownOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Modal, Result, Select, Steps, Upload } from "antd";
import React, { useEffect, useState } from 'react';
import applyApi from "../../api/apply";
import dictDataApi from "../../api/dict-data";
import userApi from "../../api/user";
import workApplyApi from "../../api/worker/apply";
import { byteFormatter } from "../../utils/tools";
import UploadChunks from "../uploadChunks/index";
import ApplyPerson from "./ApplyPerson";
import DeviceSelect from "./DeviceSelect";
const { Dragger } = Upload;
const api = applyApi;
const { TextArea } = Input;
const ApplyModal = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    id,
    worker
}) => {
    const [form] = Form.useForm();
    const [deviceSelectVisible, setDeviceSelectVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [applyPersonVisible, setApplyPersonVisible] = useState(false);
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    const [isNextBtn, setIsNextBtn] = useState(false);
    const [resultStatus, setResultStatus] = useState("info");
    const [resultIcon, setResultIcon] = useState(<FileDoneOutlined />);
    const [resultTitle, setResultTitle] = useState("审批结果");
    const [resultSubTitle, setResultSubTitle] = useState("审批结果");

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
    };

    const [current, setCurrent] = useState(0);
    const [usersQuery,setUsersQuery] = useState([]);

    const fileSizeFormatter = (value) => {
        let flag = Number(value).toString() === "NaN";
        if (!flag) {
            return byteFormatter(value);
        }
        return value;
    }
    const onChange = (value) => {
        // setCurrent(value);
    };
    useEffect(() => {
        if (current === 2) {
            setIsEdit(true);
        } else {
            setIsEdit(false);
        }
    }, [current]);
    useEffect(() => {
        userApi.getAllUserByRole("approve-administrator").then(res => {
            setUsersQuery(res)
        })
        const getItem = async () => {
            setIsNextBtn(true)
            let data;
            if (worker === true) {
                data = await workApplyApi.getById(id);
            } else {
                data = await api.getById(id);
            }
            if (data) {
                // 1缓存状态
                if (data.status === "1") {
                    setCurrent(1)
                }
                if (data.status === "2") {
                    setCurrent(2)
                    setResultStatus("info");
                    setResultIcon(<FileUnknownOutlined />);
                    setResultTitle("待审批");
                    setResultSubTitle("等待审批");
                }
                if (data.status === "3") {
                    setCurrent(2)
                    setResultStatus("success");
                    setResultIcon(<FileDoneOutlined />);
                    setResultTitle("审批通过");
                    setResultSubTitle("审批建议审批通过");
                }
                form.setFieldsValue(data);
            }
        }

        if (visible) {
            dictDataApi.list("classificate").then(res => {
                setClassificationOptions(res)
            })
            if (id) {
                getItem();
            } else {
                setCurrent(0);
                form.setFieldsValue({});
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    const handleChange = (value) => {
        // console.log(`selected ${value}`);
    };


    return (
        <>
            <Modal
                className="responsive-modal"
                title={id ? '更新导出申请' : '新建导出申请'}
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
                footer={(
                    <>
                        <Button className={current === 0 ? "" : "result-hidden"}
                            onClick={() => {
                                setCurrent(current + 1);
                                setIsNextBtn(false);
                            }}
                            disabled={!isNextBtn}
                        >下一步</Button>
                        {/* <Button className={current === 1 ? "" : "result-hidden"}
                            onClick={() => {
                                // 草稿状态
                                form.setFieldValue("status", "1")
                                form
                                    .validateFields()
                                    .then(async values => {
                                        let ok = await handleOk(values);
                                        if (ok) {
                                            form.resetFields();
                                        }
                                    });
                            }}>
                            保存草稿
                        </Button> */}
                        <Button className={current === 1 ? "" : "result-hidden"}
                            key="submit" type="primary" onClick={() => {
                                // 待审批
                                form.setFieldValue("status", "2")
                                form
                                    .validateFields()
                                    .then(async values => {
                                        values.flag = "2";
                                        let ok = await api.approval(values);
                                        if (ok) {
                                            // form.resetFields();
                                            setCurrent(current + 1);
                                        }
                                    });
                            }} >
                            提交审批
                        </Button>
                        <Button key="cancel" onClick={handleCancel}>
                            取消
                        </Button>
                    </>
                )}
            >

                <Steps
                    current={current}
                    onChange={onChange}
                    items={[
                        {
                            title: '上传文件',
                            description: "本地上传文件",
                        },
                        {
                            title: '填写申请',
                            description: "填写导入申请信息",
                        },
                        {
                            title: '审批',
                            description: "审批结果",
                        },
                    ]}
                />
                <Divider />
                <Result className={current === 0 ? "" : "result-hidden"}
                    icon={<CloudUploadOutlined />}
                    title="请选择本地文件上传。"
                    subTitle="将本地文件导出刻录到光盘中。"
                >
                    <UploadChunks handleUpload={(rep) => {
                        console.log(" rep ", rep)
                        let chunkInfo = rep.data
                        form.setFieldValue("fileId", chunkInfo.fileId)
                        form.setFieldValue("attachment", chunkInfo.url)
                        form.setFieldValue("filePath", chunkInfo.url)
                        form.setFieldValue("targetPath", chunkInfo.filePath)
                        form.setFieldValue("fileName", chunkInfo.fileName)
                        form.setFieldValue("taskName", chunkInfo.fileName)
                        form.setFieldValue("fileSize", fileSizeFormatter(chunkInfo.fileSize))
                        form.setFieldValue("fileType", chunkInfo.fileType)
                        setIsNextBtn(true)
                    }}></UploadChunks>
                    {/* <Dragger {...props}>
                        <p className="ant-upload-text">单击或拖动文件到此区域进行上传</p>
                        <p className="ant-upload-hint">支持单文件上传zip/tar等 </p>
                    </Dragger> */}
                </Result>
                <Form form={form} {...formItemLayout} className={current === 1 || current === 2 ? "" : "result-hidden"}>
                    <Result className={current === 1 ? "" : "result-hidden"}
                        icon={<FileDoneOutlined />}
                        title="填写导入申请信息。"
                    ></Result>
                    <Result className={current === 2 ? "" : "result-hidden"}
                        status={resultStatus}
                        icon={resultIcon}
                        title={resultTitle}
                        subTitle={resultSubTitle}
                    ></Result>
                    <Form.Item name='id' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item name='status' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item name='filePath' noStyle>
                        <Input hidden={true} />
                    </Form.Item>

                    <Form.Item name='attachment' noStyle>
                        <Input hidden={true} />
                    </Form.Item>

                    <Form.Item name='targetPath' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item name='fileName' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item label="文件名" name='fileName' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入文件名" disabled={true} />
                    </Form.Item>

                    <Form.Item label="任务名称" name='taskName' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入任务名称" disabled={isEdit} />
                    </Form.Item>

                    <Form.Item label="信息去向" name='source' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入信息去向" disabled={isEdit} />
                    </Form.Item>

                    <Form.Item label="文件类别" name='classification' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Select defaultValue="请输入文件类别"
                            allowClear
                            onChange={handleChange}
                            options={classificationOptions}
                            disabled={isEdit}
                        />
                    </Form.Item>

                    <Form.Item label="文件大小" name='fileSize' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入文件大小" disabled={true} />
                    </Form.Item>

                    <Form.Item label="文件类型" name='fileType' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入文件类型" disabled={true} />
                    </Form.Item>

                    <Form.Item label="任务描述" name='taskDesc' >
                        <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder="一行一个指令" disabled={isEdit} />
                    </Form.Item>

                    <Form.Item label="审批人" name='approver' rules={[{ required: true, message: '请选择审批人' }]}>
                        <Select
                            style={{ width: `100%` }}
                            onChange={(value) => {
                            }}
                            allowClear
                            disabled={current === 2}>
                            {usersQuery?.map(item => {
                                return <Select.Option key={item.id} value={item.id}>{item.nickname}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>

                    <Form.Item label="抄送人" name='ccApprover'>
                        <Select
                            style={{ width: `100%` }}
                            onChange={(value) => {
                            }}
                            allowClear
                            disabled={current === 2}>
                            {usersQuery?.map(item => {
                                return <Select.Option key={item.id} value={item.id}>{item.nickname}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <ApplyPerson
                lastOwner={selectedRow?.owner}
                open={applyPersonVisible}
                handleOk={async (approver) => {
                    form.setFieldValue("approver", approver)
                    setApplyPersonVisible(false);
                }}
                handleCancel={() => {
                    setApplyPersonVisible(false);
                }} />

            <DeviceSelect
                open={deviceSelectVisible}
                handleOk={async (deviceId) => {
                    form.setFieldValue('deviceKey', deviceId)
                    setDeviceSelectVisible(false);
                }}
                handleCancel={() => {
                    setDeviceSelectVisible(false);
                }} />
        </>
    )
};

export default ApplyModal;