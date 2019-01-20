import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

const Wrapper = styled.div`
    width: 80vw;
    margin-left: 10vw;
    overflow: hidden;

    @media (min-width: 768px) {
        width: 60vw;
    }
`;

const Container = styled.div`
    width: 80vw;
    height: calc(80vh - 200px);
    margin-top: 10vh;
    overflow: auto;

    @media (min-width: 768px) {
        width: 60vw;
        height: calc(60vh - 200px);
    }
`;

const Item = styled.div`
    font-family: 'Just Another Hand';
    font-size: ${props => props.active ? '3em' : '2em'};
    color: ${props => props.active ? '#fff' : '#555'};
    transition: font-size 0.5s ease-out, line-height 0.5s ease-out;
    cursor: pointer;
    padding: 5px 0;

    @media (min-width: 768px) {
        font-size: ${props => props.active ? '4em' : '3em'};
    }
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

        this.nodeHeights = [];

        this.onScroll = this.onScroll.bind(this);
        this.onClick = this.onClick.bind(this);
        this.updateNodeHeights = this.updateNodeHeights.bind(this);
    }

    updateNodeHeights() {
        const elt = this.containerRef.current;
        this.nodeHeights = _.reduce(elt.childNodes, (acc, node, idx) => {
            if (idx <= 1 || idx === elt.childNodes.length - 1) {
                return acc;
            }
            const lastNodeHeight = _.last(acc) || 0;
            acc.push(lastNodeHeight + node.scrollHeight);
            return acc;
        }, [0]);
    }

    componentDidMount() {
        const elt = this.containerRef.current;
        const beginningFillerNode = elt.childNodes[0];
        const endingFillerNode = elt.childNodes[elt.childNodes.length - 1];

        this.updateNodeHeights();
        const nodeHeight = _.last(this.nodeHeights);

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

    onClick(idx) {
        this.updateNodeHeights();

        const elt = this.containerRef.current;
        const scrollHeight = this.nodeHeights[idx];
        elt.scrollTop = scrollHeight;
    }

    onScroll() {
        const {
            elts,
            onScrollStop
        } = this.props;

        const elt = this.containerRef.current;
        this.updateNodeHeights();

        const activeIndex = _.findLastIndex(this.nodeHeights, height => elt.scrollTop >= height);

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
            <Wrapper>
                <Container ref={this.containerRef}>
                    <div></div>
                    { elts.map((elt, idx) => (
                        <Item
                            key={idx}
                            active={idx === activeIndex}
                            onClick={() => this.onClick(idx)}
                        >{elt.name}</Item>
                    )) }
                    <div></div>
                </Container>
            </Wrapper>
        );
    }
}

export default Scroller;
