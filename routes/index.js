const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const _ = require('lodash');
const multiparty = require('multiparty');

const {
  asyncParseForm,
  getFileExtension,
  getFilesInFolder,
  getGalleriesInformation,
  getSourceLinksFromThumbnailNames,
  getImagesArrayFromThumbnailsAndSourceLinks,
  uploadPhoto,
  uploadVideo
} = require('./utilities/utilities');

const dbx = new Dropbox({ accessToken: process.env.dropbox_access_token, fetch: fetch });
const router = express.Router();

const movies = ['mp4', 'mov'];
const photos = ['jpg', 'jpeg', 'png'];

module.exports = (db, passport) => {
  router.get('/galleries', async (req, res) => {
    try {
      const response = await dbx.filesListFolder({ path: '/galleries' });
      const { entries } = response;

      const folders = _.filter(entries, entry => entry['.tag'] === 'folder');
      const galleries = await getGalleriesInformation(dbx, folders);
      return res.send(galleries);
    } catch (e) {
      console.log(e.message);
    }
  });

  router.get('/photos/:id', async (req, res) => {
    try {
      // get thumbnails
      const thumbnailsPath = `/galleries/${req.params.id}/thumbnails`;
      const thumbnails = await getFilesInFolder(dbx, thumbnailsPath);
      if (!thumbnails) {
        return res.send();
      }

      // get thumbnail and source links
      const thumbnailLinkRequests = _.map(thumbnails, thumbnail => dbx.filesGetTemporaryLink({ path: thumbnail.path_lower }));
      const srcLinkRequests = getSourceLinksFromThumbnailNames(dbx, thumbnails, req.params.id);

      const thumbnailLinks = await Promise.all(thumbnailLinkRequests);
      const srcLinks = await Promise.all(srcLinkRequests);

      // define images array
      const images = getImagesArrayFromThumbnailsAndSourceLinks(thumbnails, thumbnailLinks, srcLinks);

      return res.send(images);
    } catch (e) {
      console.log(e.message);
      return res.send({ success: false, err: e.message });
    }
  });

  router.post('/photos/:id', async (req, res) => {
    try {
      const path = `/galleries/${req.params.id}`;
      const form = new multiparty.Form();
      const [fields, filesIn] = await asyncParseForm(form, req);
      const files = _.values(filesIn);
      for (const file of files) {
        // get file extension
        const [filename, fileExtension] = getFileExtension(file[0].originalFilename);

        if (_.includes(movies, fileExtension)) {
          await uploadVideo(dbx, file, path, filename);
        } else if (_.includes(photos, fileExtension)) {
          await uploadPhoto(dbx, file, path, filename);
        } else {
          // file format is not accepted
          return res.sendFile({ success: false, err: `${fileExtension} file format not accepted`});
        }
      }
      return res.send({ success: true });
    } catch (e) {
      console.log(e.message);
      return res.send({ success: false, err: e.message });
    }
  });

  // Passport login methods
  const isLoggedIn = (req, res) => {
    if (req.isAuthenticated()) res.send({ loggedIn: true });
    else res.send({ loggedIn: false });
  };

  // Check if user is logged in
  router.get('/isLoggedIn', (req, res, next) => isLoggedIn(req, res, next));

  router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user) => {
      if (err) {
        console.log(`error: ${err}`);
        return next(err);
      }
      if (!user) {
        console.log('error user');
        return res.send({ success: false, err });
      }
      req.login(user, (loginErr) => {
        console.log(user, loginErr);
        if (loginErr) {
          return next(loginErr);
        }
        res.send({ success: true });
      });
    })(req, res, next);
  });

  router.get('/logout', (req, res) => {
    req.logout();
    res.end();
  });

  return router;
};