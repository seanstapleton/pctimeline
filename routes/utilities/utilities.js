const _ = require('lodash');
const tmp = require('tmp');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const sharp = require('sharp');
const exifParser = require('exif-parser');

const movies = ['mp4', 'mov'];
const photos = ['jpg', 'jpeg', 'png'];

// Checks `path` in Dropbox and returns all items tagged as 'file'
const getFilesInFolder = async (dbx, path) => {
  const data = await dbx.filesListFolder({ path });
  return _.filter(data.entries, entry => entry['.tag'] === 'file');
};

//
const getSourceLinksFromThumbnailNames = (dbx, thumbnails, gallery) => {
  return _.map(thumbnails, (thumbnail, idx) => {
    const thName = thumbnail.name.toLowerCase();

    // Extracts the name of a file (e.g. some_image.png => some_image)
    let srcName = thName.match(/.+(?=_[0-9]+x[0-9]+\.(jpg|jpeg|png))/g)[0];

    // Extracts the extension from a filename (e.g. some_image.png => png)
    let srcExtension = thName.match(/(?<=[0-9]+x[0-9]+\.)(jpg|jpeg|png)/g)[0];

    // if screenshot, get video
    if (srcExtension === 'png') {
      // Screenshot thumbnails are stored in the format `<name>_th<video extension index>_<width>x<height>.png
      // Check if filename follows that pattern
      let srcIdx = (thName.match(/(?<=_th)[0-9](?=_[0-9]+x[0-9]+\.)/g) || ["-1"])[0];
      srcIdx = parseInt(srcIdx);
      if (srcIdx > -1) {
        srcExtension = movies[srcIdx];
        srcName = thName.match(/.+(?=_th[0-9]_[0-9]+x[0-9]+\.(jpg|jpeg|png))/g)[0]
      }
    }

    thumbnails[idx].srcExtension = srcExtension;
    const srcPath = `/galleries/${gallery}/${srcName}.${srcExtension}`;
    
    // return Promise to be executed asynchronously
    return dbx.filesGetTemporaryLink({ path: srcPath });
  });
};

/*
  Input:
    dbx - instance of Dropbox object
    folders - list of galleries to search 
  Output:
    List of gallery objects each with properties
      name - gallery name
      path_lower - path to gallery in the Dropbox folder in all lowercase
      link - URL to the gallery header, if it exists
*/
const getGalleriesInformation = async (dbx, folders) => {
    const galleries = [];

    for (const folder of folders) {
      const files = await getFilesInFolder(dbx, folder.path_lower);

      const headerImage = _.find(files,  file => _.includes(file.name, 'header')) || _.first(files);
      let headerImgSrc = { link: '' };

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

const getImagesArrayFromThumbnailsAndSourceLinks = (thumbnails, thumbnailLinks, srcLinks) =>
  _.map(thumbnails, (thumbnail, idx) => {
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

const asyncParseForm = (form, req) =>
  new Promise((resolve, reject) => {
    form.parse(req, (err, fields, filesIn) => {
      if (err) {
        reject(err);
      } else {
        resolve([fields, filesIn]);
      }
    });
  });

const getFileExtension = (filename) => {
  const name = filename.toLowerCase().match(/.+(?=.(jpg|jpeg|png|mp4|mov))/g)[0];
  const extensionRegEx = new RegExp(`(?<=${name}\.).+`, 'g');
  const extension = filename.toLowerCase().match(extensionRegEx)[0];
  return [name, extension];
};

const uploadVideo = async (dbx, file, path, filename, fileExtension) => {
  const thumbnailPath = await getVideoThumbnail(file[0].path);
  const movieBuffer = fs.readFileSync(file[0].path);

  const thumbnail = await sharp(thumbnailPath).rotate().toBuffer({ resolveWithObject: true });
  const { width, height } = thumbnail.info;

  const sourceIdx = _.findIndex(movies, elt => elt === fileExtension);
  const thumbnailDBPath = `${path}/thumbnails/${filename}_th${sourceIdx}_${width}x${height}.png`;

  // upload files
  await dbx.filesUpload({ path: thumbnailDBPath, contents: thumbnail.data });
  await dbx.filesUpload({ path: `${path}/${filename}.${fileExtension}`, contents: movieBuffer });
};

const uploadPhoto = async (dbx, file, path, filename, fileExtension) => {
  const sharpInstance = sharp(file[0].path);
  const imageBuffer = await sharpInstance.rotate().toBuffer({ resolveWithObject: true });
  const thumbnailBuffer = await sharpInstance.rotate().resize({ height: 400 }).toBuffer({ resolveWithObject: true });
  
  const { width, height } = imageBuffer.info;

  // get dropbox file paths 
  const thumbnailPath = `${path}/thumbnails/${filename}_${width}x${height}.${fileExtension}`;
  const filePath = `${path}/${filename}.${fileExtension}`;

  // upload photos
  await dbx.filesUpload({ path: filePath, contents: imageBuffer.data });
  await dbx.filesUpload({ path: thumbnailPath, contents: thumbnailBuffer.data });
};

module.exports = {
  asyncParseForm,
  getFileExtension,
  getFilesInFolder,
  getGalleriesInformation,
  getVideoThumbnail,
  getSourceLinksFromThumbnailNames,
  getImagesArrayFromThumbnailsAndSourceLinks,
  uploadPhoto,
  uploadVideo
};