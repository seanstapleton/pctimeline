const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const _ = require('lodash');
const multiparty = require('multiparty');
const fs = require('fs');
const sizeOf = require('image-size');
const jimp = require('jimp');
const tmp = require('tmp');

const dbx = new Dropbox({ accessToken: 'b31IOz_iVoAAAAAAAAAAwkfekfZhZ0jq9U_zThq1v0TbCGoOMpIiKRPExvgO4kQJ', fetch: fetch });
const router = express.Router();

module.exports = (db) => {
  router.get('/galleries', async (req, res) => {
    const response = await dbx.filesListFolder({ path: '/galleries' });
    const { entries } = response;
    const folders = _.filter(entries, entry => entry['.tag'] === 'folder');
    const galleries = [];

    for (const folder of folders) {
      const files = await dbx.filesListFolder({ path: folder.path_lower });
      const images = _.filter(files.entries, entry => entry['.tag'] === 'file');
      let headerImage = images[0];
      headerImage = _.find(images,  image => _.includes(image.name, 'header')) || headerImage;
      let headerImgSrc = { link: '' };
      if (headerImage) {
        headerImgSrc = await dbx.filesGetTemporaryLink({ path: headerImage.path_lower });
      }
      const formattedFolder = _.pick(folder, ['name', 'path_lower']);
      formattedFolder.header = headerImgSrc.link;
      galleries.push(formattedFolder);
    }
    
    return res.send(galleries);
  });

  router.get('/photos/:id', async (req, res) => {
    // get thumbnails
    const thumbnailsPath = `/galleries/${req.params.id}/thumbnails`;
    const response = await dbx.filesListFolder({ path: thumbnailsPath });
    const { entries } = response;
    const thumbnails = _.filter(entries, entry => entry['.tag'] === 'file');

    // get thumbnail and source links
    const thumbnailLinkRequests = _.map(thumbnails, thumbnail => dbx.filesGetTemporaryLink({ path: thumbnail.path_lower }));
    const srcLinkRequests = _.map(thumbnails, thumbnail => {
      const srcName = thumbnail.name.toLowerCase().match(/.+(?=_[0-9]+x[0-9]+\.(jpg|jpeg|png))/g)[0];
      const srcExtension = thumbnail.name.toLowerCase().match(/(?<=[0-9]+x[0-9]+\.)(jpg|jpeg|png)/g)[0];
      const srcPath = `/galleries/${req.params.id}/${srcName}.${srcExtension}`;
      return dbx.filesGetTemporaryLink({ path: srcPath });
    });
    const thumbnailLinks = await Promise.all(thumbnailLinkRequests);
    const srcLinks = await Promise.all(srcLinkRequests);

    // define images array
    const images = _.map(thumbnails, (thumbnail, idx) => {
      const name = thumbnail.name;
      const [width, height] = name.match(/(?<=_)[0-9]+x[0-9]+(?=\.)/g)[0].split('x');
      const thumbnailLink = thumbnailLinks[idx].link;
      const srcLink = srcLinks[idx].link;

      return {
        thumbnail: thumbnailLink,
        src: srcLink,
        width,
        height
      };
    });

    res.send(images);
  });

  router.post('/photos/:id', async (req, res) => {
    const path = `/galleries/${req.params.id}`;
    const form = new multiparty.Form();
    let files;
    form.parse(req, async (err, fields, filesIn) => {
      if (err) {
        return res.send({ success: false, err });
      }
      const files = _.values(filesIn);
      for (const file of files) {
        try {
          // get file information
          const fileData = fs.readFileSync(file[0].path);
          const { width, height } = sizeOf(file[0].path);
          const imageName = file[0].originalFilename.toLowerCase().match(/.+(?=.(jpg|jpeg|png))/g)[0];
          const fileExtensionRegEx = new RegExp(`(?<=${imageName}\.).+`, 'g');
          const fileExtension = file[0].originalFilename.toLowerCase().match(fileExtensionRegEx)[0];

          // get dropbox file paths
          const thumbnailPath = `${path}/thumbnails/${imageName}_${width}x${height}.${fileExtension}`;
          const filePath = `${path}/${imageName}.${fileExtension}`;

          // create thumbnail
          const image = await jimp.read(file[0].path);
          const targetHeight = 400;
          const resizeRatio = targetHeight/height
          const resized = image.resize(width*resizeRatio, targetHeight);
          let mimeType = (fileExtension === 'jpg') ? 'JPEG' : fileExtension;
          mimeType = jimp[`MIME_${mimeType.toUpperCase()}`];
          const base64thumbnail = await resized.getBufferAsync(mimeType);
          
          // upload photos
          await dbx.filesUpload({ path: filePath, contents: fileData });
          await dbx.filesUpload({ path: thumbnailPath, contents: base64thumbnail });

        } catch (err) {
          console.log(err);
          return res.send({ success: false, err });
        }
      }
      return res.send({ success: true });
    });
  });

  return router;
};