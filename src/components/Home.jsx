import axios from 'axios';
import React, { Component } from 'react';
import _ from 'lodash';
import Landing from './Landing';
import Gallery from './Gallery';
import styled from 'styled-components';
import ReactLoading from 'react-loading';
import { Redirect } from 'react-router-dom';

const PaperBackground = styled.div`
    background-image: url('/paper.png');
    background-size: 10%;
`;

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
        this.signal = axios.CancelToken.source();

        this.updateActiveGallery = this.updateActiveGallery.bind(this);
        this.incrementNumLoadedImages = this.incrementNumLoadedImages.bind(this);
        this.updateImagesLoaded = this.updateImagesLoaded.bind(this);
    }

    async componentDidMount() {
        const { authed } = this.props;
        if (authed) {
            const response = await axios.get('/backendServices/galleries', {
                cancelToken: this.signal.token
            });
            const galleries = _.reverse(response.data);

            this.setState({ galleries });
            await this.updateActiveGallery(0);

            if (galleries[0].header) {
                const image = new Image();
                image.onload = () => { setTimeout(() => this.setState({ loading: false }), 200); };
                image.src = galleries[0].header;
            } else {
                this.setState({ loading: false });
            }
        }
    }

    componentWillUnmount() {
        this.signal.cancel('HTTP calls are being canceled');
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
                const response = await axios.get(`/backendServices/photos/${activeGalleryName}`, {
                    cancelToken: this.signal.token
                });
                const images = _.map(response.data, image => {
                    const elt = { thumbnail: image.thumbnail };
                    if (image.movie) {
                        elt.html = `<div class="wrapper"><div class="video-wrapper"><video class="pswp__video" src="${image.src}" controls></video></div></div>`;
                    } else {
                        elt.src = image.src;
                        elt.w = image.width;
                        elt.h = image.height;
                    }
                    
                    return elt;
                });
                this.setState({
                    allImagesLoaded: false,
                    images: images || []
                });
                this.numLoadedImages = 0;

                setTimeout(this.updateImagesLoaded, 1000);
            }
        }
    }

    updateImagesLoaded() {
        const allImagesLoaded = this.numLoadedImages >=  this.state.images.length;
        if (allImagesLoaded) {
            this.setState({ allImagesLoaded });
        }
    }

    incrementNumLoadedImages(elt) {
        this.numLoadedImages++;
        this.updateImagesLoaded();
    }

    render() {
        const {
            allImagesLoaded,
            activeGallery,
            galleries,
            images,
            loading
        } = this.state;
        const { authed } = this.props;
        const activeGalleryName = _.get(galleries, `[${activeGallery}].name`);

        if (!authed) {
            return (<Redirect to='/login' />);
        }
        return (
            <PaperBackground>
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
            </PaperBackground>
        );
    }
}

export default Home;
