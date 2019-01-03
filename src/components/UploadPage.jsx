import React, { Component } from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';
import axios from 'axios';
import _ from 'lodash';

import Header from './Header';

const ImageDropzoneContainer = styled.div`
    width: calc(90% - 20px);
    margin: 5%;
    padding: 20px;
    background-color: #ddd;
    opacity: 0.98;
    border-radius: 5px;
`;
const ImagePreviewWindow = styled.div`
    background-color: #eee;
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    min-height: 150px;
`;
const ImagePreview = styled.img`
    width: 20%;
    padding: 5px;
    border-radius: 5px;
    float: left;
`;
const QueueActionsContainer = styled.div`
    width: 410px;
    margin: 0 auto;
    & button {
        padding: 10px;
        margin-bottom: 20px;
        border-radius: 5px;
        width: 200px;
        border: none;
        color: #fff;
        font-family: 'Open Sans';
        font-weight: 200;
        background-color: #B180E8;
    }
    & button:nth-of-type(2) {
        background-color: #FF5F5E;
        margin-left: 10px;
    }
`;
const DropText = styled.p`
    font-family: 'Open Sans';
    font-weight: 200;
    text-align: center;
    line-height: 100px;
`;
const UploadForm = styled.div`
    width: 410px;
    margin: 10px auto 0 auto;
    & select {
        width: 200px;
        border: none;
        height:  40px;
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
        width: 200px;
        margin-left: 10px;
    }
`;

class UploadPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            galleries: [],
            images: []
        };
        this.onDrop =  this.onDrop.bind(this);
    }

    async componentDidMount() {
        const response = await axios.get('/galleries');
        const galleries = response.data;
        this.setState({ galleries });
    }

    onDrop(newImages) {
        const imageBinaries = [];
        _.forEach(newImages, (file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileAsBinaryString = reader.result;
                this.setState(state => {
                    const images = state.images;
                    const newImage = {
                        file: newImages[idx],
                        preview: fileAsBinaryString
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
            galleries,
            images
        } = this.state;
        return (
            <div style={{ height: '100vh', background: 'url(https://dl.dropboxusercontent.com/s/4eu6ifskfc44d0j/collage.jpg) repeat', backgroundSize: 'cover' }}>
                <Header />
                <Dropzone onDrop={this.onDrop}>
                    { ({getRootProps, getInputProps, isDragActive}) => (
                        <ImageDropzoneContainer className={classNames('dropzone', {'dropzone-active': isDragActive})}>
                            <QueueActionsContainer>
                                <button {...getRootProps()}>Add files</button>
                                <button>Clear files</button>
                            </QueueActionsContainer>
                            <input {...getInputProps()} />
                            <ImagePreviewWindow {...getRootProps()} onClick={() => {}}>
                                { 
                                    (images.length === 0)
                                        ? (<DropText>Try dropping some files here or click 'Add files' to select files to upload.</DropText>)
                                        : images.map(image => (<ImagePreview src={image.preview} />))
                                }
                            </ImagePreviewWindow>
                            <UploadForm>
                                <select required>
                                    <option selected disabled>Select Event</option>
                                    { _.map(galleries, gallery => (
                                        <option value={gallery.path_lower}>{gallery.name}</option>
                                    ))}
                                </select>
                                <button>Upload Images</button>
                            </UploadForm>
                        </ImageDropzoneContainer>
                    )}
                </Dropzone>
            </div>

        );
    }
}

export default UploadPage;
