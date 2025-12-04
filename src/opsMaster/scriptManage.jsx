import Layout, { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import {
  PlusCircleOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Tag, Menu, Card, Tooltip, Input } from "antd";
import { Component } from "react";
import "./index.css";
import { AddScriptModal } from "./addScriptModal";

const BORDER_STYLE = "1px solid #1e293b";
const { TextArea } = Input;
export default class ScriptManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          key: "CICD_CHECK",
          name: "CICD检查脚本",
          type: "python",
          memo: "用于检查CICD流水线配置是否符合规范",
          content: 'print("Hello, World!")',
        },
        {
          key: "CICD_CHECK2",
          name: "CICD检查脚本",
          type: "python",
          memo: "用于检查CICD流水线配置是否符合规范",
          content: 'print("Hello, World!")',
        },
      ],
      selectedKey: "",
      isReadOnly: true,
      showAddScriptModal: false,
    };
  }

  componentDidMount() {}

  getCardTitle = () => {
    return <div style={{ backgroundColor: "#0f172a" }}>123</div>;
  };

  handleClickScriptItem = (item) => {
    this.setState({ selectedKeys: item.key });
  };

  handleClickEdit = () => {
    this.setState({ isReadOnly: !this.state.isReadOnly });
  };

  handleClickSave = () => {
    this.setState({ isReadOnly: true });
  };

  handleClickCancel = () => {
    this.setState({ isReadOnly: true });
  };

  handleClickAdd = () => {
    console.log("添加脚本");
    this.setState({ showAddScriptModal: true });
  };

  handleTextAreaChange = (e) => {
    console.log(e.target.value);
  };

  render() {
    return (
      <Layout className="script-manage-layout" >
        <Sider width={220}>
          <div className="script-manage-title"
          style={{
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            脚本列表
            <Button
              onClick={this.handleClickAdd}
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
            />
          </div>
          <Menu
            className="scriptList"
            mode="inline"
            theme="dark"
            style={{height: '100%'}}
            onClick={this.handleClickScriptItem}
          >
            {this.state.items.map((item) => (
              <Menu.Item
                key={item.key}
                style={{
                  padding: "0px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {item.name}
                <Tag className="menuTag">{item.type}</Tag>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout>
          <Header>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Tag className="titleTag">Py</Tag>
              <span className="titleSpan">CICD检查脚本</span>
            </div>
            <div>
              <Tooltip title="运行">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CaretRightOutlined />}
                  style={{ marginRight: 8 }}
                ></Button>
              </Tooltip>
              {this.state.isReadOnly && (
                <Tooltip title="编辑">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    style={{ marginRight: 8 }}
                    onClick={this.handleClickEdit}
                  ></Button>
                </Tooltip>
              )}
              {!this.state.isReadOnly && (
                <Tooltip title="保存">
                  <Button
                    onClick={this.handleClickSave}
                    type="primary"
                    shape="circle"
                    icon={<CheckOutlined />}
                    style={{ marginRight: 8 }}
                  ></Button>
                </Tooltip>
              )}
              {!this.state.isReadOnly && (
                <Tooltip title="取消">
                  <Button
                    onClick={this.handleClickCancel}
                    type="primary"
                    shape="circle"
                    icon={<CloseOutlined />}
                    style={{ marginRight: 8 }}
                  ></Button>
                </Tooltip>
              )}
              <Tooltip title="删除">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                ></Button>
              </Tooltip>
            </div>
          </Header>
          <Content>
            <TextArea
              className="codeViewer"
              style={{
                height: "100%",
                border: 'none',
                borderRadius: '0',
              }}
              onChange={this.handleTextAreaChange}
              readOnly={this.state.isReadOnly}
            />
          </Content>
        </Layout>
        {this.state.showAddScriptModal && (
          <AddScriptModal
            handleAddModalCancel={() =>
              this.setState({ showAddScriptModal: false })
            }
          ></AddScriptModal>
        )}
      </Layout>
    );
  }
}
