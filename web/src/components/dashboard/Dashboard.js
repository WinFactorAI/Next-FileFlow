import { Column, Line, Pie } from '@ant-design/charts';
import { DesktopOutlined, DisconnectOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
// import { Column } from '@ant-design/plots';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Col, Row, Segmented, } from 'antd';
import React, { Component } from 'react';
import dictDataApi from "../../api/dict-data";
import request from "../../common/request";
import './Dashboard.css';
class Dashboard extends Component {
    constructor(props) {
        super(props);
        // 绑定事件处理函数
        this.handleResize = this.handleResize.bind(this);
    }
    state = {
        counter: {
            onlineUser: 0,
            totalUser: 0,
            activeAsset: 0,
            totalAsset: 0,
            failLoginCount: 0,
            offlineSession: 0,
        },
        asset: {
            "ssh": 0,
            "rdp": 0,
            "vnc": 0,
            "telnet": 0,
            "kubernetes": 0,
        },
        fileTypeData: [],
        dateCounter: [],
        dateApplyCounter: [],
        isMini: false, // 初始状态
        fileExtensionOptions: []
    }

    componentDidMount() {
        dictDataApi.list("file_extension").then(res => {
            this.setState({
                fileExtensionOptions: res
            })
        })
        this.getCounter();
        // this.getAsset();
        this.getFileType();
        this.getDateCounter('week');
        this.getDateApplyCounter('week');
        window.addEventListener('resize', this.handleResize);
        this.handleResize(); // 初始化时立即执行

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({
            isMini: window.innerWidth <= 768
        });
    }
    getCounter = async () => {
        let result = await request.get('/overview/counter');
        if (result['code'] === 1) {
            this.setState({
                counter: result['data']
            })
        }
    }

    getDateCounter = async (d) => {
        let result = await request.get('/overview/date-counter?d=' + d);
        if (result['code'] === 1) {
            this.setState({
                dateCounter: result['data']
            })
        }
    }

    getDateApplyCounter = async (d) => {
        let result = await request.get('/overview/date-apply?d=' + d);
        if (result['code'] === 1) {
            this.setState({
                dateApplyCounter: result['data']
            })
        }
    }

    getAsset = async () => {
        let result = await request.get('/overview/asset');
        if (result['code'] === 1) {
            this.setState({
                asset: result['data']
            })
        }
    }

    getFileType = async () => {
        let result = await request.get('/overview/file-type');
        if (result['code'] === 1) {
            if (result['data'].length === 0) {
                const initData = this.fileExtensionOptions.array.map(element => ({
                    file_type: element.dict_value,
                    count: 0
                }));
                this.setState({
                    fileTypeData: initData
                })
            } else {
                this.setState({
                    fileTypeData: result['data']
                })
            }

        }
    }
    handleChangeDateCounter = (value) => {
        if (value === '按周') {
            this.getDateCounter('week');
        } else {
            this.getDateCounter('month');
        }
    }
    handleChangeDateApplyCounter = (value) => {
        if (value === '按周') {
            this.getDateApplyCounter('week');
        } else {
            this.getDateApplyCounter('month');
        }
    }

    render() {
        const { isMini } = this.state;
        const assetData = [
            {
                type: 'RDP',
                value: this.state.asset['rdp'],
            },
            {
                type: 'SSH',
                value: this.state.asset['ssh'],
            },
            {
                type: 'TELNET',
                value: this.state.asset['telnet'],
            },
            {
                type: 'VNC',
                value: this.state.asset['vnc'],
            },
            {
                type: 'Kubernetes',
                value: this.state.asset['kubernetes'],
            }
        ];
        const assetConfig = {
            width: 200,
            height: 200,
            innerWidth: 160,  // 实际绘图区宽度
            innerHeight: 160, // 实际绘图区高度
            appendPadding: 0,
            data: this.state.fileTypeData,
            angleField: 'count',
            colorField: 'file_type',
            radius: 1,
            innerRadius: 0.6,
            label: {
                type: 'inner',
                offset: '-50%',
                content: '{value}',
                style: {
                    textAlign: 'center',
                    fontSize: 14,
                },
            },
            interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
            statistic: {
                title: false,
                content: {
                    formatter: () => {
                        return '文件类型';
                    },
                    style: {
                        fontSize: 18,
                    }
                },
            },
        };

        const dateCounterBarConfig = {
            data: this.state.dateApplyCounter,
            xField: 'date',
            yField: 'value',
            seriesField: 'type',
            isGroup: true,
            colorField: 'type',

            // 样式调整
            dodgePadding: 8,
            intervalPadding: 30,
            columnWidth: 30,

            // 坐标轴
            xAxis: {
                //   label: { rotate: 45, offset: 30 }
            },

            // 提示信息
            tooltip: {
                shared: true,
                showMarkers: true
            }
        };

        const dateCounterConfig = {
            height: 270,
            data: this.state.dateCounter,
            xField: 'date',
            yField: 'value',
            seriesField: 'type',
            legend: {
                position: 'top',
            },
            smooth: true,
            animation: {
                appear: {
                    animation: 'path-in',
                    duration: 5000,
                },
            },
        };

        return (<>
            <div style={{ margin: 16 }}>
                <ProCard
                    title="数据概览"
                    // extra={dayjs().format("YYYY[年]MM[月]DD[日]") + ' 星期' + weekMapping[dayjs().day()]}
                    split={'horizontal'}
                    headerBordered
                    bordered
                >
                    {/* <ProCard split={'vertical'}> */}
                    <Row gutter={16}>
                        <Col xs={24} sm={16} md={16} lg={16} xl={16} className='row-col-right'>
                            <ProCard split="horizontal" >
                                <ProCard split='vertical'>
                                    <StatisticCard
                                        statistic={{
                                            title: '在线用户',
                                            value: this.state.counter['onlineUser'] + '/' + this.state.counter['totalUser'],
                                            prefix: <UserOutlined />
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: '终端设备',
                                            value: this.state.counter['deviceActiveCount'] + '/' + this.state.counter['deviceCount'],
                                            prefix: <DesktopOutlined />
                                        }}
                                    />
                                    {!isMini && <StatisticCard
                                        statistic={{
                                            title: '任务',
                                            value: this.state.counter['taskProcessActiveCount'] + '/' + this.state.counter['taskProcessCount'],
                                            prefix: <DesktopOutlined />
                                        }}
                                    />}
                                </ProCard>
                                {isMini && <ProCard split='vertical'>
                                    <StatisticCard
                                        statistic={{
                                            title: '任务',
                                            value: this.state.counter['taskProcessActiveCount'] + '/' + this.state.counter['taskProcessCount'],
                                            prefix: <DesktopOutlined />
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: '登录失败次数',
                                            value: this.state.counter['failLoginCount'],
                                            prefix: <LoginOutlined />
                                        }}
                                    />

                                </ProCard>}
                                <ProCard split='vertical'>
                                    {!isMini && <StatisticCard
                                        statistic={{
                                            title: '登录失败次数',
                                            value: this.state.counter['failLoginCount'],
                                            prefix: <LoginOutlined />
                                        }}
                                    />}
                                    <StatisticCard
                                        statistic={{
                                            title: '导入申请',
                                            value: this.state.counter['importCount'],
                                            prefix: <DisconnectOutlined />
                                        }}
                                    />
                                    <StatisticCard
                                        statistic={{
                                            title: '导出申请',
                                            value: this.state.counter['exportCount'],
                                            prefix: <DisconnectOutlined />
                                        }}
                                    />
                                </ProCard>

                            </ProCard>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={8} className='row-col-left'>
                            <ProCard className='pie-card'>
                                <ProCard>
                                    <Pie {...assetConfig} style={{ padding: '10px' }} />
                                </ProCard>
                            </ProCard>
                        </Col>
                    </Row>
                    {/* </ProCard> */}


                </ProCard>

                <ProCard title="会话统计" style={{ marginTop: 16 }}
                    extra={<Segmented options={['按周', '按月']} onChange={this.handleChangeDateCounter} />}>
                    <Line {...dateCounterConfig} />
                </ProCard>
                <ProCard title="申请统计" style={{ marginTop: 16 }}
                    extra={<Segmented options={['按周', '按月']} onChange={this.handleChangeDateApplyCounter} />}>
                    <Column {...dateCounterBarConfig} />
                </ProCard>
            </div>
        </>);
    }
}

export default Dashboard;
