import { Button, Checkbox, Col, Drawer, message, Row, Select, Space, Spin, Typography } from "antd";
import React, { useEffect, useRef, useState } from 'react';
import applyApi from "../../api/apply";
import dictDataApi from "../../api/dict-data";
import FileShare from "./FileShare";
import SensitiveLog from "./SensitiveLog";
import SensitiveRuleList from "./SensitiveRuleList";


const { Title } = Typography;

const actionRef = React.createRef();

const SensitiveRuleDrawer = ({
    visible,
    handleOk,
    handleCancel,
    confirmLoading,
    type,
}) => {

    let [visibleModal, setVisibleModal] = useState(false);
    let [confirmLoadingModal, setConfirmLoadingModal] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    let [rows, setRows] = useState([]);
    const plainOptions = ['敏感规则引擎', 'AI大模型引擎'];
    const [checkedList, setCheckedList] = useState('敏感规则引擎');
    const onChange = (checkedValues) => {
        console.log('checked = ', checkedValues);
        setCheckedList(checkedValues)
    };
    const [fileExtensionOptions, setFileExtensionOptions] = useState([]);
    const [fileExtension, setFileExtension] = useState("");
    useEffect(() => {
        dictDataApi.list("file_extension").then(res => {
            setFileExtensionOptions(res)
        })
    }, [])
    const handleChange = (value) => {
        // console.log(`selected ${value}`);
        setFileExtension(value)
    };
    const addRows = (selectedRows) => {
        selectedRows.forEach(selectedRow => {
            let exist = rows.some(row => {
                return row.id === selectedRow.id;
            });
            if (exist === false) {
                rows.push(selectedRow);
            }
        });
        setRows(rows.slice());
    }

    const removeRows = (selectedRows) => {
        selectedRows.forEach(selectedRow => {
            rows = rows.filter(row => row.id !== selectedRow.id);
        });
        setRows(rows.slice());
    }

    const removeRow = (rowKey) => {
        let items = rows.filter(row => row.id !== rowKey);
        setRows(items.slice());
    }

    useEffect(() => {
        console.log(" visible ", visible);
        console.log(" type ", type);
        // if (visible) {
        //     actionRef.current.reload();
        // }
        // if (visible) {
        //     actionRef.current.setPageInfo({     // 分页重置
        //         current: 1,
        //         pageSize: 10
        //     });
        //     actionRef.current.clearSelected();  // 清空选择
        //     actionRef.current.reload();         // 数据刷新

        // }
    }, [type, visible]);
    const [loading, setLoading] = useState(false);
    const [batchId, setBatchId] = useState('');
    const [path, setPath] = useState('');

    const currentPathFileCallback = (path) => {
        setPath(path)
    }
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);
    const onReload = () => {
        setLoading(false)
        clearTimeout(timerRef.current);
    }
    const handleScan = () => {
        if (fileExtension.length === 0) {
            message.error('请选择文件扩名');
            return;
        }
        if (checkedList.length === 0) {
            message.error('请选择要扫描规则引擎');
            return;
        }
        // 定时器 1分钟后执行
        const timestamp = new Date().getTime();
        applyApi.sensitiveTestScan({
            'batchId': timestamp + "",
            'path': path,
            'fileExtension': fileExtension.join(","),
            'engine': checkedList,
        }).then(res => {
            // actionRef.current.reload();
            console.log(res)
            if (res.batchId !== undefined) {
                setBatchId(res.batchId)
                setLoading(true)
                timerRef.current = setTimeout(() => {
                    setLoading(false)
                    clearTimeout(timerRef.current);
                }, 50000);
            }
        })

    };
    const [width, setWidth] = useState('60%');

    // 动态更新宽度
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) { // 判断屏幕宽度
                setWidth('100%');
            } else {
                setWidth('60%');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始时执行一次

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (
        <div>
            <Drawer
                title="规则模型校验器"
                visible={visible}
                width={width}
                centered={true}
                onOk={() => {
                    handleOk(rows);
                }}
                // onCancel={handleCancel}
                closable={true}
                maskClosable={true}
                onClose={() => {
                    handleCancel()
                }}
                extra={
                    <Space wrap style={{ width: '100%' }}  >
                        <Button type="primary" onClick={handleScan} loading={loading}>扫描</Button>
                    </Space>
                }
            >
                <Spin spinning={loading} tip="正在扫描中..." >
                    <div style={{ marginTop: '.5em' }}>
                        <Row justify="space-around" align="middle" gutter={[12, 12]}>
                            <Col xs={24} sm={24} md={24} key={1}>
                                <Title level={4}>引擎选项</Title>
                            </Col>

                        </Row>
                    </div>
                    <div style={{ margin: '10px' }}>

                        <Row gutter={[24, 16]} >
                            <Col xs={24} lg={12} xl={18} xxl={18}>
                                <Select
                                    mode="tags"
                                    style={{
                                        width: '100%',
                                    }}
                                    className="responsive-select"
                                    placeholder="请选择包含的文件类型"
                                    onChange={handleChange}
                                    options={fileExtensionOptions}
                                />
                            </Col>
                            <Col xs={24} lg={12} xl={6} xxl={6}>
                                <Checkbox.Group
                                    options={plainOptions}
                                    defaultValue={['敏感规则引擎']}
                                    onChange={onChange}
                                    loading={loading}
                                    style={{
                                        flexWrap: 'wrap', // 自动换行
                                        gap: '8px'
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <FileShare currentPathFileCallback={currentPathFileCallback} />
                    <SensitiveRuleList />
                    <SensitiveLog batchId={batchId} loading={loading} onReload={onReload} />
                </Spin>
            </Drawer>


        </div>
    );
};

export default SensitiveRuleDrawer;