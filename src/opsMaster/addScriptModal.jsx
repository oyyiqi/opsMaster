import { Modal, Input, Select, Form, Row, Col, Upload, Button, message } from "antd";
import React, { Component } from "react";
import "./dark.less";
import "./common.less";
import { Option } from "antd/es/mentions";
import { UploadOutlined } from "@ant-design/icons";
import { queryScriptList, saveScript } from "./util";
import { SCRIPT_TYPE } from "./const";
const scriptTypes = SCRIPT_TYPE.map((item) => item.type);
const abbreviations = SCRIPT_TYPE.map((item) => item.abbreviation);
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
    let scriptList = queryScriptList();
    console.log(scriptList)
    if (scriptList && scriptList.includes(scriptName)) {
      message.error("脚本名重复")
      return
    } else {
      let scriptInfo = { 
        key: scriptName,
        type: scriptType,
        content: fileContent,
        path: file,
      }
      saveScript(scriptName, scriptInfo);
      console.log('bbb')
      this.props.renderNewScript(scriptInfo);
      this.props.handleAddModalCancel();
    }
  };

  handleClickUpload = () => {
    const filters = [{ name: "script", extensions: abbreviations }];
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
        style={{ top: 40 }}
      >
        <Form
          ref={this.formRef}
          layout="vertical"
        >
          <Row gutter={10} style={{ margin: "2px 0" }}>
            <Col span={12}>
              <Form.Item
                label="脚本名称"
                name="scriptName"
                style={{ marginBottom: "0" }}
              >
                <Input placeholder="默认以文件名命名"></Input>
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
          <Row style={{ margin: "0px" }}>
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
                  rows={8}
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
