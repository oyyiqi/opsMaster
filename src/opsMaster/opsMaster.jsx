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

    componentDidMount() {
        this.handleClickMenu({ key: "scriptManage" });
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
            <Layout style={{ minHeight: '100vh', background: '#0f172a', border: '1px solid #1e293b' }}>
                <Sider width={150}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        items={[
                            { key: 'dataTable', label: FUNC_NAMES.dataTable },
                            { key: 'scriptManage', label: FUNC_NAMES.scriptManage, style: { backgroundColor: '#1890ff' } },
                            { key: 'taskManage', label: FUNC_NAMES.taskManage },
                            { key: 'logManage', label: FUNC_NAMES.logManage },
                        ]}
                        onClick={this.handleClickMenu}
                    >
                    </Menu>
                </Sider>
                {this.state.showScriptManage && <ScriptManage></ScriptManage>}
            </Layout>
        );
    }
}

export default OpsMaster;