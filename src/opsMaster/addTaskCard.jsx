import { Row, Col, Form, Input, Select, DatePicker, TimePicker, Flex, Button, message } from "antd";
import { Option } from "antd/es/mentions";
import React, { Component } from "react";
import { SCHEDULE_TYPE, DAY_OF_WEEK, DAY_OF_MONTH  } from "./const.js";
import {buildCronExpression, is6BitCronValid } from "./util.js";

const { services } = window;
const {ONE_TIME, DAYLY, WEEKLY, MONTHLY, CUSTOM} = SCHEDULE_TYPE;

export default class AddTaskCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      scriptList: [],
      scheduleType: '',
    }
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const scriptList = services.queryScriptList()
    this.setState({ scriptList })
  }

  handleSelectChange = (key) => {
    this.setState({scheduleType: key})
  }

  handleClickSubmit = () => {
    const values = this.formRef.current.getFieldsValue();
    let taskList = services.queryTaskList();
    if (taskList && taskList.includes(values.taskName)) {
      message.error('任务名称重复');
      return;
    }
    let executeSchedule = this.getExecuteSchedule(values);
    // 注册任务
    try {
      let taskInfo = { 
        executeSchedule,
        taskName: values.taskName,
        scriptName: values.scriptName,
        successNum: 0,
        failNum: 0,
        lastFailTime: null,
        status: 0
      }
      services.saveTask(values.taskName, taskInfo);
      taskList = taskList ? taskList : [];
      taskList.push(values.taskName)
      window.services.createScheduleTask({ executeSchedule, scriptName: values.scriptName, taskName: values.taskName });
      this.props.updateParentState({taskList, showNewPlan: false});
      message.success('添加任务成功！');
    } catch (e) {
      console.error(e)
      message.error('添加任务失败');
    }
  }

  getExecuteSchedule(formData) {
    if (formData.scheduleType === ONE_TIME) {
      return formData.executeDateTime.toDate();
    } else if (formData.scheduleType === CUSTOM) {
      const inputCron = formData.cronString;
      if (is6BitCronValid(inputCron)) {
        return inputCron;
      } else {
        message.error('非法的Cron表达式');
        throw new Error('非法的Cron表达式');
      }
    } else {
      const executeTime = formData.executeTime;
      const dayOfWeek = formData.dayOfWeek;
      const dayOfMonth = formData.dayOfMonth;
      return buildCronExpression({
        second: executeTime.second(),
        minute: executeTime.minute(),
        hour: executeTime.hour(),
        dayOfWeek,
        dayOfMonth,
      });
    }
  }



  render() {
    const { scheduleType } = this.state;
    return (
      <div className="newTaskCard">
        <div className="large-font" style={{ marginBottom: '10px' }}>配置新任务</div>
        <Form layout="vertical" ref={this.formRef} onFinish={this.handleClickSubmit}>
          <Row gutter={15}>
            {/* <Col span={12}>
              <Form.Item rules={[{ required: true, message: '必填' }]} label={'任务类型'} name={'taskType'}>
                <Select>
                </Select>
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item rules={[{ required: true, message: '必填' }]} label={'任务名称'} name={'taskName'}>
                <Input ></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item rules={[{ required: true, message: '必填' }]} label={'执行脚本'} name={'scriptName'}>
                <Select>
                  {this.state.scriptList.map((scriptName) => (
                    <Option value={scriptName}>{scriptName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item rules={[{ required: true, message: '必填' }]} label={'计划类型'} name={'scheduleType'}>
                <Select
                  placeholder={'请选择计划类型'}
                  onSelect={this.handleSelectChange}
                >
                  {Object.values(SCHEDULE_TYPE).map((item) =>
                    <Option value={item}>{item}</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            {scheduleType === ONE_TIME &&
              <Col span={12}>
                <Form.Item label={'执行时间'} rules={[{ required: true, message: '必填' }]} name={'executeDateTime'}>
                  <DatePicker style={{width: '100%'}} placeholder="请选择执行时间" showTime={true}></DatePicker>
                </Form.Item>
              </Col>}
            {scheduleType === WEEKLY &&
              <Col span={6}>
                <Form.Item label={'执行日'} rules={[{ required: true, message: '必填' }]} name={'dayOfWeek'}>
                  <Select placeholder="请选择执行日">
                    {DAY_OF_WEEK.map((item) => (
                      <Option value={item.key}>{item.value}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>}
            {scheduleType === MONTHLY &&
              <Col span={6}>
                <Form.Item label={'执行日'} rules={[{ required: true, message: '必填' }]} name={'dayOfMonth'}>
                  <Select placeholder="请选择执行日">
                    {DAY_OF_MONTH.map((item) => (
                      <Option value={item}>{item}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>}
            {[DAYLY, WEEKLY, MONTHLY].includes(scheduleType) &&
              <Col span={scheduleType === DAYLY ? 12 : 6}>
                <Form.Item label={'执行时间'} rules={[{ required: true, message: '必填' }]} name={'executeTime'}>
                  <TimePicker placeholder="请选择执行时间" style={{width: '100%'}} ></TimePicker>
                </Form.Item>
              </Col>}
            { scheduleType === CUSTOM &&
              <Col span={12}>
                <Form.Item label={'自定义执行计划'} rules={[{ required: true, message: '必填' }]} name={'cronString'}>
                  <Input placeholder="支持6位cron表达式"></Input>
                </Form.Item>
              </Col>
            }
          </Row>
          <Row dir='rtl' gutter={15} style={{marginTop: '10px'}}>
            <Col span={12} >
              <Button style={{ width: '40%', marginLeft: '10px' }} type="primary" htmlType="submit">提交</Button>
              <Button style={{ width: '40%' }} type="default" onClick={this.props.closeNewPlan}>取消</Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}