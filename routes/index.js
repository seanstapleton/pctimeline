const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const _ = require('lodash');
const multiparty = require('multiparty');

const { asyncParseForm } = require('./utilities/utilities');

const dbx = new Dropbox({ accessToken: process.env.dropbox_access_token, fetch: fetch });
const router = express.Router();

const {
  getGalleries,
  getPhotos,
  uploadMedia
} = require('./controllers/galleries')(dbx);
const {
  isLoggedIn,
  authenticateUser
} = require('./controllers/login');

module.exports = (db, passport) => {
  router.get('/galleries', async (req, res) => {
    const galleries = await getGalleries();
    return res.send(galleries);
  });

  router.get('/photos/:id', async (req, res) => {
    const galleryName = req.params.id;
    const images = await getPhotos(galleryName);
    if (images === undefined) {
      return res.send({ success: false });
    }
    return res.send(images);
  });

  router.post('/photos/:id', async (req, res) => {
    try {
      const path = `/galleries/${req.params.id}`;
      const form = new multiparty.Form();
      const [fields, filesIn] = await asyncParseForm(form, req);
      const files = _.values(filesIn);

      const response = await uploadMedia(path, files);
      return res.send(response);
    } catch (e) {
      console.log(e.message);
      return res.send({ success: false, err: e.message });
    }
  });

  router.post('/form/:id', async (req, res) => {
    try {
      const path = `/forms/${req.params.id}`;
      const form = new multiparty.Form();
      const [fields, filesIn] = await asyncParseForm(form, req);
      const files = _.values(filesIn);

      const response = await uploadMedia(path, files);
      return res.send(response);
    } catch (e) {
      console.log(e.message);
      return res.send({ success: false, err: e.message });
    }
  });

  // Authentication routes
  router.get('/isLoggedIn', (req, res, next) => isLoggedIn(req, res, next));
  router.post('/login', (req, res, next) => authenticateUser(passport, req, res, next));
  router.get('/logout', (req, res) => { req.logout(); res.end(); });

  return router;
};