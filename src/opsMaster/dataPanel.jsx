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
    this.setState({scriptNum, taskNum, successNum, failNum})
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
              <Statistic title="任务成功次数" value={successNum} prefix={<FileCode/>} suffix={'次'} />
            </Card>
          </Col>
          <Col span={12}>
            <Card  style={{margin: '0 10px 0 0'}}  >
              <Statistic title="任务失败次数" value={failNum} prefix={<CalendarClock/>} suffix={'次'} />
            </Card>
          </Col>
      </Row>
    </div>
    )
  }
}