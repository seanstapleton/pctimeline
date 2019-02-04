import React, { Component } from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';
import axios from 'axios';
import _ from 'lodash';
import { Line } from 'rc-progress';
import { Redirect } from 'react-router-dom';

import ImagePreview from './ImagePreview';
import Header from './Header';
import { asyncSetState } from '../utilities/react-utilities';

const ImageDropzoneContainer = styled.div`
    width: calc(90vw - 40px);
    margin: 5vh auto;
    max-width: 960px;
    padding: 20px;
    background-color: #ddd;
    opacity: 0.98;
    border-radius: 5px;
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
    min-height: 150px;
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

const QueueActionsContainer = styled.div`
    width: 100%;
    margin: 0 auto;
    & button {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
        border: none;
        color: #fff;
        font-family: 'Open Sans';
        font-weight: 200;
        background-color: #B180E8;
        cursor: pointer;
    }
    & button:nth-of-type(2) {
        background-color: #FF5F5E;
    }

    @media (min-width: 768px) {
        width: 410px;
        & button {
            width: 200px;
        }
        & button:nth-of-type(2) {
            margin-left: 10px;
        }
    }
`;
const DropText = styled.p`
    font-family: 'Open Sans';
    font-weight: 200;
    text-align: center;
    margin-top: 50px;
`;
const UploadForm = styled.div`
    width: 100%;
    margin: 10px auto 0 auto;
    & select {
        width: 100%;
        border: none;
        height:  40px;
        font-family: 'Open Sans';
        margin-bottom: 10px;
        padding: 0 10px;
    }
    & button {
        padding: 10px;
        height: 40px;
        background-color: #B180E8;
        font-family: 'Open Sans';
        color: #fff;
        font-weight: 200;
        border: none;
        border-radius: 5px;
        width: 100%;
        cursor: pointer;
        &:disabled {
            background-color: #CBBFDE;
            color: #ddd;
        }
    }

    @media (min-width: 768px) {
        width: 410px;
        & select {
            width: 200px;
            margin-bottom: 0;
        }
        & button {
            width: 200px;
            margin-left: 10px;
        }
    }
