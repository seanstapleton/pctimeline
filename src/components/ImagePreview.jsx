import React, { Component } from 'react';
import styled from 'styled-components';
import { Circle } from 'rc-progress';
import _ from 'lodash';

const PreviewContainer = styled.div`
    width: calc(50% - 10px);
    border-radius: 5px;
    float: left;
    position: relative;
    margin-left: 10px;
    margin-bottom: 10px;
    
    @media (min-width: 768px) {
        width: calc(33% - 15px);
        margin-left: 15px
        margin-bottom: 15px;
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
    height: 100%;
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

const VideoDefault = styled.div`
    display: block;
    position: relative;
    width: 100%;
    height: 200px;
    border-radius: 5px;
    float: left;
    background-color: #aec3db;
    background-image: url(/video.svg);
    background-position: center;
    background-repeat: no-repeat;
    background-size: 25%;

    & p {
        margin: 0;
        position: absolute;
        bottom: 5px;
        font-family: 'Just Another Hand';
        font-size: 2em;
        text-align: center;
        width: calc(100% - 10px);
    }
`;

class Gallery extends Component {
    render() {
        const {
            filename,
            percent,
            src,
            success,
            video
        } = this.props;

        console.log(percent);

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
                {
                    video
                        ? (<VideoDefault><p>{filename}</p></VideoDefault>)
                        : (<ImageBox src={src} />)
                }
            </PreviewContainer>
        );
    }
}

export default Gallery;
