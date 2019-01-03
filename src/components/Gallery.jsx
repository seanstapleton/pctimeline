import React, { Component } from 'react';
import styled from 'styled-components';
import ReactPhotoGallery from 'react-photo-gallery';
import 'react-photoswipe/lib/photoswipe.css';
import PhotoSwipe from 'react-photoswipe';
import ReactLoading from 'react-loading';

const Image = styled.img`
    height: 250px;
    margin-bottom: 15px;
    cursor: pointer;
    &:not(first-child) {
        margin-left: 15px;
    }
`;

const LoaderContainer = styled.div`
    width: 64px;
    margin: 0 auto;
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
            allImagesLoaded,
            incrementNumLoadedImages,
            images
        } = this.props;
        return (
            <div style={{ padding: 20 }}>
                { allImagesLoaded
                    ? null
                    : <LoaderContainer><ReactLoading type='bubbles' color='#222' /></LoaderContainer>
                }
                <div style={ allImagesLoaded ? null : { height: 0, overflow: 'hidden' }}>
                    <ReactPhotoGallery
                        photos={images}
                        ImageComponent={(elt, idx) => (
                            <Image 
                                src={elt.photo.src}
                                onClick={() => this.onThumbnailClick(elt.index)}
                                onLoad={() => {
                                    if (!allImagesLoaded) incrementNumLoadedImages(elt)
                                }}
                            />
                        )}
                    />
                </div>
                <PhotoSwipe isOpen={lightboxOpen} options={{ index: lightboxIndex }} items={images} onClose={this.onLightboxClose} />
            </div>
        );
    }
}

export default Gallery;
