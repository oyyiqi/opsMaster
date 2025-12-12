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
import {
  Button,
  Tag,
  Menu,
  Card,
  Tooltip,
  Input,
  message,
  Popconfirm,
} from "antd";
import { Component } from "react";
import "./dark.less";
import "./common.less";
import { AddScriptModal } from "./addScriptModal";
import { SCRIPT_TYPE } from "./const.js";
import { queryScriptInfo, queryScriptList, removeScript } from "./util";

const { TextArea } = Input;
export default class ScriptManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      selectedItem: {},
      isReadOnly: true,
      showAddScriptModal: false,
    };
  }

  componentDidMount() {
    this.loadScripts();
  }

  loadScripts = () => {
    const { items } = this.state;
    let scriptList = queryScriptList()
    if (!scriptList || scriptList.length === 0) {
      return;
    }
    console.log('开始加载已导入脚本:', scriptList)
    scriptList.forEach((scriptName) => {
      let scriptInfo = queryScriptInfo(scriptName);
      scriptInfo.abbreviation = SCRIPT_TYPE.filter((value) => value.type === scriptInfo.type)[0].abbreviation;
      items.push(scriptInfo);
    });
    this.setState({ selectedItem: items[0], items });
  };

  handleClickScriptItem = (item) => {
    const selectedKey = item.key;
    const selectedItem = this.state.items.filter(
      (it) => it.key === selectedKey
    )[0];
    this.setState({ selectedItem });
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

  handleClickDelete = () => {
    let { selectedItem, items } = this.state;
    if (selectedItem.key === undefined) {
      message.info("请先选择脚本，再进行删除");
    } else {
      removeScript(selectedItem.key);
      items = items.filter((item) => item.key !== selectedItem.key);
      selectedItem = items[0] ? items[0] : {};
      this.setState({ items, selectedItem }, () => message.info("删除成功！"));
    }
  };

  handleClickRun = () => {
    const scriptPath = this.state.selectedItem.path;
    console.log(scriptPath);
    window.services.runPythonScript(scriptPath);
  };

  renderNewScript = (newScript) => {
    let { items } = this.state;
    items.push(newScript);
    this.setState({ items, selectedItem: newScript }, () => {
      message.success("导入脚本成功");
    });
  };

  render() {
    const { selectedItem } = this.state;
    const menuItems = this.state.items.map((item) => ({
      key: item.key, // 菜单唯一标识（和原 key 保持一致）
      // 2. label 对应原 Menu.Item 的子内容（自定义布局：文本 + Tag）
      label: (
        <div
          style={{
            padding: "0px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%", // 确保占满菜单宽度，实现两端对齐
          }}
        >
          {item.key} {/* 原 Menu.Item 中的文本 */}
          <Tag className="menuTag">{item.type}</Tag> {/* 原 Tag 组件 */}
        </div>
      ),
      // 3. 菜单项样式（和原 Menu.Item 的 style 保持一致）
      style: {
        padding: "0px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      },
    }));
    return (
      <Layout className="script-manage-layout">
        <Sider width={220}>
          <div
            className="script-manage-title"
            style={{
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>脚本列表</span>
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
            onClick={this.handleClickScriptItem}
            selectedKeys={[selectedItem.key]}
            items={menuItems}
          >
          </Menu>
        </Sider>
        <Layout>
          <Header
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Tag className="titleTag">{selectedItem.abbreviation}</Tag>
              <span className="titleSpan">{selectedItem.key}</span>
            </div>
            <div>
              <Tooltip title="运行">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CaretRightOutlined />}
                  style={{ marginRight: 8 }}
                  onClick={this.handleClickRun}
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
              <Popconfirm
                title={"删除脚本"}
                description={"确认是否删除该脚本"}
                onConfirm={this.handleClickDelete}
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
          </Header>
          <Content>
            <TextArea
              className="codeViewer"
              style={{
                height: "100%",
                border: "none",
                borderRadius: "0",
              }}
              onChange={this.handleTextAreaChange}
              readOnly={this.state.isReadOnly}
              value={selectedItem.content}
            />
          </Content>
        </Layout>
        {this.state.showAddScriptModal && (
          <AddScriptModal
            handleAddModalCancel={() =>
              this.setState({ showAddScriptModal: false })
            }
            renderNewScript={this.renderNewScript}
          ></AddScriptModal>
        )}
      </Layout>
    );
  }
}
