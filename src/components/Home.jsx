import axios from 'axios';
import React, { Component } from 'react';
import _ from 'lodash';
import Landing from './Landing';
import Gallery from './Gallery';
import styled from 'styled-components';
import ReactLoading from 'react-loading';

const ImagePreloader = styled.div`
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    z-index: -1;
    content: ${props => _.map(props.headers, header => `url(${header})`).join(' ')}
`;
const LoadingScreen = styled.div`
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #fff;
    opacity: ${ props => props.show ? '1' : '0'};
    visibility: ${ props => props.show ? 'visible' : 'hidden' }
    transition: visibility 0s linear 0.5s, opacity 0.5s;
`;
const ReactLoadingContainer = styled.div`
    width: 64px;
    height: 64px;
    z-index: 1;
    display: block;
    margin: 40vh auto;
`;

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeGallery: -1,
            galleries: [],
            images: [],
            allImagesLoaded: false,
            loading: true
        };

        this.numLoadedImages = 0;
        this.show = false;

        this.updateActiveGallery = this.updateActiveGallery.bind(this);
        this.incrementNumLoadedImages = this.incrementNumLoadedImages.bind(this);
    }

    async componentDidMount() {
        const response = await axios.get('/backendServices/galleries');
        const galleries = response.data;
        this.setState({ galleries });
        await this.updateActiveGallery(0);

        const image = new Image();
        image.onload = () => { setTimeout(() => this.setState({ loading: false }), 200); };
        image.src = galleries[0].header;
    }

    async updateActiveGallery(activeGalleryIn) {
        const { activeGallery } = this.state;
        if (activeGalleryIn !== activeGallery) {
            this.setState({ activeGallery: activeGalleryIn });
            const { galleries } = this.state;
            const activeGalleryName = galleries[activeGalleryIn].name;
            this.setState({
                allImagesLoaded: false,
                images: []
            });
            if (activeGalleryName) {
                const response = await axios.get(`/backendServices/photos/${activeGalleryName}`);
                const images = _.map(response.data, image => {
                    const elt = { thumbnail: image.thumbnail };
                    if (image.movie) {
                        elt.html = `<div class="wrapper"><div class="video-wrapper"><video width="960" class="pswp__video" src="${image.src}" controls></video></div></div>`;
                    } else {
                        elt.src = image.src;
                        elt.w = image.width;
                        elt.h = image.height;
                    }
                    
                    return elt;
                });
                this.setState({
                    allImagesLoaded: false,
                    images
                });
                this.numLoadedImages = 0;
            }
        }
    }

    incrementNumLoadedImages(elt) {
        this.numLoadedImages++;
        const allImagesLoaded = this.numLoadedImages >=  this.state.images.length;
        if (allImagesLoaded) {
            this.setState({ allImagesLoaded });
        }
    }

    render() {
        const {
            allImagesLoaded,
            activeGallery,
            galleries,
            images,
            loading
        } = this.state;
        const activeGalleryName = _.get(galleries, `[${activeGallery}].name`);
        return (
            <div>
                <LoadingScreen show={loading}>
                    <ReactLoadingContainer>
                        <ReactLoading type='spin' color='#222' />
                    </ReactLoadingContainer>
                </LoadingScreen>
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
