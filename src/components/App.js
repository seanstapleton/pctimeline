import axios from 'axios';
import React, { Component } from 'react';
import _ from 'lodash';
import Landing from './Landing';
import Gallery from './Gallery';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeGallery: 0,
      galleries: [],
      images: []
    };

    this.updateActiveGallery = this.updateActiveGallery.bind(this);
  }

  async componentDidMount() {
    const response = await axios.get('/galleries');
    const galleries = response.data;
    this.setState({ galleries });
    await this.updateActiveGallery(0);
  }

  async updateActiveGallery(activeGallery) {
    this.setState({ activeGallery });
    const { galleries } = this.state;
    const activeGalleryName = galleries[activeGallery].name;
    if (activeGalleryName) {
      const response = await axios.get(`/photos/${activeGalleryName}`);
      const images = _.map(response.data, image => ({
          src: image,
          w: 200,
          h: 120
      }));
      this.setState({ images });
    }
  }

  render() {
    const {
      activeGallery,
      galleries,
      images
    } = this.state;

    return (
      <div className="App">
        <Landing galleries={galleries} activeGallery={activeGallery} updateActiveGallery={this.updateActiveGallery} />
        <Gallery images={images} />
      </div>
    );
  }
}

export default App;
