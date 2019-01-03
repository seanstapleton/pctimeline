const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const _ = require('lodash');

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
      headerImage = _.find(images,  image => image.name === 'header.jpg') || headerImage;
      const headerImgSrc = await dbx.filesGetTemporaryLink({ path: headerImage.path_lower });
      const formattedFolder = _.pick(folder, ['name', 'path_lower']);
      formattedFolder.header = headerImgSrc.link;
      galleries.push(formattedFolder);
    }
    
    return res.send(galleries);
  });

  router.get('/photos/:id', async (req, res) => {
    const path = `/galleries/${req.params.id}`;
    const response = await dbx.filesListFolder({ path });
    const { entries } = response;
    const files = _.filter(entries, entry => entry['.tag'] === 'file');
    const fileSources = _.map(files, file => dbx.filesGetTemporaryLink({ path: file.path_lower }));
    const sources = await Promise.all(fileSources);
    const sourceLinks = _.map(sources, source => source.link);
    res.send(sourceLinks);
  });

  return router;
};