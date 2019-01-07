const _ = require('lodash');
const tmp = require('tmp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const getGalleriesInformation = async (dbx, folders) => {
    const galleries = [];

    for (const folder of folders) {
      const files = await dbx.filesListFolder({ path: folder.path_lower });
      const images = _.filter(files.entries, entry => entry['.tag'] === 'file');

      let headerImage = images[0];
      let headerImgSrc = { link: '' };

      headerImage = _.find(images,  image => _.includes(image.name, 'header')) || headerImage;
      if (headerImage) {
        headerImgSrc = await dbx.filesGetTemporaryLink({ path: headerImage.path_lower });
      }

      const formattedFolder = _.pick(folder, ['name', 'path_lower']);
      formattedFolder.header = headerImgSrc.link;

      galleries.push(formattedFolder);
    }

    return galleries;
}

const getVideoThumbnail = (path) =>
  new Promise((resolve, reject) => {
    // create temporary directory
    const tmpobj = tmp.dirSync();
    console.log('Dir: ', tmpobj.name);

    // Manual cleanup
    tmpobj.removeCallback();

    const proc = ffmpeg(path)
      .on('end', () => resolve(`${tmpobj.name}/tn.png`))
      .on('error', (err) => reject(err));

    proc.takeScreenshots({
      count: 1,
      timemarks: ['1']
    }, tmpobj.name);
  });

module.exports = {
  getGalleriesInformation,
  getVideoThumbnail
};