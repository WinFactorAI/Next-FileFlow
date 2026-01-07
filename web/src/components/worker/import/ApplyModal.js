import { BugOutlined, CloudUploadOutlined, FileDoneOutlined, FileUnknownOutlined } from '@ant-design/icons';
import { Badge, Button, Divider, Form, Input, message, Modal, Result, Select, Space, Steps } from "antd";
import React, { useEffect, useState } from 'react';
import workApplyApi from "../../../api/worker/apply";
import workDeviceApi from "../../../api/worker/device";
import dictDataApi from "../../../api/worker/dict-data";
import workUserApi from "../../../api/worker/user";
import { byteFormatter } from "../../../utils/tools";
import FileTree from "../../import/FileTree";
import TaskProgress from "../../import/TaskProgress";
const api = workApplyApi;
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

    const [isLoading, setIsLoading] = useState(false);
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [approver, setApprover] = useState("");

    const [isNextBtn, setIsNextBtn] = useState(false);

    const [resultStatus, setResultStatus] = useState("info");
    const [resultIcon, setResultIcon] = useState(<FileDoneOutlined />);
    const [resultTitle, setResultTitle] = useState("审批结果");
    const [resultSubTitle, setResultSubTitle] = useState("审批结果");

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
    };

    const [currentDeviceKey, setCurrentDeviceKey] = useState("");
    const [usersQuery, setUsersQuery] = useState([]);
    const [deviceQuery, setDeviceOptions] = useState([]);

    useEffect(() => {
        workUserApi.getAllUserByRole("approve-administrator").then(res => {
            setUsersQuery(res)
        })

        workDeviceApi.getAll().then(res => {
            setDeviceOptions(res)
        })
        const getItem = async () => {
            setIsNextBtn(false)
            let data;
            if (worker === true) {
                data = await workApplyApi.getById(id);
            } else {
                data = await api.getById(id);
            }
            if (data) {

                // 1缓存状态
                if (data.status === "1") {
                    setCurrent(3)
                }
                if (data.status === "2") {
                    setCurrent(4)
                    setResultStatus("info");
                    setResultIcon(<FileUnknownOutlined />);
                    setResultTitle("待审批");
                    setResultSubTitle("等待审批");
                }
                if (data.status === "3") {
                    setCurrent(4)
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

    let [selectedRow, setSelectedRow] = useState(undefined);
    let [ccPersonVisible, setCCPersonVisible] = useState(false);
    const handleCCPerson = (row) => {
        setSelectedRow(row);
        setCCPersonVisible(true);
    }

    let [applyPersonVisible, setApplyPersonVisible] = useState(false);
    const handleApplyPerson = (row) => {
        setSelectedRow(row);
        setApplyPersonVisible(true);
    }
    let [taskProgressVisible, setTaskProgressVisible] = useState(false);
    let [fileTreeVisible, setFileTreeVisible] = useState(false);
    let [isView, setIsView] = useState(false);
    let [isDraft, setIsDraft] = useState(false);
    let [isClickSelectFile, setIsClickSelectFile] = useState(false);
    let [isSelectFile, setIsSelectFile] = useState(false);
    let [isAntiVirus, setIsAntiVirus] = useState(false);

    let [isUploadFile, setIsUploadFile] = useState(false);

    let [selectFileTitle, setSelectFileTitle] = useState('选择目标路径');
    const [selectedPath, setSelectedPath] = useState('');

    const [openSelectFileDialog, setOpenSelectFileDialog] = useState(false);
    const [pathOptions, setPathOptions] = useState([]);

    let [redTip, setRedTip] = useState(false);
    let [tip, setTip] = useState('');
    let fileTimer = null;

    const setSelectFileTime = () => {
        fileTimer = setInterval(() => {
            const id = form.getFieldValue('id')
            if (id) {
                workApplyApi.getSelectFileInfo(id).then(response => {
                    let data = response;
                    // console.log(" applyApi.getSelectFileInfo data ", data)
                    if (data.discStatus !== "16") {
                        if (data.discStatus === "15") {
                            setRedTip(true)
                        } else {
                            setRedTip(false)
                        }
                        setIsLoading(false)
                        setTip(response.msg)
                        // console.log(" data.file_list ", data.file_list)
                        setPathOptions(JSON.parse(data.file_list != null ? data.file_list : []))
                        setSelectFileTitle('选择目标路径')
                        setOpenSelectFileDialog(true)
                        // this.isAntiVirus = true;
                        clearInterval(fileTimer);// 清除定时器
                        fileTimer = null;
                    }
                });
            } else {
                clearInterval(fileTimer);
            }
        }, 5000)
    }
    const [deviceSelectVisible, setDeviceSelectVisible] = useState(false);
    const [deviceSelectTitle, setDeviceSelectTitle] = useState("选择设备");
    const handleSelectFile = () => {
        // setDeviceSelectVisible(true)
        setIsLoading(true)
        setIsClickSelectFile(true)
        workApplyApi.getImportDevice().then(response => {
            let devices = response
            if (devices.length === 1 || form.getFieldValue('deviceKey') !== "") {
                form.setFieldValue('deviceKey', devices[0].id)
                workApplyApi.selectFile({ 'deviceKey': devices[0].id }).then(response => {
                    message.info("新增获取光盘文件列表任务成功");
                    // console.log(" ###response", response)
                    form.setFieldValue('id', response)
                    setDeviceSelectVisible(false)
                    setRedTip(false)
                    setTip("获取光盘文件列表中")
                    setSelectFileTime()
                })
            } else if (devices.length > 1) {
                setDeviceSelectTitle("选择设备")
                setDeviceSelectVisible(true)
            }
        })
    }


    let [openTaskSuccessDialog, setOpenTaskSuccessDialog] = useState(false);
    let [taskTitle, setTaskTitle] = useState('');
    let [percentAntiVirus, setPercentAntiVirus] = useState(0);

    const submitAntiVirus = () => {
        setIsLoading(true)
        setOldAntiVirusStatus("");
        setTaskStatus(null);
        setTaskStatusTip("");
        setIsCanClose(false);
        let params = {
            id: form.getFieldValue('id'),
            deviceKey: form.getFieldValue('deviceKey'),
            targetPath: form.getFieldValue('targetPath'),
            taskType: form.getFieldValue('taskType'),
        }
        workApplyApi.antiVirus(params).then(response => {
            setRedTip(false);
            message.info("新增杀毒任务成功");
            setTip("杀毒中");
            setTaskProgressVisible(true);
            setPercentAntiVirus(0);
            setTaskTitle("杀毒进度");
            setAntiVirusTime();
        });
    }


    const [taskStatusTip, setTaskStatusTip] = useState("");
    const [taskStatus, setTaskStatus] = useState("exception");
    const [isCanClose, setIsCanClose] = useState(false);
    const [oldAntiVirusStatus, setOldAntiVirusStatus] = useState(null);
    let antiVirusTimer = null;
    const setAntiVirusTime = () => {
        antiVirusTimer = setInterval(() => {
            const id = form.getFieldValue('id')
            if (id) {
                workApplyApi.getById(id).then(response => {
                    let data = response;
                    if (data.discStatus !== oldAntiVirusStatus) {
                        setOldAntiVirusStatus(data.discStatus);

                        if (data.discStatus === "11") {
                            setPercentAntiVirus(50);
                            setTaskStatusTip("11: 杀毒中");
                        } else if (data.discStatus === "12") {
                            setTaskStatusTip(prev => prev + "12 杀毒完成");
                            setTaskStatus("success");
                            setIsLoading(false)
                            setIsNextBtn(true);
                        } else if (data.discStatus === "13") {
                            setTaskStatusTip(prev => prev + "13 高危风险项待人工处理");
                            setTaskStatus("exception");
                            setIsLoading(false)
                        } else if (data.discStatus === "0") {
                            setTaskStatusTip("0: 待插入光盘");
                            setTaskStatus("exception");
                        } else if (data.discStatus === "8") {
                            setTaskStatusTip("8: 光盘状态异常");
                            setTaskStatus("exception");
                            setIsLoading(false)
                        } else if (data.discStatus === "20") {
                            setTaskStatusTip("20: 杀毒失败，可能与配置有关");
                            setTaskStatus("exception");
                            setIsLoading(false)
                        }
                        if (["0", "8", "12", "13", "20"].includes(data.discStatus)) {
                            setPercentAntiVirus(100);
                            // setIsCanClose(true);
                            setIsLoading(false)
                            clearInterval(antiVirusTimer);
                            antiVirusTimer = null;
                        }
                        setRedTip(["13", "20"].includes(data.discStatus));
                    }
                });
            } else {
                clearInterval(antiVirusTimer);
            }
        }, 5000)
    }


    const [oldUploadStatus, setOldUploadStatus] = useState(null);
    const [domainUrl, setDomainUrl] = useState("");
    let [percentUpload, setPercentUpload] = useState(0);
    const submitUpload = () => {
        const targetPath = form.getFieldValue('targetPath')
        const fileName = targetPath.substring(targetPath.lastIndexOf("/") + 1, targetPath.length);
        // console.log(" ###fileName", fileName)
        form.setFieldValue('fileName', fileName);
        setOldUploadStatus("");
        setTaskStatus(null);
        setTaskStatusTip("");
        // setIsCanClose(false);
        setIsLoading(true)

        workApplyApi.uploadFile(form.getFieldsValue()).then(response => {
            setDomainUrl(response.domainUrl);
            form.setFieldValue('filePath', response.filePath);
            setRedTip(false);
            message.info("新增上传文件中任务成功");
            setTip("上传文件中");
            // setOpenTaskSuccessDialog(true);
            setTaskProgressVisible(true);
            setPercentUpload(0);
            setTaskTitle("上传进度");
            setUploadFileTime();
        });
    };


    let uploadFileTimer = null;
    const setUploadFileTime = () => {
        uploadFileTimer = setInterval(() => {
            const id = form.getFieldValue("id")
            if (id) {
                workApplyApi.getById(id).then(response => {
                    let data = response;
                    if (data.discStatus !== oldUploadStatus) {
                        setOldUploadStatus(data.discStatus);

                        if (data.discStatus === "3") {
                            setPercentUpload(50);
                            setTaskStatusTip("3: 上传文件中");
                            setIsUploadFile(false);
                        } else if (data.discStatus === "1") {
                            setTaskStatusTip(prev => prev + "1 上传文件成功");
                            setTaskStatus("success");
                            setIsUploadFile(true);
                            setIsLoading(false)
                            setIsNextBtn(true);
                        } else if (data.discStatus === "2") {
                            setTaskStatusTip(prev => prev + "2 上传文件失败");
                            setTaskStatus("exception");
                            setIsUploadFile(false);
                            setIsLoading(false)
                        } else if (data.discStatus === "0") {
                            setTaskStatusTip("0: 待插入光盘");
                            setTaskStatus("exception");
                            setIsUploadFile(false);
                            setIsLoading(false)
                        } else if (data.discStatus === "8") {
                            setTaskStatusTip("8: 光盘状态异常");
                            setTaskStatus("exception");
                            setIsUploadFile(false);
                            setIsLoading(false)
                        } else if (data.discStatus === "10") {
                            setTaskStatusTip("10: 读取文件失败");
                            setTaskStatus("exception");
                            setIsUploadFile(false);
                            setIsLoading(false)
                        }

                        if (["0", "1", "2", "8", "10"].includes(data.discStatus)) {
                            setPercentUpload(100);
                            setIsLoading(false)
                            setTip(response.msg);
                            let taskName = form.getFieldValue("fileName");
                            let fileType = taskName.substring(taskName.lastIndexOf("/") + 1, taskName.length);
                            form.setFieldsValue({
                                attachment: domainUrl + form.getFieldValue("filePath"),
                                fileSize: data.fileSize,
                                fileSizeStr: fileSizeFormatter(data.fileSize),
                                taskName: taskName,
                                fileType: data.taskType === "1" ? "zip" : fileType,
                            })
                            clearInterval(uploadFileTimer);
                            uploadFileTimer = null;
                        }
                        setRedTip(data.discStatus === "2");
                    }
                });
            } else {
                clearInterval(uploadFileTimer);
            }
        }, 5000);
    };
    const fileSizeFormatter = (value) => {
        let flag = Number(value).toString() === "NaN";
        if (!flag) {
            return byteFormatter(value);
        }
        return value;
    }

    const handleChange = (value) => {
        // console.log(`selected ${value}`);
    };

    const cancelAll = () => {
        if (uploadFileTimer) {
            clearInterval(uploadFileTimer);
        }
        if (antiVirusTimer) {
            clearInterval(antiVirusTimer);
        }
        if (fileTimer) {
            clearInterval(fileTimer);
        }
    }

    const [current, setCurrent] = useState(0);
    const onChange = (value) => {
        // console.log('onChange:', current);
        // setCurrent(value);
    };

    return (
        <>
            {/* {
                isLoading &&
                <div className="loading-box">
                    <Spin tip="正在获取光驱列表中文件数据..." >
                    </Spin>
                </div>
            } */}

            <Modal
                className="responsive-modal"
                title={id ? '更新导入申请' : '新建导入申请'}
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
                    cancelAll();
                    handleCancel();
                }}
                confirmLoading={confirmLoading}
                okText='确定'
                cancelText='取消'
                footer={(
                    <Space>
                        <Button className={current === 0 || current === 1 || current === 2 ? "" : "result-hidden"}
                            onClick={() => {
                                setCurrent(current + 1);
                                setIsNextBtn(false);
                            }}
                            disabled={!isNextBtn}
                        >下一步</Button>
                        <Space className={current === 3 ? "" : "result-hidden"}>
                            {/* <Button
                                // disabled={!isUploadFile && !isDraft}
                                onClick={() => {
                                    form.setFieldValue('status', "1");
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
                            <Button key="submit" type="primary"
                                onClick={() => {
                                    form.setFieldValue('status', "2");
                                    form
                                        .validateFields()
                                        .then(async values => {
                                            let ok = await api.approval(values);
                                            if (ok) {
                                                setCurrent(current + 1);
                                                setIsView(true);
                                            }
                                        });
                                }} >
                                提交审批
                            </Button>
                            {/* <Button key="submit" className="btn-cc-personnel"
                                disabled={!isUploadFile && !isDraft}
                                onClick={handleCCPerson} >
                                抄送人员
                            </Button> */}
                        </Space>
                        <Button key="cancel" onClick={() => {
                            setCurrent(0);
                            form.resetFields();
                            handleCancel();
                        }}>
                            取消
                        </Button>
                    </Space>
                )}
            >
                <Steps
                    current={current}
                    onChange={onChange}
                    items={[
                        {
                            title: '选择文件',
                            description: "终端光驱文件",
                        },
                        {
                            title: '杀毒',
                            description: "终端杀毒软件",
                        },
                        {
                            title: '上传文件',
                            description: "文件上传到服务器",
                        },
                        {
                            title: '提交申请',
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
                    icon={<FileDoneOutlined />}
                    title="选择终端设备光驱文件或文件话。"
                    subTitle="请把光盘文件放到光驱中。"
                    extra={
                        <Space direction="vertical">
                            <Select
                                placeholder="请选择终端设备"
                                style={{ width: `100%` }}
                                allowClear
                                onChange={(value) => {
                                    form.setFieldValue('deviceKey', value);
                                    setCurrentDeviceKey(value)
                                }}>
                                {deviceQuery?.map(item => {
                                    return <Select.Option key={item.id} value={item.id}>
                                        <Space>
                                            {item.name} -
                                            {item.status === "0" ? <Badge status="success" text='在线' /> : <Badge status="error" text='离线' />}
                                        </Space>
                                    </Select.Option>
                                })}
                            </Select>
                            <Button loading={isLoading} type="primary" onClick={handleSelectFile} disabled={!currentDeviceKey}>选择导入文件</Button>
                        </Space>
                    }
                >
                    <FileTree
                        data={pathOptions}
                        open={openSelectFileDialog}
                        handleOk={async (selectedPath, taskType) => {
                            if (selectedPath) {
                                form.setFieldValue('targetPath', selectedPath)
                                form.setFieldValue('taskType', taskType)
                                // setSelectedPath(selectedPath)
                                setOpenSelectFileDialog(false);
                                setIsSelectFile(true)
                                setIsNextBtn(true)
                            } else {
                                message.error('请选择目标路径')
                            }
                        }}
                        handleCancel={() => {
                            setOpenSelectFileDialog(false);
                        }} />
                </Result>
                <Result className={current === 1 ? "" : "result-hidden"}
                    icon={<BugOutlined />}
                    title="启动杀毒程序!进行安全扫描。"
                    extra={<Button loading={isLoading} type="primary" onClick={submitAntiVirus}>杀毒</Button>}
                >
                    <div className="desc">
                        <TaskProgress
                            title="杀毒进度"
                            taskStatusTip={taskStatusTip}
                            taskStatus={taskStatus}
                            percent={percentAntiVirus} />
                    </div>
                </Result>
                <Result className={current === 2 ? "" : "result-hidden"}
                    icon={<CloudUploadOutlined />}
                    title="将文件上传到服务器。待审核审批。"
                    extra={<Button loading={isLoading} type="primary" onClick={submitUpload}>上传到服务器</Button>}
                >
                    <TaskProgress
                        title="上传进度"
                        taskStatusTip={taskStatusTip}
                        taskStatus={taskStatus}
                        percent={percentUpload}
                    />
                </Result>
                <Form form={form} {...formItemLayout} className={current === 3 || current === 4 ? "" : "result-hidden"}>
                    <Result className={current === 3 ? "" : "result-hidden"}
                        icon={<FileDoneOutlined />}
                        title="填写导入申请信息。"
                    ></Result>
                    <Result className={current === 4 ? "" : "result-hidden"}
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
                    {/* <Form.Item name='approver' noStyle>
                        <Input hidden={true} />
                    </Form.Item> */}
                    <Form.Item name='sendPerson' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item name='deviceKey' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item name='taskType' noStyle>
                        <Input hidden={true} />
                    </Form.Item>
                    <Form.Item name='fileName' noStyle>
                        <Input hidden={true} />
                    </Form.Item>

                    {/* <Form.Item label="选择附件" name='name'>
                        <Input placeholder="请输入指令名称" hidden={true} />
                        <Space direction="vertical">
                            <Space>
                                <Button disabled={isView || isDraft || isClickSelectFile} onClick={handleSelectFile}>选择文件</Button>
                                <Button className="btn-anti-virus" disabled={isView || !isSelectFile} onClick={submitAntiVirus}>杀毒</Button>
                                <Button className="btn-upload-service" disabled={isView || !isAntiVirus} onClick={submitUpload}>上传到服务器</Button>
                                <Tooltip title="提示：请先选择要导入的文件->再进行杀毒->最后点击上传到服务器，填写基本信息再提交！">
                                    <Typography.Link> <InfoCircleOutlined /></Typography.Link>
                                </Tooltip>
                            </Space>
                            <Space>
                                {
                                    redTip ? (
                                        <span style={{ color: "red" }}>{tip}</span>
                                    ) : (
                                        <span>{tip}</span>
                                    )
                                }
                            </Space>
                        </Space>
                    </Form.Item> */}
                    <Form.Item label="目标路径" name='targetPath' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入目标路径" disabled={true} readOnly={true} />
                    </Form.Item>
                    <Form.Item label="任务名称" name='taskName' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入任务名称" disabled={current === 4} />
                    </Form.Item>
                    <Form.Item label="信息来源" name='source' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入信息来源" disabled={current === 4} />
                    </Form.Item>
                    <Form.Item label="文件类别" name='classification' rules={[{ required: true, message: '请输入指令名称' }]}>
                        {/* <Input placeholder="请输入文件类别" /> */}
                        <Select defaultValue="请输入文件类别"
                            allowClear
                            onChange={handleChange}
                            options={classificationOptions}
                            disabled={current === 4}
                        />
                    </Form.Item>
                    <Form.Item label="文件大小" name='fileSize' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入文件大小" disabled={true} />
                    </Form.Item>
                    <Form.Item label="文件类型" name='fileType' rules={[{ required: true, message: '请输入指令名称' }]}>
                        <Input placeholder="请输入文件类型" disabled={true} />
                    </Form.Item>
                    <Form.Item label="任务描述" name='taskDesc'>
                        <TextArea autoSize={{ minRows: 5, maxRows: 10 }} placeholder="一行一个指令" disabled={current === 4} />
                    </Form.Item>
                    <Form.Item label="审批人" name='approver' rules={[{ required: true, message: '请选择审批人' }]}>
                        <Select
                            style={{ width: `100%` }}
                            onChange={(value) => {
                                // form.setFieldValue("status", "2")
                                // form.setFieldValue("approver", owner)
                                setIsNextBtn(true);
                            }}
                            disabled={current === 4}>
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
                            disabled={current === 4}>
                            {usersQuery?.map(item => {
                                return <Select.Option key={item.id} value={item.id}>{item.nickname}</Select.Option>
                            })}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>



            {/* <CCPerson
                // lastOwner={selectedRow?.owner}
                open={ccPersonVisible}
                handleOk={async (owner) => {
                    form.setFieldValue("status", "3")
                    form.setFieldValue("sendPerson", owner)
                    let success = await api.updateById(form.getFieldValue("id"), form.getFieldsValue());
                    if (success) {
                        setCCPersonVisible(false);
                    }
                }}
                handleCancel={() => {
                    setCCPersonVisible(false);
                }} /> */}

            {/* <DeviceSelect
                open={deviceSelectVisible}
                handleOk={async (deviceId) => {
                    form.setFieldValue('deviceKey', deviceId)
                    setDeviceSelectVisible(false);
                }}
                handleCancel={() => {
                    setDeviceSelectVisible(false);
                }} /> */}

        </>

    )
};

export default ApplyModal;