`;
const loadingBarStyles = {
    position: 'absolute',
    top: '0',
    left: '0'
};

class UploadPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chosenGallery:  '',
            galleries: [],
            images: [],
            loadingProgress: false,
            uploading: false
        };

        this.signal = axios.CancelToken.source();

        this.onDrop = this.onDrop.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.clearFiles = this.clearFiles.bind(this);
        this.asyncSetState = asyncSetState.bind(this);
    }

    async componentDidMount() {
        const { authed } = this.props;
        if (authed) {
            const response = await axios.get('/backendServices/galleries', {
                cancelToken: this.signal.token
            });
            const galleries = _.reverse(response.data);
            this.setState({
                chosenGallery: galleries[0].name,
                galleries
            });
        }
    }

    componentWillUnmount() {
        this.signal.cancel('HTTP calls are being canceled');
    }

    clearFiles() {
        this.setState({ images: [] });
    }

    onSelectChange(e) {
        this.setState({ chosenGallery: e.target.value });
    }

    async onSubmit() {
        const {
            chosenGallery,
            images
        } = this.state;

        // partition images 
        const imagesPartition = _.partition(images, image => image.uploadPercent > 0);
        const imagesToUpload = imagesPartition[1];

        await this.asyncSetState({
            uploading: true,
            images: imagesToUpload
        });

        // upload images in parallel
        const imageUploads = _.map(imagesToUpload, (image, idx) =>
            new Promise( async (resolve) => {
                const imageData = new FormData();
                imageData.append(image.file.name, image.file);
                let response;
                try {
                    response = await axios.post(`/backendServices/photos/${chosenGallery}`, imageData, {
                        onUploadProgress: (evt) => {
                            if (evt.lengthComputable) {
                                this.setState(state => {
                                    const newImages = _.cloneDeep(state.images);
                                    const uploadPercent = evt.loaded/evt.total;
                                    console.log('percent:', uploadPercent);
                                    if (uploadPercent < 1) {
                                        newImages[idx].uploadPercent = (0.5*(uploadPercent)).toFixed(2);
                                    } else {
                                        const rand = _.random(0.5,0.8);
                                        newImages[idx].uploadPercent = rand.toFixed(2);
                                    }
                                    // else if (!newImages[idx].timeouts) {
                                    //     console.log('yo');
                                    //     newImages[idx].uploadPercent = (0.5*(uploadPercent)).toFixed(2);
                                    //     newImages[idx].timeouts = _.map(_.range(5), rangeValue => setTimeout(() => {
                                    //         const updateRatio = _.random(0.05,0.099);
                                    //         newImages[idx].uploadPercent = 0.5 + 0.09*rangeValue;
                                    //     }, (rangeValue+1)*1000));
                                    // }
                                    return { images: newImages };
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
                    const newImages = _.cloneDeep(state.images);
                    _.forEach(newImages[idx].timeouts, timeout => clearTimeout(timeout));
                    newImages[idx].uploadPercent = 1;
                    newImages[idx].success = success;
                    return { images: newImages };
                });
                resolve(response);
            }));

        Promise.all(imageUploads).then((results) => {
            console.log('done!');
            this.setState({ uploading: false });
        });
    }

    onDrop(newImages) {
        this.setState({ uploadDisabled: false });
        _.forEach(newImages, (file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileAsBinaryString = reader.result;
                this.setState(state => {
                    const images = state.images;
                    const newImage = {
                        file: newImages[idx],
                        preview: fileAsBinaryString,
                        uploadPercent: 0
                    };
                    images.push(newImage);
                    return { images };
                });
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsDataURL(file);
        });
    }

    render() {
        const {
            chosenGallery,
            galleries,
            images,
            loadingProgress,
            uploading
        } = this.state;
        const {
            authed,
            setReturnRoute
        } = this.props;
        if (!authed) {
            setReturnRoute('/upload');
            return (<Redirect to='/login' />);
        }
        return (
            <div style={{ height: '100vh', backgroundColor: '#BD9CDB' }}>
                <Header />
                <Dropzone onDrop={this.onDrop}>
                    { ({getRootProps, getInputProps, isDragActive}) => (
                        <ImageDropzoneContainer className={classNames('dropzone', {'dropzone-active': isDragActive})}>
                            <QueueActionsContainer>
                                <button {...getRootProps()} disabled={uploading}>Add files</button>
                                <button onClick={this.clearFiles} disabled={uploading}>Clear files</button>
                            </QueueActionsContainer>
                            <input {...getInputProps()} />
                            <ImagePreviewWindow {...getRootProps()} onClick={() => {}}>
                                { 
                                    (images.length === 0)
                                        ? (<DropText>Try dropping some files here or click 'Add files' to select files to upload.</DropText>)
                                        : _.map(images, image => {
                                            const { type } = image.file;
                                            return (
                                                <ImagePreview
                                                    src={image.preview}
                                                    percent={image.uploadPercent}
                                                    success={image.success}
                                                    video={_.includes(type, 'video')}
                                                    filename={image.file.name}
                                                />
                                            )
                                        })
                                }
                            </ImagePreviewWindow>
                            <UploadForm>
                                <select value={chosenGallery} onChange={this.onSelectChange} required>
                                    <option value='n/a' selected disabled>Select Event</option>
                                    { _.map(galleries, gallery => (
                                        <option value={gallery.name}>{gallery.name}</option>
                                    ))}
                                </select>
                                <button onClick={this.onSubmit} disabled={uploading || images.length === 0}>Upload Images</button>
                            </UploadForm>
                        </ImageDropzoneContainer>
                    )}
                </Dropzone>
            </div>

        );
    }
}

export default UploadPage;
