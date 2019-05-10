const _ = require('lodash');
const {
    asyncParseForm,
    getFileExtension,
    getFilesInFolder,
    getGalleriesInformation,
    getSourceLinksFromThumbnailNames,
    getImagesArrayFromThumbnailsAndSourceLinks,
    uploadPhoto,
    uploadVideo
} = require('../utilities/utilities');

module.exports = (dbx) => {
    /* Returns a list of gallery objects with properties
        name - gallery title
        path_lower - path in Dropbox to the gallery folder
        header - URL to header image for the gallery
    */
    const getGalleries = async () => {
        try {
            const response = await dbx.filesListFolder({ path: '/galleries' });
            const { entries } = response;
            
            // filter out anything thats not a folder
            const folders = _.filter(entries, entry => entry['.tag'] === 'folder');
            const galleries = await getGalleriesInformation(dbx, folders);

            return galleries;
          } catch (e) {
            console.log(e.message);
            return undefined;
          }
    }

    /* Given a gallery name, returns list of thumbnail objects with properties
        name - filename including extension
        path_lower - path to file in Dropbox
        size - size in bytes of the file
    */
    const getThumbnails = async (galleryName) => {
      const thumbnailsPath = `/galleries/${galleryName}/thumbnails`;
      const thumbnails = await getFilesInFolder(dbx, thumbnailsPath);
      if (!thumbnails) {
        return undefined;
      }
      return thumbnails;
    }

    /* Given a thumbnails with correct naming format, returns an object with properties
        thumbnails - list of URLs to raw thumbnails
        sources - list of URLs to raw source files
    */
    const getThumbnailAndSourceLinks = async (thumbnails, galleryName) => {
      const thumbnailLinkRequests = _.map(thumbnails, thumbnail => dbx.filesGetTemporaryLink({ path: thumbnail.path_lower }));
      const srcLinkRequests = getSourceLinksFromThumbnailNames(dbx, thumbnails, galleryName);

      const thumbnailLinks = await Promise.all(thumbnailLinkRequests);
      const srcLinks = await Promise.all(srcLinkRequests);

      if (thumbnailLinks && srcLinks) {
          return {
              thumbnails: thumbnailLinks,
              sources: srcLinks
          }
      }
      return undefined;
    }

    /* Given a gallery name, return a list of image objects with properties
        thumbnail - URL to the raw image thumbnail
        src - URL to  the raw source image
        width - pixel width of the image
        height - pixel height of the image
        movie - boolean that is true when the source is a video, false otherwise
    */
    const getPhotos = async (galleryName) => {
        const thumbnails = await getThumbnails(galleryName);
        const links = await getThumbnailAndSourceLinks(thumbnails, galleryName);

        if (!thumbnails || !links) {
            return undefined;
        }

        const images = getImagesArrayFromThumbnailsAndSourceLinks(thumbnails, links.thumbnails, links.sources);

        if (!images) {
            return undefined;
        }

        return images;
    }

    const MOVIE_EXTENSIONS = ['mp4', 'mov'];
    const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png'];

    // Given path to upload to and a list of files, upload all files to the path in Dropbox
    const uploadMedia = async (path, files) => {
        for (const file of files) {
            // get file extension
            const [filename, fileExtension] = getFileExtension(file[0].originalFilename);

            if (_.includes(MOVIE_EXTENSIONS, fileExtension)) {
                await uploadVideo(dbx, file, path, filename, fileExtension);
            } else if (_.includes(PHOTO_EXTENSIONS, fileExtension)) {
                await uploadPhoto(dbx, file, path, filename, fileExtension);
            } else {
                // file format is not accepted
                return { success: false, err: `${fileExtension} file format not accepted`};
            }
        }
        return { success: true };
    }

    return {
        getGalleries,
        getPhotos,
        uploadMedia
    }
};
