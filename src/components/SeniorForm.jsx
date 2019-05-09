import React, { Component } from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';
import axios from 'axios';
import _ from 'lodash';
import { Redirect } from 'react-router-dom';

import ImagePreview from './ImagePreview';
import Header from './Header';
import { asyncSetState } from '../utilities/react-utilities';

const ImageDropzoneContainer = styled.div`
    width: calc(90vw - 60px);
    margin: 5vh auto;
    max-width: 960px;
    padding: 30px;
    background-color: #ddd;
    opacity: 0.98;
    border-radius: 5px;
    overflow: auto;
    & *:focus {
        outline: 0;
    }

    @media(min-width: 768px) {
        width: calc(80vw - 40px);
    }
`;
const ImagePreviewWindow = styled.div`
    background-color: #eee;
    padding: 20px;
    border-radius: 5px;
    overflow-x: auto;
    min-height: 300px;
    position: relative;

    & div {
        margin-bottom: 10px;
    }

    @media(max-width: 768px) {
        & div:not(:nth-child(2n)) {
            margin-right: 15px;
        }
    }

    @media(min-width: 768px) {
        & div:not(:nth-child(3n)) {
            margin-right: 15px;
        }
    }
`;

const VideoDefault = styled.div`
    display: block;
    position: relative;
    width: calc(50% - 15px);
    height: 200px;
    padding: 5px;
    border-radius: 5px;
    float: left;
    background-color: #aec3db;
    background-image: url(/video.svg);
    background-position: center;
    background-repeat: no-repeat;
    background-size: 40%;

    & p {
        margin: 0;
        position: absolute;
        bottom: 5px;
        font-family: 'Just Another Hand';
        font-size: 2em;
        text-align: center;
        width: calc(100% - 10px);
    }

    @media (min-width: 768px) {
        width: calc(33% - 15px);
    }
`;

const DropText = styled.p`
    font-family: 'Open Sans';
    font-weight: lighter !important;
    font-size: 1.25em !important;
    text-align: center;
    margin-top: 120px;
`;

const Display = styled.h2`
    font-family: 'Open Sans';
    margin-bottom: 0;
`;
const Body = styled.p`
    font-family: 'Open Sans';
    margin-top: 5px;
`;
const QuestionsContainer = styled.div`
    & button {
        width: 100%;
        padding: 10px;
        margin-left: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
        border: none;
        color: #fff;
        font-family: 'Open Sans';
        font-weight: 200;
        background-color: #B180E8;
        cursor: pointer;

        @media(min-width: 768px) {
            width: 40%;
            display: block;
            margin-left: calc(30% + 10px);
            margin-top: 20px;
        }

        margin-top: 20px;

        &:disabled {
            background-color: #CBBFDE;
            color: #ddd;
        }
    }
`;
const Question = styled.div`
    width: ${props => props.full ? '100%' : 'calc(100% - 20px)' };
    float: left;
    cursor: pointer !important;
    padding: 10px;

    & p {
        margin-bottom: 10px;
        font-family: 'Open Sans';
        font-weight: bold;
        font-size: 1.25em;
    }

    @media (min-width: 768px) {
        width: ${props => props.full ? '100%' : 'calc(50% - 20px)' };
    }
`;


class SeniorForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploads: {
                'night-never-forget': [],
                'aww': [],
                'struggle': [],
                'pct': [],
                'take-an-L': [],
                'family': [],
                'all': [],
                'everything': [],
                uploading: false
            }
        };

        this.signal = axios.CancelToken.source();

        this.onDrop = this.onDrop.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.asyncSetState = asyncSetState.bind(this);
    }

    componentWillUnmount() {
        this.signal.cancel('HTTP calls are being canceled');
    }

    async onSubmit() {
        const { uploads } = this.state;
        const keys = _.keys(uploads);

        await this.asyncSetState({ uploading: true });

        // for each question
        for (let i = 0; i < keys.length; i += 1) {
            // upload images in parallel
            const key = keys[i];
            const imageUploads = _.map(uploads[key], (image, idx) =>
                new Promise( async (resolve) => {
                    if (image.uploadPercent > 0) return resolve(true);
                    const imageData = new FormData();
                    imageData.append(image.file.name, image.file);
                    let response;
                    try {
                        response = await axios.post(`/backendServices/form/${key}`, imageData, {
                            onUploadProgress: (evt) => {
                                if (evt.lengthComputable) {
                                    this.setState(state => {
                                        const uploadsClone = _.cloneDeep(state.uploads);
                                        const uploadPercent = evt.loaded/evt.total;
                                        if (uploadPercent < 1) {
                                            uploadsClone[key][idx].uploadPercent = (0.5*(uploadPercent)).toFixed(2);
                                        } else {
                                            const rand = _.random(0.5,0.8);
                                            uploadsClone[key][idx].uploadPercent = rand.toFixed(2);
                                        }
                                        return { uploads: uploadsClone };
                                    });
                                }
                            },
                            cancelToken: this.signal.token
                        });
                    } catch (e) {
                        console.log(e);
                    }
                    const success = _.get(response, 'data.success');
                    this.setState((state) => {
                        const uploadsClone = _.cloneDeep(state.uploads);
                        _.forEach(uploadsClone[key][idx].timeouts, timeout => clearTimeout(timeout));
                        uploadsClone[key][idx].uploadPercent = 1;
                        uploadsClone[key][idx].success = success;
                        return { uploads: uploadsClone };
                    });
                    resolve(response);
                })
            );

            await Promise.all(imageUploads);
            this.setState({ uploading: false });
        }
    }

    onDrop(newImages, name) {
        this.setState({ uploadDisabled: false });
        _.forEach(newImages, (file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileAsBinaryString = reader.result;
                const { type } = newImages[idx];
                this.setState(state => {
                    const uploads = state.uploads;
                    const newImage = {
                        file: newImages[idx],
                        preview: fileAsBinaryString,
                        uploadPercent: 0
                    };
                    uploads[name].push(newImage);
                    return { uploads };
                });
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.readAsDataURL(file);
        });
    }

    render() {
        const {
            uploads,
            uploading
        } = this.state;
        const {
            authed,
            setReturnRoute
        } = this.props;
        if (!authed) {
            setReturnRoute('/seniors');
            return (<Redirect to='/login' />);
        }
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#BD9CDB', overflow: 'auto' }}>
                <Header />
                <ImageDropzoneContainer>
                    <Display>Hey Seniors 😊</Display>
                    <Body>As part of our end of the year video, Jamie and I are hoping to get some of your videos from pledge semester onwards. We've put
                        together this form to help organize this collection, and would really appreciate if you could take 5-10 min to dig through your photos album/snapchat memories, etc and answer some of these questions.
                        Thanks and look forward to seeing your submissions! Please submit these by Tuesday at 11:59pm so we can make sure to include them in the video!
                    </Body>
                    <QuestionsContainer>
                        <Question>
                            <p>A night I'll never forget 🌃</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'night-never-forget')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['night-never-forget'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['night-never-forget'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <Question>
                            <p>Aww :)</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'aww')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['aww'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['aww'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <Question>
                            <p>The struggle was real 🙃</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'struggle')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['struggle'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['struggle'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <Question>
                            <p>What PCT means to me 💜</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'pct')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['pct'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['pct'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <Question>
                            <p>Sometimes you gotta take an L</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'take-an-L')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['take-an-L'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['take-an-L'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <Question>
                            <p>Family 👪</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'family')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['family'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['family'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <Question full={true}>
                            <p>Everything else you have!</p>
                            <Dropzone onDrop={(images) => this.onDrop(images, 'everything')}>
                                { ({getRootProps, getInputProps, isDragActive}) => (
                                    <ImagePreviewWindow {...getRootProps()}>
                                        { 
                                            (uploads['everything'].length === 0)
                                                ? (<DropText>Click to upload.</DropText>)
                                                : _.map(uploads['everything'], image => {
                                                    const { type } = image.file;
                                                    return (
                                                        <ImagePreview
                                                            src={image.preview}
                                                            percent={image.uploadPercent}
                                                            success={image.success}
                                                            video={_.includes(type, 'video')}
                                                            filename={image.file.name}
                                                            full={true}
                                                        />
                                                    )
                                                })
                                        }
                                    <input {...getInputProps()} />
                                    </ImagePreviewWindow>
                                )}
                            </Dropzone>
                        </Question>
                        <button onClick={this.onSubmit} disabled={uploading}>Submit</button>
                    </QuestionsContainer>
                </ImageDropzoneContainer>
            </div>

        );
    }
}

export default SeniorForm;
