import { Layout, Menu } from "antd";
import React, { Component } from "react";
import ScriptManage from "./scriptManage";
import "./opsMaster.css"

const { Sider } = Layout;

const FUNC_NAMES = {
    dataTable: "仪表盘",
    scriptManage: "脚本管理",
    taskManage: "任务管理",
    logManage: "日志管理",
}

class OpsMaster extends Component {


    // state = {
    // }

    constructor(props) {
        super(props);
        this.state = {
            showScriptManage: false,
        }
    }

    handleClickMenu = (item) => {
        console.log(item)
        if (item.key === "dataTable") {
            this.setState({ showScriptManage: true })
        }
        if (item.key === "scriptManage") {
            this.setState({ showScriptManage: true })
        }
        if (item.key === 'taskManage') {
            this.setState({ showScriptManage: true })
        }
        if (item.key === 'logManage') {
            this.setState({ showScriptManage: true })
        }
    }

    render() {
        const { enterAction } = this.props;
        console.log(enterAction);
        return (
            // <div>hello</div>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['2']}
                        items={[
                            { key: 'dataTable', label: FUNC_NAMES.dataTable },
                            { key: 'scriptManage', label: FUNC_NAMES.scriptManage, style: { backgroundColor: '#1890ff' } },
                            { key: 'taskManage', label: FUNC_NAMES.taskManage },
                            { key: 'logManage', label: FUNC_NAMES.logManage },
                        ]}
                        style={{ flex: 1, minWidth: 0 }}
                        onClick={this.handleClickMenu}
                    >
                    </Menu>
                </Sider>
                <Layout>
                    {this.state.showScriptManage && <ScriptManage></ScriptManage>}
                </Layout>
            </Layout>
        );
    }
}

export default OpsMaster;