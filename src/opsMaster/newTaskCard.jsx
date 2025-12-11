import { Row, Col, Form, Input, Select, DatePicker, TimePicker, Flex, Button, message } from "antd";
import { Option } from "antd/es/mentions";
import React, { Component } from "react";
import { SAVED_SCRIPTS_KEY, SAVED_TASK_KEY, FREQUENCY, DAY_OF_WEEK, DAY_OF_MONTH  } from "./const.js";

const { setItem, getItem } = window.utools.dbStorage;

export default class NewTaskCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showDateTimePicker: false,
      showTimePicker: false,
      showDayInWeekPicker: false,
      showDayinMonthPicker: false,
      savedScripts: []
    }
    this.formRef = React.createRef();

  }

  componentDidMount() {
    const savedScripts = getItem(SAVED_SCRIPTS_KEY);
    this.setState({ savedScripts })
  }

  handleSelectChange = (key) => {
    if (key === FREQUENCY[0]) {
      this.setState({ showDateTimePicker: true, showTimePicker: false, showDayInWeekPicker: false, showDayinMonthPicker: false })
    }
    if (key === FREQUENCY[1]) {
      this.setState({ showDateTimePicker: false, showTimePicker: true, showDayInWeekPicker: false, showDayinMonthPicker: false })
    }
    if (key === FREQUENCY[2]) {
      this.setState({ showDateTimePicker: false, showTimePicker: true, showDayInWeekPicker: true, showDayinMonthPicker: false })
    }
    if (key === FREQUENCY[3]) {
      this.setState({ showDateTimePicker: false, showTimePicker: true, showDayInWeekPicker: false, showDayinMonthPicker: true })
    }
  }

  handleClickConfirm = () => {
    const values = this.formRef.current.getFieldsValue();
    let savedTask = getItem(SAVED_TASK_KEY);
    if (savedTask && savedTask.includes(values.taskName)) {
      message.error('任务名称重复');
      return;
    }
    let executeSchedule;
    if (values.executeFrequency === FREQUENCY[0]) {
      executeSchedule = values.executeDateTime.toDate();
    } else {
      const executeTime = values.executeTime;
      const dayOfWeek = values.dayOfWeek;
      const dayOfMonth = values.dayOfMonth;
      executeSchedule = this.buildCronExpression({
        second: executeTime.second(),
        minute: executeTime.minute(),
        hour: executeTime.hour(),
        dayOfWeek,
        dayOfMonth,
      })
    }
    const res = window.services.createScheduleTask({ executeSchedule, scriptName: values.scriptName, taskName: values.taskName });
    if (res) {
      let savedTask = getItem(SAVED_TASK_KEY);
      savedTask = savedTask ? savedTask : [];
      savedTask.push(values.taskName)
      console.log(savedTask)
      setItem(SAVED_TASK_KEY, savedTask);
      setItem('task-' + values.taskName, { executeSchedule, scriptName: values.scriptName, successNum: 0, failNum: 0, lastFailTime: null})
      message.success('添加任务成功！');
      this.props.updateParentState({savedTask, showNewPlan: false});
    } else {
      message.error('添加任务失败');
    }
  }

  buildCronExpression(options = {}) {
    const {
      second,
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek
    } = options;

    // 使用数组定义字段的顺序和默认值。
    // 如果字段值是 undefined 或 null，则使用默认值 '*'
    const fields = [
      second,
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek
    ].map(field => {
      // 使用三元运算符判断字段是否传入
      return (field === undefined || field === null || field === '') ? '*' : String(field);
    });

    // 使用空格将所有字段连接起来
    return fields.join(' ');
  }

  render() {
    return (
      <div className="newTaskCard">
        <div className="large-font" style={{ marginBottom: '10px' }}>配置新任务</div>
        <Form layout="vertical" ref={this.formRef}>
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item label={'选择脚本'} name={'scriptName'}>
                <Select>
                  {this.state.savedScripts.map((script) => (
                    <Option value={script}>{script}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={'任务名称'} name={'taskName'}>
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item label={'执行频率'} name={'executeFrequency'}>
                <Select
                  placeholder={'执行频率'}
                  onSelect={this.handleSelectChange}
                >
                  {FREQUENCY.map((item) =>
                    <Option value={item}>{item}</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            {this.state.showDateTimePicker &&
              <Col span={6}>
                <Form.Item label={'执行时间'} name={'executeDateTime'}>
                  <DatePicker placeholder="请选择执行时间" showTime={true}></DatePicker>
                </Form.Item>
              </Col>}
            {this.state.showDayInWeekPicker &&
              <Col span={6}>
                <Form.Item label={'执行日'} name={'dayOfWeek'}>
                  <Select>
                    {DAY_OF_WEEK.map((item) => (
                      <Option value={item.key}>{item.value}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>}
            {this.state.showDayinMonthPicker &&
              <Col span={6}>
                <Form.Item label={'执行日'} name={'dayOfMonth'}>
                  <Select>
                    {DAY_OF_MONTH.map((item) => (
                      <Option value={item}>{item}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>}
            {this.state.showTimePicker &&
              <Col span={6}>
                <Form.Item label={'执行时间'} name={'executeTime'}>
                  <TimePicker ></TimePicker>
                </Form.Item>
              </Col>}
          </Row>
          <Row dir='rtl' gutter={15}>
            <Col span={12} >
              <Button style={{ width: '40%', marginLeft: '10px' }} type="primary" onClick={this.handleClickConfirm}>确认</Button>
              <Button style={{ width: '40%' }} type="default" onClick={this.props.closeNewPlan}>取消</Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}