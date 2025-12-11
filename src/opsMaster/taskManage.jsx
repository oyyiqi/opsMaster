import { message, Button, Tag, Popconfirm, Tooltip  } from "antd";
import {
  PlusCircleOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Component } from "react";
import './common.less'
import './dark.less'
import NewTaskCard from "./newTaskCard";
import { SAVED_TASK_KEY, FREQUENCY, SCRIPT_TYPE, translateScheduleRule, parseSchedule, formatDateTimeToStandard } from "./const";
import { LucideDelete, TextAlignJustify } from "lucide-react";

const { getItem, setItem, removeItem } = window.utools.dbStorage;

export default class TaskManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewPlan: false,
      savedTask: [],
    }
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    let savedTask = getItem(SAVED_TASK_KEY);
    savedTask = savedTask ? savedTask : [];
    this.setState({savedTask});
  }

  updateState = (option = {}) => {
    this.setState(option)
  }

  handleClickNewPlan = () => {
    this.setState({ showNewPlan: true });
  }

  handleClickQueryPlan = () => {
    window.services.queryScheduleJobs();
    // setItem(SAVED_TASK_KEY, ['单次任务', '测试任务', '测试2', '周本']);
    const allDocs = window.utools.db.allDocs();
    console.log(allDocs);
  }

  handleClickDelete = (taskName) => {
    let { savedTask } = this.state
    savedTask = savedTask.filter((item) => item !== taskName);
    removeItem('task-' + taskName);
    window.services.delelteScheduleJob(taskName);
    this.setState({savedTask}, () => setItem(SAVED_TASK_KEY, savedTask));
    message.success(`删除任务成功`)
  }

  closeNewPlan = () => {
    this.setState({ showNewPlan: false });
  }
  

  renderTaskList = () => {
    const { savedTask } = this.state;
    if (!savedTask || savedTask.length === 0) {
      return
    }
    return (
      savedTask.map((taskName) => {
        let taskFinished = false;
        let nextExecuteTime;
        const taskInfo = getItem('task-' + taskName);
        const {scriptName, executeSchedule} = taskInfo;
        const scheduleJob = window.services.queryScheduleJob(taskName);
        if (scheduleJob === undefined) {
          taskFinished = true;
        } else {
          const nextInvocation = scheduleJob.nextInvocation()
          if (nextInvocation) {
            nextExecuteTime = nextInvocation._date.toFormat("yyyy-MM-dd HH:mm:ss");
          } else {
            taskFinished = true;
          }
        }
        const scriptInfo = getItem(scriptName);
        const suffix = SCRIPT_TYPE.filter((value) => value.type === scriptInfo.type)[0].abbreviation
        return (
          <div className="taskItem left-right-layout" key={taskName}>
            <div>
              <div style={{ marginBottom: '8px' }} className="large-font">
                <span style={{marginRight: '10px'}}>任务名称：{taskName}</span>
                <Tag>{scriptName}.{suffix}</Tag>
              </div>
              <Tag variant="solid" color={'blue'} style={{marginRight: '5px'}}>{parseSchedule(executeSchedule)}</Tag>
              {!taskFinished && <Tag color={'cyan'} style={{marginRight: '5px'}} variant="solid">就绪</Tag>}
              {!taskFinished && <span className="small-font">下次执行：{nextExecuteTime}</span>}
              {taskFinished && <Tag color={'success'} variant="solid">已完成</Tag>}
            </div>
            <div>
              <Popconfirm
                title={"删除任务"}
                description={`确认是否删除任务：${taskName}`}
                onConfirm={() => this.handleClickDelete(taskName)}
                okText={"是"}
                cancelText={"否"}
              >
                <Tooltip title="删除">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    danger
                  ></Button>
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
        )
      })
    )
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <div id="taskManageTitle" className="left-right-layout dark-title" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: '8px' }} className="large-font">执行计划列表</div>
            <div className="small-font">管理你的执行计划</div>
          </div>
          <Button type="primary" onClick={this.handleClickQueryPlan}>查询任务</Button>
          <Button type="primary" onClick={this.handleClickNewPlan}>新建计划</Button>
        </div>
        {this.state.showNewPlan &&
          <NewTaskCard
            closeNewPlan={this.closeNewPlan}
            updateParentState={this.updateState}
          >
          </NewTaskCard>}
        <div className="taskList">
          {this.renderTaskList()}
        </div>
      </div>
    )
  }
}