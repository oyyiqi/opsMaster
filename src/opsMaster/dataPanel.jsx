import { Col, Row, Statistic, Card, Input } from "antd";
import React, { Component } from "react";
import { LayoutDashboard, FileCode, CalendarClock, CircleCheckBig, CircleX, Settings, Activity, Zap } from 'lucide-react';
import "./dark.less";
import "./common.less";
// import { window.services.queryScriptList, window.services.queryTaskList } from "./util";
const { TextArea } = Input;
const { customEvents } = window;
export default class DataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptNum: 0,
      taskNum: 0,
      successNum: 0,
      failNum: 0,
      todayActivities: '',
    }
  }

  componentDidMount() {
    this.init();
    customEvents.addEvent('totalSuccessUpdate', this.handleTotalSuccessUpdate);
    customEvents.addEvent('totalFailUpdate', this.handleTotalFailUpdate);
  }

  componentWillUnmount() {
    customEvents.removeEvent('totalSuccessUpdate', this.handleTotalSuccessUpdate);
    customEvents.removeEvent('totalFailUpdate', this.handleTotalFailUpdate);
  }

  handleTotalSuccessUpdate = (successNum) => {
    this.setState({successNum})
  }

    handleTotalFailUpdate = (failNum) => {
    this.setState({failNum})
  }

  init = () => {
    const scriptList = window.services.queryScriptList();
    const taskList = window.services.queryTaskList();
    const scriptNum = scriptList.length;
    const taskNum = taskList.length;
    const successNum = window.services.getTotalSuccessNum();
    const failNum = window.services.getTotalFailNum();
    const todayActivities = window.services.getTodayActivities();
    this.setState({scriptNum, taskNum, successNum, failNum, todayActivities})
  }

  render() {
    const {scriptNum, taskNum, successNum, failNum} = this.state;
    return (
    <div style={{width: '100%',height: '100vh', padding: '5px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',}}>
      <div className="large-font" style={{margin: '10px'}}>数据总览</div>
      <Row gutter={10}>
        <Col span={6} >
          <Card>
            <Statistic title="脚本" value={scriptNum} prefix={<FileCode/>} suffix={'个'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="任务" value={taskNum} prefix={<CalendarClock/>} suffix={'个'} />
          </Card>
        </Col>
        <Col span={6} >
          <Card>
            <Statistic title="成功" value={successNum} prefix={<CircleCheckBig />} suffix={'次'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="失败" value={failNum} prefix={<CircleX />} suffix={'次'} />
          </Card>
        </Col>
      </Row>
      <div className="large-font" style={{margin: '10px'}}>今日活动</div>
      {/* <Card style={{height: '100%'}}>{'2026-01-08 10:20:00 [脚本任务] 代码合并检查开始1\n 2026-01-08 10:20:00 [脚本任务] 代码合并检查开始1\n'}</Card> */}
      <TextArea
        className="codeViewer today-activity-panel"
        style={{
          height: '100%',
        }}
        value={this.state.todayActivities}
        readOnly={true}
        placeholder="暂无活动"
      >
      </TextArea>
    </div>
    )
  }
}