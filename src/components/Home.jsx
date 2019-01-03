import axios from 'axios';
import React, { Component } from 'react';
import _ from 'lodash';
import Landing from './Landing';
import Gallery from './Gallery';
import styled from 'styled-components';

const ImagePreloader = styled.div`
position: absolute;
width: 0;
height: 0;
overflow: hidden;
z-index: -1;
content: ${props => _.map(props.headers, header => `url(${header})`).join(' ')}
`;

class Home extends Component {
constructor(props) {
    super(props);

    this.state = {
    activeGallery: 0,
    galleries: [],
    images: [],
    allImagesLoaded: false
    };

    this.numLoadedImages = 0;
    this.show = false;

    this.updateActiveGallery = this.updateActiveGallery.bind(this);
    this.incrementNumLoadedImages = this.incrementNumLoadedImages.bind(this);
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
        src: image.src,
        w: image.width,
        h: image.height
    }));
    this.setState({
        allImagesLoaded: false,
        images
    });
    this.numLoadedImages = 0;
    }
}

incrementNumLoadedImages(elt) {
    this.numLoadedImages++;
    const allImagesLoaded = this.numLoadedImages >=  this.state.images.length;
    console.log('All images loaded?', allImagesLoaded);
    if (allImagesLoaded) {
    this.setState({ allImagesLoaded });
    }
}

render() {
    const {
    allImagesLoaded,
    activeGallery,
    galleries,
    images
    } = this.state;
    const activeGalleryName = _.get(galleries, `[${activeGallery}].name`);
    return (
        <div>
            <ImagePreloader headers={_.map(galleries, gallery => gallery.header)} />
            <Landing galleries={galleries} activeGallery={activeGallery} updateActiveGallery={this.updateActiveGallery} />
            <Gallery
                images={images}
                galleryName={activeGalleryName}
                incrementNumLoadedImages={this.incrementNumLoadedImages}
                allImagesLoaded={allImagesLoaded}
            />
        </div>
    );
}
}

export default Home;
