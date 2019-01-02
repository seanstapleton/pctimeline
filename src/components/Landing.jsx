import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import Header from './Header';
import Scroller from './Scroller';

const Container = styled.div`
    background-color: #fff;
    background: ${props => `url(${props.background}) center center no-repeat`};
    background-size: cover;
    width: 100vw;
    height: 90vh;
    transition: background-image 1s linear;
`;

class Landing extends Component {
    constructor(props) {
        super(props);
        
        this.onScrollStop = this.onScrollStop.bind(this);
    }

    onScrollStop(activeIndex) {
        const { updateActiveGallery } = this.props;
        updateActiveGallery(activeIndex);
    }

    render() {
        const {
            activeGallery,
            galleries
        } = this.props;
        const activeBackground = _.get(galleries, `[${activeGallery}].header`);

        return (
            <Container background={activeBackground}>
                <Header />
                <Scroller
                    elts={galleries}
                    onScrollStop={this.onScrollStop}
                />
            </Container>
        );
    }
}

export default Landing;
