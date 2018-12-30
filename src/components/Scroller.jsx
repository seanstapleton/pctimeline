import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    width: 30vw;
    height: calc(100vh - 200px);
    margin-top: 0;
    overflow: auto;
`;

const Item = styled.div`
    font-family: 'Open Sans';
    font-size: ${props => props.active ? '4em' : '3em'};
    color: ${props => props.active ? '#fff' : '#555'};
    transition: font-size 0.5s ease-out, line-height 0.5s ease-out;
    cursor: ${props => props.active ? 'pointer' : 'cursor'};
    padding: 5px 0;
`;

let scrollTimeout;

class Scroller extends Component {
    constructor(props) {
        super(props);
        
        this.containerRef = React.createRef();
        this.state = {
            activeIndex: 0,
            scrollHeight: 0
        }

        this.nodeHeight = 40;
        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount() {
        const elt = this.containerRef.current;
        const beginningFillerNode = elt.childNodes[0];
        const endingFillerNode = elt.childNodes[elt.childNodes.length - 1];

        this.nodeHeight = elt.childNodes[2].scrollHeight;

        elt.style['padding-right'] = '17px';
        beginningFillerNode.style.height = elt.scrollHeight*2/5 + 'px';
        endingFillerNode.style.height = elt.scrollHeight*3/5 + 'px';

        elt.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {
        const elt = this.containerRef.current;
        elt.removeEventListener('scroll', this.onScroll);
    }

    onScroll() {
        const {
            elts,
            onScrollStop
        } = this.props;
        const elt = this.containerRef.current;
        const activeIndex = Math.min(Math.floor(elt.scrollTop/this.nodeHeight), elts.length - 1);
        this.setState({
            activeIndex,
            scrollHeight: elt.scrollTop
        });
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => onScrollStop(activeIndex), 500);
    }

    render() {
        const { elts } = this.props;
        const { activeIndex } = this.state;
        return (
            <div style={{ width: '30vw', marginLeft: '20vw', overflow: 'hidden' }}>
                <Container ref={this.containerRef}>
                    <div></div>
                    { elts.map((elt, idx) => (<Item key={idx} active={idx === activeIndex}>{elt.text}</Item>)) }
                    <div></div>
                </Container>
            </div>
        );
    }
}

export default Scroller;
