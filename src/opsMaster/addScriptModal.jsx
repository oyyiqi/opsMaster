import { Modal, Input, Select, Form, Row, Col, Upload, Button, message } from "antd";
import React, { Component } from "react";
import "./index.css";
import { Option } from "antd/es/mentions";
import { UploadOutlined } from "@ant-design/icons";
const scriptTypes = ["python", "javascript", "shell"];
const { TextArea } = Input;
export class AddScriptModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      fileContent: "",
    };
    this.formRef = React.createRef();
  }

  handleOk = () => {
    const { file, fileContent } = this.state;
    let scriptName = this.formRef.current.getFieldValue('scriptName')
    let scriptType = this.formRef.current.getFieldValue('scriptType')
    if (scriptName === undefined || scriptName.trim().length === 0) {
      let start = file.lastIndexOf('\\')
      let end = file.lastIndexOf('.')
      scriptName = file.substring(start+1, end)
    }
    let savedScripts = window.utools.dbStorage.getItem('savedScripts')
    console.log(savedScripts)
    if (savedScripts && savedScripts.includes(scriptName)) {
      message.error("脚本名重复")
      return
    } else {
      let newScript = { 
        key: scriptName,
        type: scriptType,
        content: fileContent,
        path: file,
      }
      window.utools.dbStorage.setItem(scriptName, newScript);
      savedScripts = savedScripts ? savedScripts : [];
      savedScripts.push(scriptName);
      window.utools.dbStorage.setItem('savedScripts', savedScripts);
      this.props.renderNewScript(newScript);
    }
  };

  handleClickUpload = () => {
    const filters = [{ name: "script", extensions: ["js", "py", "sh", "bat"] }];
    const files = window.utools.showOpenDialog({ filters });
    const file = files[0];
    console.log(file)
    const fileContent = window.services.readFile(file);
    this.setState({ file, fileContent });
  };

  render() {
    return (
      <Modal
        open={true}
        title="新建脚本"
        onCancel={this.props.handleAddModalCancel}
        onOk={this.handleOk}
        okText={"确认"}
        cancelText={"取消"}
      >
        <Form
          ref={this.formRef}
          layout="vertical"
          // labelCol={{span: 8}}
          // wrapperCol={{span: 16}}
        >
          <Row gutter={10} style={{ margin: "2px 0" }}>
            <Col span={12}>
              <Form.Item
                label="脚本名称"
                name="scriptName"
                style={{ marginBottom: "0" }}
              >
                <Input placeholder="例如：每日垃圾文件清理"></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="脚本类型"
                name="scriptType"
                initialValue={"python"}
              >
                <Select>
                  {scriptTypes.map((type) => (
                    <Option value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ margin: "2px 0" }}>
            <Col span={24}>
              <Form.Item label="导入文件">
                <Button
                  style={{ width: "100%" }}
                  icon={<UploadOutlined />}
                  onClick={this.handleClickUpload}
                ></Button>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label={"预览"}>
                <TextArea
                  className="codeViewer"
                  style={{
                    border: '1px solid #1e293b'
                  }}
                  readOnly={true}
                  value={this.state.fileContent}
                  rows={10}
                  placeholder="导入文件进行预览"
                ></TextArea>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
