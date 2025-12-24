import { Col, Row, Statistic, Card } from "antd";
import React, { Component } from "react";
import { LayoutDashboard, FileCode, CalendarClock, ScrollText, Settings, Activity, Zap } from 'lucide-react';
// import { window.services.queryScriptList, window.services.queryTaskList } from "./util";

const { customEvents } = window;
export default class DataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptNum: 0,
      taskNum: 0,
      successNum: 0,
      failNum: 0,
    }
  }

  componentDidMount() {
    this.init();
    customEvents.addEvent('totalSuccessUpdate', this.handleTotalSuccessUpdate);
    // window.addEventListener('totalSuccessUpdate', this.handleTotalSuccessUpdate);
  }

  componentWillUnmount() {
    customEvents.removeEvent('totalSuccessUpdate', this.handleTotalSuccessUpdate);
    // window.removeEventListener('totalSuccessUpdate', this.handleTotalSuccessUpdate)
  }

  handleTotalSuccessUpdate = (successNum) => {
    this.setState({successNum})
  }

  init = () => {
    const scriptList = window.services.queryScriptList();
    const taskList = window.services.queryTaskList();
    const scriptNum = scriptList.length;
    const taskNum = taskList.length;
    const successNum = window.services.getTotalSuccessNum();
    this.setState({scriptNum, taskNum, successNum})
  }

  render() {
    const {scriptNum, taskNum, successNum, failNum} = this.state;
    return (
    <div style={{width: '100%'}}>
      <Row>
          <Col span={12} >
            <Card  style={{margin: '10px'}} >
              <Statistic title="脚本数" value={scriptNum} prefix={<FileCode/>} suffix={'个'} />
            </Card>
          </Col>
          <Col span={12}>
            <Card  style={{margin: '10px 10px 0 0'}}  >
              <Statistic title="任务数" value={taskNum} prefix={<CalendarClock/>} suffix={'个'} />
            </Card>
          </Col>
      </Row>
      <Row>
          <Col span={12} >
            <Card  style={{margin: '0 10px 10px 10px'}} >
              <Statistic title="成功调用次数" value={successNum} prefix={<FileCode/>} suffix={'次'} />
            </Card>
          </Col>
          <Col span={12}>
            <Card  style={{margin: '0 10px 0 0'}}  >
              <Statistic title="最近失败次数（24小时）" value={failNum} prefix={<CalendarClock/>} suffix={'次'} />
            </Card>
          </Col>
      </Row>
    </div>
    )
  }
}