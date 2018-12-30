import React, { Component } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Scroller from './Scroller';

const Container = styled.div`
    background-color: #fff;
    background: ${props => `url(${props.background}) center center no-repeat`};
    background-size: cover;
    width: 100vw;
    height: auto;
    transition: background-image 1s linear;
`;

const elts = [{
    text: 'Item 1',
    img: 'https://images.unsplash.com/photo-1543363127-e668c16b7b91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1525&q=80'
}, {
    text: 'Item 2',
    img: 'https://images.unsplash.com/photo-1546004715-83fb90207b45?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1582&q=80'
}, {
    text: 'Item 3',
    img: 'https://images.unsplash.com/photo-1542834759-4db91f2574d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80'
}, {
    text: 'Item 4',
    img: 'https://images.unsplash.com/photo-1546013842-aa2b116f159c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1567&q=80'
}, {
    text: 'Item 5',
    img: 'https://images.unsplash.com/photo-1545990148-6645a15bfee6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1653&q=80'
}];

class Landing extends Component {
    constructor(props) {
        super(props);
        
        this.state = { activeBackground: elts[0].img };
        this.onScrollStop = this.onScrollStop.bind(this);
    }

    onScrollStop(activeIndex) {
        const activeBackground = elts[activeIndex].img;
        this.setState({ activeBackground });
    }

    render() {
        const { activeBackground } = this.state;
        return (
            <Container background={activeBackground}>
                <Header />
                <Scroller
                    elts={elts}
                    onScrollStop={this.onScrollStop}
                />
            </Container>
        );
    }
}

export default Landing;
