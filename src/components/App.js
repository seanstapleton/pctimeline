import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';
import UploadPage from './UploadPage';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path='/' component={Home} />
          <Route exact path='/upload' component={UploadPage} />
        </div>
      </Router>
    );
  }
}

export default App;
