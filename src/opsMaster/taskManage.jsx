import { message, Button } from "antd";
import { Component } from "react";
import './common.less'
import './dark.less'
import NewTaskCard from "./newTaskCard";
import { SAVED_TASK_KEY } from "./const";

const { getItem, setItem } = window.utools.dbStorage;

export default class TaskManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewPlan: false,
    }
  }

  componentDidMount() {
    this.loadTask()
  }

  loadTask = () => {
    let savedTask = getItem(SAVED_TASK_KEY);
    if (!savedTask || savedTask.length === 0) {
      return;
    }
    console.log(savedTask);
    savedTask.forEach(element => {
      let taskInfo = getItem('task-' + element);
      console.log(taskInfo);
      this.createTaskFromFormData(taskInfo);
    })

  }

  createTaskFromFormData = (values = {}) => {
    let savedTask = getItem(SAVED_TASK_KEY);
    if (savedTask && savedTask.includes(values.taskName)) {
      message.error('任务名称重复');
      return;
    }
    let cron, targetDate;
    if (values.executeFrequency === FREQUENCY[0]) {
      targetDate = values.executeDateTime.toDate();
    } else {
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
    }
    return window.services.createScheduleTask({ cron, targetDate, scriptName: values.scriptName });
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

  handleClickNewPlan = () => {
    this.setState({ showNewPlan: true });
  }

  handleClickQueryPlan = () => {
    window.services.queryScheduleJobs();
  }

  closeNewPlan = () => {
    this.setState({ showNewPlan: false });
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
        {this.state.showNewPlan && <NewTaskCard closeNewPlan={this.closeNewPlan}></NewTaskCard>}
      </div>
    )
  }
}