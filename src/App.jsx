import React, { Component } from 'react';
import Hello from './Hello';
import Read from './Read';
import Write from './Write';
import OpsMaster from './opsMaster/opsMaster';

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
      <OpsMaster enterAction={enterAction} />
    )
  }
}

export default App;