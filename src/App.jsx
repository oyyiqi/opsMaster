import React, { Component } from 'react';
import OpsMaster from './opsMaster/opsMaster';
import { ConfigProvider } from 'antd';
import { theme } from 'antd';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enterAction: {},
      route: ''
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
    const { route, enterAction } = this.state;
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm
        }}
      >
        <OpsMaster enterAction={enterAction} />
      </ConfigProvider>
    )
  }
}

export default App;