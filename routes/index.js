const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const _ = require('lodash');
const multiparty = require('multiparty');
const fs = require('fs');
const jimp = require('jimp');

const {
  getGalleriesInformation,
  getVideoThumbnail
} = require('./utilities/utilities');

const dbx = new Dropbox({ accessToken: 'b31IOz_iVoAAAAAAAAAAwkfekfZhZ0jq9U_zThq1v0TbCGoOMpIiKRPExvgO4kQJ', fetch: fetch });
const router = express.Router();

const movies = ['mp4', 'mov'];
const photos = ['jpg', 'jpeg', 'png'];

module.exports = (db) => {
  router.get('/galleries', async (req, res) => {
    const response = await dbx.filesListFolder({ path: '/galleries' });
    const { entries } = response;

    const folders = _.filter(entries, entry => entry['.tag'] === 'folder');
    const galleries = await getGalleriesInformation(dbx, folders);
    
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
    const srcLinkRequests = _.map(thumbnails, (thumbnail, idx) => {
      const thName = thumbnail.name.toLowerCase();
      let srcName = thName.match(/.+(?=_[0-9]+x[0-9]+\.(jpg|jpeg|png))/g)[0];
      let srcExtension = thName.match(/(?<=[0-9]+x[0-9]+\.)(jpg|jpeg|png)/g)[0];
      if (srcExtension === 'png') {
        let srcIdx = (thName.match(/(?<=_th)[0-9](?=_[0-9]+x[0-9]+\.)/g) || ["-1"])[0];
        srcIdx = parseInt(srcIdx);
        if (srcIdx > -1) {
          srcExtension = movies[srcIdx];
          srcName = thName.match(/.+(?=_th[0-9]_[0-9]+x[0-9]+\.(jpg|jpeg|png))/g)[0]
        }
      }
      thumbnails[idx].srcExtension = srcExtension;
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
        height,
        movie: _.includes(movies, thumbnail.srcExtension)
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
        console.log('FILE:', file);
        try {
          // get file extension
          const fileName = file[0].originalFilename.toLowerCase().match(/.+(?=.(jpg|jpeg|png|mp4|mov))/g)[0];
          const fileExtensionRegEx = new RegExp(`(?<=${fileName}\.).+`, 'g');
          const fileExtension = file[0].originalFilename.toLowerCase().match(fileExtensionRegEx)[0];
          console.log('file extension:', fileExtension);

          if (_.includes(movies, fileExtension)) {
            // file is a video
            const thumbnailPath = await getVideoThumbnail(file[0].path);
            const thumbnail = fs.readFileSync(thumbnailPath);
            const movie = fs.readFileSync(file[0].path);

            const tn = await jimp.read(thumbnail);
            const { width, height } = tn.bitmap;

            console.log('movies:', movies);
            console.log(fileExtension);
            const sourceIdx = _.findIndex(movies, elt => elt === fileExtension);
            console.log('source index:', sourceIdx);
            const thumbnailDBPath = `/galleries/${req.params.id}/thumbnails/${fileName}_th${sourceIdx}_${width}x${height}.png`;
            
            // upload files
            await dbx.filesUpload({ path: thumbnailDBPath, contents: thumbnail });
            await dbx.filesUpload({ path: `/galleries/${req.params.id}/${file[0].originalFilename}`, contents: movie });

          } else if (_.includes(photos, fileExtension)) {
            // file is a photo
            let image = await jimp.read(file[0].path);
            const { width, height } = image.bitmap;
            let mimeType = (fileExtension === 'jpg') ? 'JPEG' : fileExtension;
            mimeType = jimp[`MIME_${mimeType.toUpperCase()}`];

            // get dropbox file paths 
            const thumbnailPath = `${path}/thumbnails/${fileName}_${width}x${height}.${fileExtension}`;
            const filePath = `${path}/${fileName}.${fileExtension}`;

            // create buffers
            const targetHeight = 400;
            const resizeRatio = targetHeight/height
            const imageBuffer = await image.getBufferAsync(mimeType); 
            const resized = image.scale(resizeRatio);
            const thumbnailBuffer = await resized.getBufferAsync(mimeType);
            
            // upload photos
            await dbx.filesUpload({ path: filePath, contents: imageBuffer });
            await dbx.filesUpload({ path: thumbnailPath, contents: thumbnailBuffer });

          } else {
            // file format is not accepted
            return res.sendFile({ success: false, err: `${fileExtension} file format not accepted`});
          }
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