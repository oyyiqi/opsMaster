import { Layout, Menu } from "antd";
import React, { Component } from "react";
import ScriptManage from "./scriptManage";
import TaskManage from "./taskManage";
import "./dark.less";
import "./common.less";
import { LayoutDashboard, FileCode, CalendarClock, ScrollText, Settings, Activity, Zap } from 'lucide-react';

const { Sider } = Layout;

const FUNC_NAMES = {
  dataTable: "仪表盘",
  scriptManage: "脚本管理",
  taskManage: "任务管理",
  logManage: "日志管理",
};

class OpsMaster extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showScriptManage: false,
      showTaskManage: false,
    };
  }

  componentDidMount() {
    this.handleClickMenu({ key: "taskManage" });
  }

  handleClickMenu = (item) => {
    console.log(item);
    if (item.key === "dataTable") {
      this.setState({ showScriptManage: true, showTaskManage: false });
    }
    if (item.key === "scriptManage") {
      this.setState({ showScriptManage: true, showTaskManage: false });
    }
    if (item.key === "taskManage") {
      this.setState({ showTaskManage: true, showScriptManage: false });
    }
    if (item.key === "logManage") {
      this.setState({ showScriptManage: true, showTaskManage: false });
    }
  };

  render() {
    const { enterAction } = this.props;
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={180}>
          <Menu
            theme="dark"
            mode="inline"
            style={{ height: "100%" }}
            items={[
              { key: "dataTable", label: FUNC_NAMES.dataTable, icon: <LayoutDashboard/>, },
              { key: "scriptManage", label: FUNC_NAMES.scriptManage, icon: <FileCode/>, },
              { key: "taskManage", label: FUNC_NAMES.taskManage, icon: <CalendarClock/> },
              { key: "logManage", label: FUNC_NAMES.logManage, icon: <ScrollText/> },
            ]}
            onClick={this.handleClickMenu}
            defaultSelectedKeys={['taskManage']}
          ></Menu>
        </Sider>
        {this.state.showScriptManage && <ScriptManage></ScriptManage>}
        {this.state.showTaskManage && <TaskManage></TaskManage>}
      </Layout>
    );
  }
}

export default OpsMaster;
