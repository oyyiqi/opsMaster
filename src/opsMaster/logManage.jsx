import { Row, Col, Select, Input, Layout, Flex, Button, Tooltip, Switch, message, Radio } from "antd";
import { Component } from "react";
import "./dark.less";
import "./common.less";
import { Content } from "antd/es/layout/layout";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { LOG_TYPE } from "./const";

const { services, customEvents } = window;
const { TextArea } = Input;
export default class LogManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultDateList: [],
      defaultTaskList: [],
      dateList: [],
      taskList: [],
      selectedTask: '',
      selectedDate: '',
      logContent: '',
      realTimeRefresh: false,
      realTimeLog: '',
      logType: LOG_TYPE.REAL_TIME_LOG,
    }
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    customEvents.removeEvent('realTimeLogUpdate', this.handleRealTimeLogUpdate);
  }

  init = () => {
    const defaultDateList = services.queryLogDateList();
    const defaultTaskList = services.queryTaskList();
    const realTimeLog = services.queryRealTimeLog();
    customEvents.addEvent('realTimeLogUpdate', this.handleRealTimeLogUpdate);
    this.setState({ 
      defaultDateList,
      defaultTaskList,
      dateList: defaultDateList,
      taskList: defaultTaskList,
      realTimeLog
    });
  }

  handleSelectTask = (selectedTask) => {
    const { selectedDate } = this.state;
    if (selectedDate) {
      const logContent = services.queryTargetTaskAndDateLog(selectedTask, selectedDate);
      console.log(logContent);
      this.setState({ logContent });
    } 
    const dateList = services.queryTargetTaskDateList(selectedTask);
    this.setState({ selectedTask, dateList});
  }

  handleSelectDate = (selectedDate) => {
    const { selectedTask } = this.state;
    if (selectedTask) {
      const logContent = services.queryTargetTaskAndDateLog(selectedTask, selectedDate);
      this.setState({ logContent });
    } 
    const taskList = services.queryTargetDateTaskList(selectedDate);
    this.setState({ taskList, selectedDate});
  }

  handleClearDate = () => {
    const { selectedTask, defaultTaskList } = this.state;
    if (!selectedTask) {
      this.setState({taskList: defaultTaskList });
    }
    this.setState({selectedDate: ''});
  }

  handleClearTask = () => {
    const { selectedDate, defaultDateList }  = this.state;
    if (!selectedDate) {
      this.setState({dateList: defaultDateList});
    }
    this.setState({selectedTask: ''});
  }

  // hadnleClickRealTimeRefresh = () => {
  //   const {realTimeRefresh} = this.state;
  //   if (realTimeRefresh) {
  //     customEvents.removeEvent('realTimeLogUpdate', this.handleRealTimeLogUpdate);
  //   } else {
  //     customEvents.addEvent('realTimeLogUpdate', this.handleRealTimeLogUpdate);
  //     message.info('监听事件realTimeLogUpdate')
  //   }
  //   this.setState({realTimeRefresh: !realTimeRefresh})
  // }

  handleRealTimeLogUpdate = (realTimeLog) => {
    this.setState({ realTimeLog });
  }

  handleLogRadioChange = (e) => {
    const logType = e.target.value;
    if (logType === LOG_TYPE.REAL_TIME_LOG) {
      customEvents.addEvent('realTimeLogUpdate', this.handleRealTimeLogUpdate);
    } else if (logType === LOG_TYPE.HISTORY_LOG) {
      customEvents.removeEvent('realTimeLogUpdate', this.handleRealTimeLogUpdate);
    }
    this.setState({ logType })
  }
  
  render() {
    const { dateList, taskList, realTimeRefresh } = this.state;
    return (
      <div style={{
        width: '100%',
        padding: '10px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#080e20'
        }}>
        <div className="large-font" style={{marginBottom: '10px'}}>
          <span style={{marginRight: '10px'}}>日志查看</span>
          <Radio.Group
            onChange={this.handleLogRadioChange}
            value={this.state.logType}
            options={[
              {
                value: LOG_TYPE.REAL_TIME_LOG,
                label: LOG_TYPE.REAL_TIME_LOG,
              },
              {
                value: LOG_TYPE.HISTORY_LOG,
                label: LOG_TYPE.HISTORY_LOG,
              }
            ]}
          >
          </Radio.Group>
        </div>
        {this.state.logType === LOG_TYPE.HISTORY_LOG && <Row gutter={15}>
          <Col span={12}>
            <Select 
              style={{width: '100%'}}
              placeholder="请选择日期"
              onSelect={this.handleSelectDate}
              onClear={this.handleClearDate}
              allowClear
            >
              {dateList.map((date) => (
                <Option value={date}>{date}</Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Select 
              style={{width: '100%'}}
              placeholder="请选择任务"
              onSelect={this.handleSelectTask}
              onClear={this.handleClearTask}
              allowClear
            >
              {taskList.map((date) => (
                <Option value={date}>{date}</Option>
              ))}
            </Select>
          </Col>
          {/* <Col span={4}>
            <div style={{display: 'flex'}}>
              <Tooltip title={'查询'}>
                <Button
                  type="default"
                  shape="circle"
                  icon={<SearchOutlined />}
                  style={{ marginRight: 8 }}
                  onClick={(e) => this.handleClickRun(e, taskName)}
                >
                </Button>
              </Tooltip>
              <Tooltip title={realTimeRefresh ? "点击关闭实时刷新" : "点击打开实时刷新"}>
                <Button
                  type= {realTimeRefresh ? "primary" :"default"}
                  shape="circle"
                  icon={<UndoOutlined />}
                  style={{ marginRight: 8 }}
                  onClick={() => this.hadnleClickRealTimeRefresh()}
                >
                </Button>
              </Tooltip>
            </div>
          </Col> */}
        </Row>}
        <TextArea
          className="codeViewer"
          style={{
            height: "100%",
            border: '1px solid #1e293b',
            marginTop: '10px'
          }}
          value={this.state.logType === LOG_TYPE.REAL_TIME_LOG ? this.state.realTimeLog : this.state.logContent}
          // value={'你好'}
          readOnly={true}
          placeholder=""
        >
        </TextArea>
      </div>
    )
  }
}