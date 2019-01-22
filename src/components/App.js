import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';

import Home from './Home';
import UploadPage from './UploadPage';
import LoginPage from './LoginPage';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { authed: false };

    this.onLogin = this.onLogin.bind(this);
  }

  async componentDidMount() {
    const response = await axios.get('/backendServices/isLoggedIn');
    const isLoggedIn = _.get(response, 'data.loggedIn');

    this.setState({ authed: isLoggedIn });
  }

  async onLogin(password) {
    let response;
    try {
      response = await axios.post('/backendServices/login', { id: 'pctumich', password });
    } catch (e) {
      console.log(e);
    }
    const success = _.get(response, 'data.success');
    this.setState({ authed: success });
  }

  render() {
    const { authed } = this.state;

    return (
      <Router>
        <div className="App">
          <Route exact path='/' render={props => <Home {...props} authed={authed} />} />
          <Route exact path='/upload' render={props => <UploadPage {...props} authed={authed} />} />
          <Route exact path='/login' render={props => <LoginPage {...props} authed={authed} onLogin={this.onLogin} />} />
        </div>
      </Router>
    );
  }
}

export default App;
