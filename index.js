const fs = require('fs');
// const cron = require('node-cron');
const { promisify } = require('util');

// We'll be using this constant to set where the job should look for images.
const FILES_PATH = './images';
// This constant is used to filter the file list and keep only the images. For simplicity
// only jpg images will be processed.
const REGEX_IMAGE = /\.(jpg)$/i;

// We apply promisify to readdir function so that we can use it with async await.
const readdir = promisify(fs.readdir);

/**
 * Read the files inside the specified path directory, return an array with the files names,
 * if there is any error tryng to read the list of files then an empty array should be returned.
 * @returns {Array} files
 */
const readFilesFromDir = async () => {
  try {
    const files = await readdir(FILES_PATH);
    return files;
  } catch (error) {
    return [];
  }
};

/**
 * Loops trough the list of files and keeps only the images specified in the constant.
 * @param files The list of files to be sanitized.
 * @returns {Array} imgs The sanitized list of images.
 */
const sanitizeFileList = (files) => {
  const imgs = files.filter(img => REGEX_IMAGE.test(img));
  return imgs;
};

/**
 * Main function used to start processing the images.
 */
const startProcessing = async () => {
  const files = await readFilesFromDir();
  const images = sanitizeFileList(files);
  images.forEach((img) => {
    console.log(img);
  });
};

startProcessing();

/* cron.schedule('* * * * *', () => {
  processImages();
}); */
