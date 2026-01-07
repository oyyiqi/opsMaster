import { message, Button, Tag, Popconfirm, Tooltip, Collapse, Modal  } from "antd";
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
} from "@ant-design/icons";
import { Component } from "react";
import './common.less'
import './dark.less'
import AddTaskCard from "./addTaskCard";
import { SCRIPT_TYPE, TASK_STATUS, TASK_TYPE } from "./const";
// import { services.queryScriptInfo, services.queryTaskInfo, services.queryTaskList, services.removeTask, parseSchedule } from "./util";
import { parseSchedule } from "./util";

const {services} = window;
export default class TaskManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewPlan: false,
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
        label: <div className="left-right-layout" style={{marginBottom: '0px'}}
        >
            <div style={{ marginBottom: '0px' }} className="large-font">
              {/* <span style={{marginRight: '20px'}}>{ status === '已完成' ? <del>{'任务名称：' + displayInfo.taskName}</del> : '任务名称：' + displayInfo.taskName}</span> */}
              <span style={{marginRight: '20px'}}>{displayInfo.taskName}</span>
              <Tag color={displayInfo.color} icon={displayInfo.icon} variant="filled" >{displayInfo.status}</Tag>
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
          <div>任务类型：{displayInfo.taskType}</div>
          { displayInfo.taskType === TASK_TYPE.SCRIPT_TASK && <div>脚本名称：{displayInfo.scriptName}</div>}
          <div>执行计划：{displayInfo.executeSchedule}</div>
          { !taskFinished && <div>下次执行时间：{displayInfo.nextExecuteTime}</div>}
          <div>上次执行时间：{displayInfo.lastExecuteTime}</div>
          <div>成功次数：{displayInfo.successNum}</div>
          <div>失败次数：{displayInfo.failNum}</div>
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

  handleClickNewPlan = () => {
    this.setState({ showNewPlan: true });
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
            <Button type="primary" style={{marginRight: '10px'}} onClick={this.handleClickRefresh}>刷新列表</Button>
            {/* <Button type="primary" style={{marginRight: '10px'}} onClick={this.handleClickQueryPlan}>查询任务</Button> */}
            <Button type="primary" onClick={this.handleClickNewPlan}>新建任务</Button>
          </div>
        </div>
        {this.state.showNewPlan &&
          <AddTaskCard
            closeNewPlan={this.closeNewPlan}
            refreshPage={this.refreshPage}
            updateParentState={this.updateState}
          >
          </AddTaskCard>}
        {/* <div className="taskList">
          {this.renderTaskList()}
        </div> */}
        <Collapse 
          style={{margin: '5px'}}
          items={this.state.items} 
        />
      </div>
    )
  }
}