import React, { Component } from 'react';
import styled from 'styled-components';
import 'react-photoswipe/lib/photoswipe.css';
import PhotoSwipe from 'react-photoswipe';
import ReactLoading from 'react-loading';
import Masonry from 'react-masonry-component';
import _ from 'lodash';

const Image = styled.img`
    width: calc(50% - 7.5px);
    margin-bottom: 15px;
    cursor: pointer;
    margin-right: 0;

    @media (max-width: 768px) {
        &:not(:nth-child(2n+1)) {
            margin-right: 15px;
        }
    }

    @media (min-width: 768px) {
        width: calc(33% - 7.5px);
        &:not(:nth-child(3n+1)) {
            margin-right: 15px;
        }
    }
`;
const GridSizer = styled.div`
    width: calc(50% - 7.5px);

    @media (min-width: 768px) {
        width: calc(33% - 7.5px);
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
                <Masonry options={{ columnWidth: '.grid-sizer', gutter: 15 }}>
                    <GridSizer className='grid-sizer'></GridSizer>
                    { _.map(images, (elt, idx) => (
                        <Image 
                            key={idx}
                            src={elt.thumbnail}
                            onClick={() => this.onThumbnailClick(idx)}
                            onLoad={() => {
                                if (!allImagesLoaded) incrementNumLoadedImages(elt)
                            }}
                        />
                    )) }
                </Masonry>
                <PhotoSwipe isOpen={lightboxOpen} options={{ index: lightboxIndex }} items={images} onClose={this.onLightboxClose} />
            </div>
        );
    }
}

export default Gallery;
