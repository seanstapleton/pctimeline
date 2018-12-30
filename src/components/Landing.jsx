import React, { Component } from 'react';
import styled from 'styled-components';
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

const elts = [{
    text: 'Bowling @ Bel-Mark Lanes',
    img: 'https://images.unsplash.com/photo-1466112928291-0903b80a9466?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1000&h=600&fit=crop&ixid=eyJhcHBfaWQiOjF9'
}, {
    text: 'Cider Mill Trip',
    img: 'https://images.unsplash.com/photo-1481214110143-ed630356e1bb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1000&h=600&fit=crop&ixid=eyJhcHBfaWQiOjF9'
}, {
    text: 'Pledge Party',
    img: 'https://images.unsplash.com/photo-1486670082170-b54a98edda89?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1000&h=600&fit=crop&ixid=eyJhcHBfaWQiOjF9'
}, {
    text: 'Secret Santa',
    img: 'https://images.unsplash.com/photo-1529343615935-9e41f4a955d9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1000&h=600&fit=crop&ixid=eyJhcHBfaWQiOjF9'
}, {
    text: 'Pre-Info Session',
    img: 'https://images.unsplash.com/photo-1523299430930-662665409fc9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1000&h=600&fit=crop&ixid=eyJhcHBfaWQiOjF9'
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
