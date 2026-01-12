import { message, Button, Tag, Popconfirm, Tooltip, Collapse, Modal, Flex, Row, Col  } from "antd";
import {
  PlusCircleOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  LoginOutlined,
  DisconnectOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  RedoOutlined
} from "@ant-design/icons";
import { ClockPlus } from 'lucide-react';
import { Component } from "react";
import './common.less'
import './dark.less'
import AddTaskCard from "./addTaskCard";
import { REMINDER_LOCATION, REMINDER_STYLE, SCRIPT_TYPE, TASK_STATUS, TASK_TYPE } from "./const";
// import { services.queryScriptInfo, services.queryTaskInfo, services.queryTaskList, services.removeTask, parseSchedule } from "./util";
import { parseSchedule } from "./util";

const {services} = window;
export default class TaskManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewPlan: false,
      taskType: '',
      taskInfo: {},
      taskList: [],
      items: [],
    }
  }

  componentDidMount() {
    this.refreshPage();
  }

  handleHangupTask = (e, taskName) => {
    e.stopPropagation();
    let job = services.queryScheduleJob(taskName);
    const taskInfo = services.queryTaskInfo(taskName);
    if (taskInfo.status === 2 ) {
      message.info('任务已完成，无法挂起');
    } else if (taskInfo.status === 3) {
      if (job) {
        message.info('创建任务异常，任务已存在');
        return;
      }
      // 恢复任务
      taskInfo.status = 0;
      services.updateTask(taskInfo);
      services.createScheduleJob(taskInfo);
      this.refreshPage();
      message.info('恢复任务成功');
    } else {
      if (!job) {
        message.error('未找到任务，请检查任务是否注册成功')
      } else {
        job.cancel();
        taskInfo.status = 3;
        services.updateTask(taskInfo);
        this.refreshPage();
        message.info('挂起任务成功');
      }
    }
  }


  refreshPage = () => {
    let taskList = services.queryTaskList();
    const items = [];
    taskList.forEach((taskName) => {
      let taskFinished = false;
      let nextExecuteTime;
      const taskInfo = services.queryTaskInfo(taskName);
      const {scriptName, executeSchedule} = taskInfo;
      const status = TASK_STATUS[taskInfo.status];
      const scheduleJob = window.services.queryScheduleJob(taskName);
      if (scheduleJob === undefined) {
        taskFinished = true;
      } else {
        const nextInvocation = scheduleJob.nextInvocation();
        if (nextInvocation) {
          nextExecuteTime = nextInvocation._date.toFormat("yyyy-MM-dd HH:mm:ss");
        } else {
          taskFinished = true;
        }
      }
      const displayInfo = {};
      displayInfo.taskType = scriptName ? '脚本任务' : '提醒任务';
      displayInfo.taskName = taskName;
      displayInfo.scriptName = scriptName ? scriptName : '';
      displayInfo.status = status;
      displayInfo.nextExecuteTime = nextExecuteTime;
      displayInfo.lastExecuteTime = taskInfo.lastExecuteTime;
      displayInfo.executeSchedule = parseSchedule(executeSchedule);
      displayInfo.successNum = taskInfo.successNum;
      displayInfo.failNum = taskInfo.failNum;
      displayInfo.reminderLocation = taskInfo.reminderLocation;
      displayInfo.reminderStyle = taskInfo.reminderStyle;
      if (status === '就绪') {
        displayInfo.color = 'warning'
        displayInfo.icon = <ClockCircleOutlined />
      } else if (status === '运行中') {
        displayInfo.color = 'processing'
        displayInfo.icon = <SyncOutlined spin />
      } else if (status === '已完成') {
        displayInfo.color = 'success'
        displayInfo.icon = <CheckCircleOutlined />
      } else {
        displayInfo.color = 'default';
        displayInfo.icon = <DisconnectOutlined />
      }
      const item = {
        key: taskName,
        label: <div className="left-right-layout" style={{marginBottom: '0px'}}>
            <div style={{ marginBottom: '0px' }} className="large-font">
              <span style={{marginRight: '10px'}}>{displayInfo.taskName}</span>
              <Tooltip title={'任务状态'}>
                <Tag style={{marginRight: '5px'}} color={displayInfo.color} icon={displayInfo.icon} variant="filled" >
                  {displayInfo.status}
                </Tag>
              </Tooltip>
              <Tooltip title={'任务类型'}>
                <Tag variant="filled" style={{marginRight: '5px'}}>
                  {displayInfo.taskType}
                </Tag>
              </Tooltip>
              { displayInfo.taskType === TASK_TYPE.SCRIPT_TASK &&
              <Tooltip title={'脚本名称'}>
                <Tag variant="filled" style={{marginRight: '5px'}}>
                  {displayInfo.scriptName}
                </Tag>
              </Tooltip>}
              <Tooltip title={'执行计划'}>
                <Tag variant="filled" style={{marginRight: '5px'}}>
                  {displayInfo.executeSchedule}
                  </Tag>
              </Tooltip>
              { !taskFinished && 
              <Tooltip title={'下次执行时间'}>
                <Tag variant="filled" style={{marginRight: '5px'}}>
                  {displayInfo.nextExecuteTime}
                </Tag>
              </Tooltip>}
            </div>
          <div>
            <Tooltip title="立即运行">
              <Button
                type="primary"
                shape="circle"
                icon={<CaretRightOutlined />}
                style={{ marginRight: 8 }}
                onClick={(e) => this.handleClickRun(e, taskName)}
              ></Button>
            </Tooltip>
            <Tooltip title="修改任务">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                style={{ marginRight: 8 }}
                onClick={(e) => this.handleClickModify(e, taskInfo)}
              ></Button>
            </Tooltip>
            <Popconfirm
              title={"删除任务"}
              description={`确认是否删除任务：${taskName}`}
              onConfirm={(e) => this.handleClickDelete(taskName, e)}
              onCancel={(e) => e.stopPropagation()}
              okText={"是"}
              cancelText={"否"}
            >
              <Tooltip title="删除任务">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginRight: 8 }}
                  danger
                >
                </Button>
              </Tooltip>
            </Popconfirm>
            <Tooltip title={status === TASK_STATUS[3] ? "恢复任务" : "挂起任务"}>
              <Button
                disabled={status === TASK_STATUS[2] ? true : false}
                type={ (status === TASK_STATUS[2] || status === TASK_STATUS[3]) ? 'default' : "primary"}
                shape="circle"
                icon={<LoginOutlined />}
                onClick={(e) => this.handleHangupTask(e, taskName)}
              >
              </Button>
            </Tooltip>
          </div>
        </div>,
        children: <div>
          <Row>
            <Col span={12}><div>任务名称：{displayInfo.taskName}</div></Col>
            <Col span={12}><div>任务类型：{displayInfo.taskType}</div></Col>
          </Row>
          {displayInfo.taskType === TASK_TYPE.REMIND_TASK && 
            <Row>
              <Col span={12}><div>弹窗位置：{displayInfo.reminderLocation ? displayInfo.reminderLocation : REMINDER_LOCATION.MIDDLE}</div></Col>
              <Col span={12}><div>弹窗风格：{displayInfo.reminderStyle ? displayInfo.reminderStyle : REMINDER_STYLE[0]}</div></Col>
            </Row>}
          <Row>
            <Col span={12}><div>执行计划：{displayInfo.executeSchedule}</div></Col>
            <Col span={12}><div>执行脚本：{displayInfo.taskType === TASK_TYPE.SCRIPT_TASK ? displayInfo.scriptName : '🈚' }</div></Col>
          </Row>
          <Row>
            <Col span={12}><div>上次执行时间：{displayInfo.lastExecuteTime}</div></Col>
            <Col span={12}><div>下次执行时间：{taskFinished ? '🈚': displayInfo.nextExecuteTime}</div></Col>
          </Row>
          <Row>
            <Col span={12}><div>成功次数：{displayInfo.successNum}</div></Col>
            <Col span={12}><div>失败次数：{displayInfo.failNum}</div></Col>
          </Row>
        </div>,
        showArrow: false,
      }
      items.push(item)
    })
    this.setState({items});
  }

  updateState = (option = {}) => {
    this.setState(option)
  }

  handleClickNewPlan = (taskType) => {
    this.setState({ showNewPlan: true, taskType, mode: 'add', taskInfo: {} });
  }

  // 任务查询
  handleClickQueryPlan = () => {
    console.log(window.services.queryScheduleJobs());
    console.log(window.utools.db.allDocs());
  }

  handleClickDelete = (taskName, e) => {
    e?.stopPropagation?.();
    services.removeTask(taskName);
    this.refreshPage();
    message.success(`删除任务成功`);
  }

  handleClickModify = (e, taskInfo) => {
    this.setState({ taskType: taskInfo.taskType, showNewPlan: true, mode: 'update', taskInfo})
    e.stopPropagation();

  }

  handleClickRun = (e, taskName) => {
    e.stopPropagation();
    window.services.executeTask(taskName);
  }

  closeNewPlan = () => {
    this.setState({ showNewPlan: false });
  }

  handleClickRefresh = () => {
    this.refreshPage();
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <div id="taskManageTitle" className="left-right-layout dark-title" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: '8px' }} className="large-font">执行计划列表</div>
            <div className="small-font">管理你的执行计划</div>
          </div>
          <div>
            <Button type="primary" icon={<RedoOutlined />} style={{marginRight: '10px'}} onClick={this.handleClickRefresh}>刷新列表</Button>
            <Button type="primary" icon={<PlusCircleOutlined />} style={{marginRight: '10px'}} onClick={() => this.handleClickNewPlan(TASK_TYPE.REMIND_TASK)}>提醒任务</Button>
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => this.handleClickNewPlan(TASK_TYPE.SCRIPT_TASK)}>脚本任务</Button>
          </div>
        </div>
        {this.state.showNewPlan &&
          <AddTaskCard
            closeNewPlan={this.closeNewPlan}
            refreshPage={this.refreshPage}
            updateParentState={this.updateState}
            taskType={this.state.taskType}
            mode={this.state.mode}
            taskInfo={this.state.taskInfo}
          >
          </AddTaskCard>}
        <Collapse 
          style={{margin: '5px'}}
          items={this.state.items}
          accordion="true"
        />
      </div>
    )
  }
}