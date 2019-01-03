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
const Timeline = styled.div`
    width: 40px;
    height: 200px;
    float: left;
    & span {
        display: block;

        &:nth-of-type(1) {
            width: 1px;
            margin-left: 19.5px;
            height: 20px;
            background-color: #ddd;
        }
        &:nth-of-type(2) {
            width: 20px;
            height: 20px;
            margin-left: 10px;
            border-radius: 50%;
            background-color: #ddd;
        }
        &:nth-of-type(3) {
            width: 1px;
            margin-left: 19.5px;
            height: 100px;
            background-color: #ddd;
        }
    }
`;

const GalleryTitle = styled.h2`
    color: #ddd;
    margin-top: 0.75em;
    margin-bottom: 20px;
    padding-left: 55px;
    font-family: 'Just Another Hand';
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
        const {
            galleryName,
            images
        } = this.props;
        return (
            <div style={{ padding: 60 }}>
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
