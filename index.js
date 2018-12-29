const fs = require('fs');
// const cron = require('node-cron');
const { promisify } = require('util');

// We'll be using this constant to set where the job should look for images.
const FILES_PATH = './images';

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
 * Main function used to start processing the images.
 */
const startProcessing = async () => {
  const files = await readFilesFromDir();
  files.forEach((img) => {
    console.log(img);
  });
};

startProcessing();

/* cron.schedule('* * * * *', () => {
  processImages();
}); */
