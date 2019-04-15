import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';

import Home from './Home';
import UploadPage from './UploadPage';
import SeniorForm from './SeniorForm';
import LoginPage from './LoginPage';
import swal from 'sweetalert2';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authed: false,
      returnRoute: null
    };

    this.signal = axios.CancelToken.source();

    this.onLogin = this.onLogin.bind(this);
    this.setReturnRoute = this.setReturnRoute.bind(this);
  }

  setReturnRoute(route) {
    this.setState({ returnRoute: route });
  }

  async componentDidMount() {
    const response = await axios.get('/backendServices/isLoggedIn', {
      cancelToken: this.signal.token
    });
    const isLoggedIn = _.get(response, 'data.loggedIn');

    this.setState({ authed: isLoggedIn });
  }

  componentWillUnmount() {
    this.signal.cancel('HTTP calls are being canceled');
  }

  async onLogin(password) {
    let response;
    try {
      response = await axios.post('/backendServices/login', { id: 'pctumich', password }, {
        cancelToken: this.signal.token
      });
    } catch (e) {
      console.log(e);
    }
    const success = _.get(response, 'data.success');
    if (!success) {
      swal('Incorrect password', '', 'error');
    }
    this.setState({ authed: success });
  }

  render() {
    const {
      authed,
      returnRoute
    } = this.state;

    return (
      <Router>
        <div className="App">
          <Route exact path='/' render={props => <Home {...props} authed={authed} />} />
          <Route exact path='/upload' render={props => <UploadPage {...props} authed={authed} setReturnRoute={this.setReturnRoute} />} />
          <Route exact path='/seniors' render={props => <SeniorForm {...props} authed={true} setReturnRoute={this.setReturnRoute} />} />
          <Route exact path='/login' render={props => <LoginPage {...props} authed={authed} onLogin={this.onLogin} returnRoute={returnRoute} />} />
        </div>
      </Router>
    );
  }
}

export default App;
