import { Modal } from "antd";
import { Component } from "react";

export class AddScriptModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleOk = () => {

    }

    render() {
        return (
            <Modal
                open={true }
                title="添加脚本"
                onCancel={this.props.handleAddModalCancel}
                onOk={this.handleOk}
            ></Modal>
        )
    }

}