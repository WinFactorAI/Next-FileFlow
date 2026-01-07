import { FireOutlined, HeartOutlined } from "@ant-design/icons";
import { Col, Descriptions, Layout, message, Row, Typography } from "antd";
import React, { Component } from 'react';
import request from "../../common/request";
import { getCurrentUser } from "../../service/permission";
import { renderSize } from "../../utils/utils";
import FileSystemSpace from "../devops/FileSystemSpace";

const { Content } = Layout;
const { Title } = Typography;

class MyFileShare extends Component {

    state = {
        storage: {}
    }

    componentDidMount() {
        this.getDefaultStorage();
    }

    getDefaultStorage = async () => {
        let result = await request.get(`/account/storage`);
        if (result.code !== 1) {
            message.error(result['message']);
            return;
        }
        this.setState({
            storage: result['data']
        })
    }

    render() {
        let storage = this.state.storage;
        // isAdmin() ? 'page-container' :
        // console.log(" storage ",storage);
        let contentClassName = 'page-container-user';
        return (
            <div>
                <Content key='page-container' className={[contentClassName]}>
                    <div >
                        <Row justify="space-around" align="middle" gutter={[12, 12]}>
                            <Col xs={24} sm={16} md={16} key={1}>
                                <Title level={4}>我的文件</Title>
                            </Col>
                            <Col xs={24} sm={8} md={8} key={2} style={{ textAlign: window.innerWidth < 576 ? 'left' : 'right', overflow: 'hidden' }}>
                                <Descriptions title="" column={{ xs: 1, sm: 2 }}>
                                    <Descriptions.Item label={<div><FireOutlined /> 大小限制</div>}>
                                        <strong>{storage['limitSize'] < 0 ? '无限制' : renderSize(storage['limitSize'])}</strong>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<div><HeartOutlined /> 已用大小</div>}>
                                        <strong>{renderSize(storage['usedSize'])}</strong>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </div>
                    <FileSystemSpace storageId={getCurrentUser()['id']}
                        storageType={'storages'}
                        callback={this.getDefaultStorage}
                        upload={this.state.storage['upload']}
                        download={storage['download']}
                        delete={storage['delete']}
                        rename={storage['rename']}
                        edit={storage['edit']}
                        minHeight={window.innerHeight - 203} />
                        {this.state.storage['upload']}
                </Content>
            </div>
        );
    }
}

export default MyFileShare;