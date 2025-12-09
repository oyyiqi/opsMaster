import { Button } from "antd";
import { Component } from "react";
import './common.less'
import './dark.less'
import NewTaskCard from "./newTaskCard";

export default class TaskManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewPlan: false,
    }
  }

  handleClickNewPlan = () => {
    this.setState({showNewPlan: true});
  }

  closeNewPlan = () => {
    this.setState({showNewPlan: false});
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        <div id="taskManageTitle" className="left-right-layout dark-title" style={{width: '100%'}}>
          <div>
            <div style={{marginBottom: '8px'}} className="large-font">执行计划列表</div>
            <div className="small-font">管理你的执行计划</div>
          </div>
          <Button type="primary" onClick={this.handleClickNewPlan}>新建计划</Button>
        </div>
        {this.state.showNewPlan && <NewTaskCard closeNewPlan={this.closeNewPlan}></NewTaskCard>}
      </div>
    )
  }
}