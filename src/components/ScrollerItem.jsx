import React, { Component } from 'react';
import styled from 'styled-components';

class Scroller extends Component {
    constructor(props) {
        super(props);

        this.state = { activeOption: 0 }
    } 

    render() {
        return (
            <Container>
                <ScrollerItem />
            </Container>
        );
    }
}

export default Scroller;
