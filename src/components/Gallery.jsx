import React, { Component } from 'react';
import styled from 'styled-components';
import ReactPhotoGallery from 'react-photo-gallery';
import 'react-photoswipe/lib/photoswipe.css';
import PhotoSwipe from 'react-photoswipe';
import axios from 'axios';
import _ from 'lodash';

const Image = styled.img`
    height: 250px;
    margin-bottom: 15px;
    cursor: pointer;
    &:not(first-child) {
        margin-left: 15px;
    }
`;

class Gallery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lightboxIndex: 0,
            lightboxOpen: false
        };
        this.onLightboxClose = this.onLightboxClose.bind(this);
    }

    componentWillUpdate(nextProps, nextState) {

    }

    onThumbnailClick(idx) {
        this.setState({
            lightboxIndex: idx,
            lightboxOpen: true
        });
    }

    onLightboxClose() {
        this.setState({ lightboxOpen: false });
    }

    render() {
        const {
            lightboxIndex,
            lightboxOpen
        } = this.state;
        const { images } = this.props;
        return (
            <div style={{ padding: 40 }}>
                <ReactPhotoGallery
                        photos={images}
                        ImageComponent={(elt, idx) => <Image src={elt.photo.src} onClick={() => this.onThumbnailClick(elt.index)} />}
                    />
                <PhotoSwipe isOpen={lightboxOpen} options={{ index: lightboxIndex }} items={images} onClose={this.onLightboxClose} />
            </div>
        );
    }
}

export default Gallery;
