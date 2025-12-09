import { Row, Col, Form, Input, Select, DatePicker, TimePicker, Flex, Button } from "antd";
import { Option } from "antd/es/mentions";
import React, { Component } from "react";
import { SAVED_SCRIPTS_KEY } from "./const.js";

const FREQUENCY = ['单次', '每天', '每周', '每月']
const DAY_OF_WEEK = [
  {value: '周一', key: 1},
  {value: '周二', key: 2},
  {value: '周三', key: 3},
  {value: '周四', key: 4},
  {value: '周五', key: 5},
  {value: '周六', key: 6},
  {value: '周日', key: 7},
]
const DAY_OF_MONTH = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
  31
]

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
    const savedScripts = window.utools.dbStorage.getItem(SAVED_SCRIPTS_KEY);
    this.setState({savedScripts})
  }

  handleSelectChange = (key) => {
    if (key === FREQUENCY[0]) {
      this.setState({ showDateTimePicker: true, showTimePicker: false, showDayInWeekPicker: false, showDayinMonthPicker: false})
    }
    if (key === FREQUENCY[1]) {
      this.setState({ showDateTimePicker: false, showTimePicker: true, showDayInWeekPicker: false, showDayinMonthPicker: false})
    }
    if (key === FREQUENCY[2]) {
      this.setState({ showDateTimePicker: false, showTimePicker: true, showDayInWeekPicker: true, showDayinMonthPicker: false})
    }
    if (key === FREQUENCY[3]) {
      this.setState({ showDateTimePicker: false, showTimePicker: true, showDayInWeekPicker: false, showDayinMonthPicker: true})
    }
  }

  handleClickConfirm = () => {
    const values = this.formRef.current.getFieldsValue();
    let cron = '';
    if (values.executeFrequency != FREQUENCY[0]) {
      const executeTime = values.executeTime;
      const dayOfWeek = values.dayOfWeek;
      const dayOfMonth = values.dayOfMonth;
      cron = this.buildCronExpression({
        second: executeTime.second(),
        minute: executeTime.minute(),
        hour: executeTime.hour(),
        dayOfWeek,
        dayOfMonth,
      })
      window.services.createScheduleTask(cron, values.scriptName);
      console.log(cron)
    }
    console.log(values);
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
        <div className="large-font" style={{marginBottom: '10px'}}>配置新任务</div>
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
              <Form.Item label={'执行频率'} name={'excuteFrequency'}>
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
              <Button style={{width: '40%', marginLeft: '10px'}} type="primary" onClick={this.handleClickConfirm}>确认</Button>
              <Button style={{width: '40%'}} type="default" onClick={this.props.closeNewPlan}>取消</Button>
            </Col>
          </Row>
        </Form>
      </div>
    )  
  }
}