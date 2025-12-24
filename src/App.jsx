import React, { Component } from 'react';
import OpsMaster from './opsMaster/opsMaster';
import { ConfigProvider } from 'antd';
import { theme } from 'antd';
import { APP_FUNCS } from './opsMaster/const';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enterAction: {},
      route: '',
      test: 'abc',
    };
  }
  

  componentDidMount() {
    window.utools.onPluginEnter((action) => {
      this.setState({
        route: action.code,
        enterAction: action
      });
    });
    
    window.utools.onPluginOut((isKill) => {
      this.setState({ route: '' });
    });
  }

  render() {
    const { route } = this.state;
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm
        }}
      >
        <OpsMaster defaultSelectedKey={route} test={this.state.test} />
      </ConfigProvider>
    )
  }
}

export default App;