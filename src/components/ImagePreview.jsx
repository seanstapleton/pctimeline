import React, { Component } from 'react';
import styled from 'styled-components';
import { Circle } from 'rc-progress';
import _ from 'lodash';

const PreviewContainer = styled.div`
    width: calc(50% - 10px);
    border-radius: 5px;
    float: left;
    position: relative;
    
    @media (min-width: 768px) {
        width: calc(33% - 15px);
    }
`;

const ImageBox = styled.img`
    width: 100%;
    border-radius: 5px;
    padding: 0;
    margin: 0;
`;

const LoadingBox = styled.div`
    position: absolute;
    width: 100%;
    height: calc(100% - 2.5px);
    top: 0;
    left: 0;
    border-radius: 5px;
    z-index: 1;
    background-image: ${ props => {
        if (props.percent === 1) {
            const icon = props.success ? 'checkmark.svg' : 'error.svg';
            return `url(/${icon})`;
        }
    }};
    background-size: 30%;
    background-repeat: no-repeat;
    background-position: center;
    background-color: ${ props => {
        if (props.percent === 1) {
            const green = 'rgba(167,232,160,0.4)';
            const red = 'rgba(255,128,128,0.4)';
            return props.success ? green : red;
        }
    }};
`;

const Percent = styled.p`
    color: #fff;
    position: absolute;
    width: 100%;
    text-align: center;
    margin-top: 0;
    font-size: 1.5rem;
    font-family: 'Open Sans';
`;

const PercentContainer = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

class Gallery extends Component {
    render() {
        const {
            percent,
            src,
            success
        } = this.props;

        return (
            <PreviewContainer>
                <LoadingBox success={success} percent={percent}>
                    { (percent > 0 && percent < 1  && success === undefined)
                        ? (
                            <PercentContainer>
                                <Circle
                                    percent={percent*100}
                                    strokeWidth="10"
                                    strokeColor="#B4E89F"
                                    trailWidth="10"
                                    trailColor="rgba(200,200,200,0.5)"
                                    style={{ width: '50%' }}/>
                                <Percent>{percent*100}%</Percent>
                            </PercentContainer>
                        ) : ''
                    }
                </LoadingBox>
                <ImageBox src={src} />
            </PreviewContainer>
        );
    }
}

export default Gallery;
