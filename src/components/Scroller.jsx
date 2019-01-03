import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

const Container = styled.div`
    width: 60vw;
    height: calc(60vh - 200px);
    margin-top: 10vh;
    overflow: auto;
`;

const Item = styled.div`
    font-family: 'Just Another Hand';
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
            scrollHeight: 0,
            nodeHeight: 40
        }

        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount() {
        const elt = this.containerRef.current;
        const beginningFillerNode = elt.childNodes[0];
        const endingFillerNode = elt.childNodes[elt.childNodes.length - 1];

        global.test = elt.childNodes;
        const nodeHeight = _.get(elt, 'childNodes[2].scrollHeight') || 40;
        this.setState({ nodeHeight });

        elt.style['padding-right'] = '17px';
        const fillerHeight = (elt.scrollHeight/2 - nodeHeight);
        beginningFillerNode.style.height = fillerHeight + 'px';
        endingFillerNode.style.height = fillerHeight + nodeHeight + 'px';

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
        const { nodeHeight } = this.state;

        const elt = this.containerRef.current;
        const activeIndex = Math.min(Math.floor(elt.scrollTop/nodeHeight), elts.length - 1);
        const newNodeHeight = _.get(elt, 'childNodes[2].scrollHeight') || 40;

        this.setState({
            activeIndex,
            scrollHeight: elt.scrollTop,
            nodeHeight: newNodeHeight
        });

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => onScrollStop(activeIndex), 500);
    }

    render() {
        const { elts } = this.props;
        const { activeIndex } = this.state;
        return (
            <div style={{ width: '60vw', marginLeft: '10vw', overflow: 'hidden' }}>
                <Container ref={this.containerRef}>
                    <div></div>
                    { elts.map((elt, idx) => (<Item key={idx} active={idx === activeIndex}>{elt.name}</Item>)) }
                    <div></div>
                </Container>
            </div>
        );
    }
}

export default Scroller;
