const fs = require('fs');
// const cron = require('node-cron');
const { promisify } = require('util');

// We'll be using this constant to set where the job should look for images.
const IMG_PATH = './images';

// We apply promisify to readdir function so that we can use it with async await.
const readdir = promisify(fs.readdir);

const readImagesFromDir = async () => {
  try {
    const images = await readdir(IMG_PATH);
    return images;
  } catch (error) {
    return [];
  }
};

const startProcessing = async () => {
  const images = await readImagesFromDir();
  images.forEach((img) => {
    console.log(img);
  });
};

startProcessing();

/* cron.schedule('* * * * *', () => {
  processImages();
}); */
