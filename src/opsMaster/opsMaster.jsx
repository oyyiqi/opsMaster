import { Button, Layout, Menu, Modal, notification } from "antd";
import React, { Component } from "react";
import ScriptManage from "./scriptManage";
import TaskManage from "./taskManage";
import "./dark.less";
import "./common.less";
import { LayoutDashboard, FileCode, CalendarClock, ScrollText, Settings, Activity, Zap, AlarmClockCheck } from 'lucide-react';
import { APP_FUNCS } from "./const";
import DataPanel from "./dataPanel";
import LogManage from "./logManage";
import MessageBox from "./messageBox";
const { Sider } = Layout;


class OpsMaster extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedKey: props.defaultSelectedKey,
      showScriptManage: false,
      showTaskManage: false,
      showMessageBox: false,
    };
  }

    // 关键：监听 defaultSelectedKey 变化，更新子组件 state
  componentDidUpdate(prevProps) {
    if (prevProps.defaultSelectedKey !== this.props.defaultSelectedKey) {
      this.setState({
        selectedKey: this.props.defaultSelectedKey // 同步最新的 route 值
      });
    }
  }


  componentDidMount() {
    this.setState({selectedKey: this.props.defaultSelectedKey});
    const allDocs = window.utools.db.allDocs();
    console.log('已存储数据:', allDocs);
    // this.clearAllData();
    window.services.resignTask();
    window.services.clearRealTimeLog();
    window.customEvents.addEvent("showMessageBox", this.handleShowMessageBox);
  }

  componentWillUnmount() {
    window.customEvents.removeEvent("showMessageBox", this.handleShowMessageBox);
  }
  
  handleShowMessageBox = (message) => {
    utools.createBrowserWindow('modal.html', {
        width: 360,      // 窗口宽度
        height: 200,     // 窗口高度
        x: screen.width / 2 - 180, // 右下角定位
        y: screen.height / 2 - 160,
        frame: false,    // 无边框
        transparent: false, // 透明背景
        alwaysOnTop: true, // 置顶
        resizable: false,  // 禁止调整大小
        skipTaskbar: true, // 任务栏不显示
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
    })
  }

  clearAllData = () => {
    let allDocs = window.utools.db.allDocs();
    allDocs.forEach((doc) => {
      console.log(doc._id);
      window.utools.dbStorage.removeItem(doc._id);
    })
  }

  handleClickMenu = (item) => {
    this.setState({selectedKey: item.key});
  };
  handleOnSelect = (e) => {
    console.log(e);
  }

  render() {
    const { selectedKey,showMessageBox } = this.state;
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={180}>
          <Menu
            theme="dark"
            mode="inline"
            style={{ height: "100vh", position: 'sticky', top: 0, left: 0, }}
            items={[
              { key: APP_FUNCS.DATA_PANEL, label: APP_FUNCS.DATA_PANEL, icon: <LayoutDashboard />, },
              { key: APP_FUNCS.SCRIPT_MANAGE, label: APP_FUNCS.SCRIPT_MANAGE, icon: <FileCode />, },
              { key: APP_FUNCS.TASK_MANAGE, label: APP_FUNCS.TASK_MANAGE, icon: <CalendarClock /> },
              { key: APP_FUNCS.LOG_MANAGE, label: APP_FUNCS.LOG_MANAGE, icon: <ScrollText /> },
            ]}
            onClick={this.handleClickMenu}
            onSelect={this.handleOnSelect}
            selectedKeys={selectedKey}
            // defaultSelectedKeys={this.props.defaultSelectedKey}
          ></Menu>
        </Sider>
        {selectedKey === APP_FUNCS.DATA_PANEL && <DataPanel></DataPanel>}
        {selectedKey === APP_FUNCS.SCRIPT_MANAGE  && <ScriptManage></ScriptManage>}
        {selectedKey === APP_FUNCS.TASK_MANAGE && <TaskManage></TaskManage>}
        {selectedKey === APP_FUNCS.LOG_MANAGE && <LogManage></LogManage>}
        {/* {showMessageBox && <MessageBox></MessageBox>} */}
      </Layout>
    );
  }
}

export default OpsMaster;
