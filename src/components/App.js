import React, { Component } from 'react';
import Landing from './Landing';
import Gallery from './Gallery';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Landing />
        <Gallery />
      </div>
    );
  }
}

export default App;
