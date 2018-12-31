import React, { Component } from 'react';
import styled from 'styled-components';
import ReactPhotoGallery from 'react-photo-gallery';
import 'react-photoswipe/lib/photoswipe.css';
import PhotoSwipe from 'react-photoswipe';

let images = ['https://images.unsplash.com/photo-1496992293786-f51a5a384c8f?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1486670082170-b54a98edda89?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1466203608968-64a13c78fc58?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1489899386118-f4b931edf195?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1488171449184-94ca5157c964?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1523299430930-662665409fc9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1466112928291-0903b80a9466?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1517183021684-7f9984992079?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1529343615935-9e41f4a955d9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1481214110143-ed630356e1bb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9'];
images = images.concat(images);

const imageElts = images.map((image) => ({
    src: image,
    w: 200,
    h: 120
}));

const Image = styled.img`
    height: 250px;
    margin-bottom: 15px;
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
        console.log('index:', lightboxIndex);
        return (
            <div style={{ padding: 40 }}>
                <ReactPhotoGallery
                        photos={imageElts}
                        ImageComponent={(elt) => <Image key={elt.index} src={elt.photo.src} onClick={() => this.onThumbnailClick(elt.index)} />}
                    />
                <PhotoSwipe isOpen={lightboxOpen} options={{ index: lightboxIndex }} items={imageElts} onClose={this.onLightboxClose} />
            </div>
        );
    }
}

export default Gallery;
