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
import { Button, Tag, Menu, Card, Tooltip, Input, message, Popconfirm } from "antd";
import { Component } from "react";
import "./index.css";
import { AddScriptModal } from "./addScriptModal";
import { SCRIPT_TYPE } from "./const.js";

const SAVED_SCRIPTS_KEY = 'savedScripts';

const BORDER_STYLE = "1px solid #1e293b";
const { TextArea } = Input;
export default class ScriptManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          key: "CICD_CHECK",
          type: "python",
          content: 'print("Hello, World!")',
          abbreviation: 'PY',
        },
        {
          key: "CICD_CHECK2",
          type: "python",
          content: 'print("Hello, World hhh!")',
          abbreviation: 'PY',
        },
      ],
      selectedItem: {},
      defaultSelectedKeys: [],
      isReadOnly: true,
      showAddScriptModal: false,
    };
  }

  componentDidMount() {
    this.loadScripts()
  }

  loadScripts = () => {
    const { items } = this.state;
    let savedScripts = window.utools.dbStorage.getItem(SAVED_SCRIPTS_KEY);
    if (!savedScripts || savedScripts.length === 0) {
      return;
    }
    this.setState({ defaultSelectedKeys: [savedScripts[0]]});
    console.log(savedScripts);
    savedScripts.forEach(element => {
      let item = window.utools.dbStorage.getItem(element);
      item.abbreviation = SCRIPT_TYPE.filter((value) => value.type === item.type)[0].abbreviation
      items.push(item);
    });
    this.setState({selectedItem: items[0], items});
  }

  handleClickScriptItem = (item) => {
    const selectedKey = item.key
    const selectedItem = this.state.items.filter((it) => it.key === selectedKey)[0]
    this.setState( {selectedItem} );
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
      message.info('请先选择脚本，再进行删除')
    } else {
      items = items.filter((item) => item.key !== selectedItem.key);
      let savedScripts = window.utools.dbStorage.getItem(SAVED_SCRIPTS_KEY);
      savedScripts = savedScripts.filter((item) => item !== selectedItem.key);
      window.utools.dbStorage.removeItem(selectedItem.key);
      window.utools.dbStorage.setItem(SAVED_SCRIPTS_KEY, savedScripts)
      this.setState({ items }, () => message.info('删除成功！'));
    }
  }

  renderNewScript = (newScript) => {
    let { items } = this.state;
    items.push(newScript);
    this.setState({items}, () => {message.success('导入脚本成功')});
  }

  render() {
    const {selectedItem} = this.state;
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
            defaultSelectedKeys={this.state.defaultSelectedKeys}
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
                {item.key}
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
              <Tag className="titleTag">
                {selectedItem.abbreviation}
              </Tag>
              <span className="titleSpan">{selectedItem.key}</span>
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
                border: 'none',
                borderRadius: '0',
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
