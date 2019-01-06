const csv = require('csvtojson');
const exif = require('fast-exif');
const fs = require('fs');
// const cron = require('node-cron');
const { promisify } = require('util');

// We'll be using this constant to set where the job should look for images.
const FILES_PATH = './images';
// We'll be using this constat to set where the job should look for control points.
const CONTROL_FILE_PATH = './controlpoints';
// We'll be using this constant to set the control points file name.
const CONTROL_FILE = 'controlPoints.csv';
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
 * Loops trough each one of the images and get the exif data for each one.
 * An object is created with the picture name and the gps data associated
 * with the image.
 * @param images Images to get exif data from
 * @returns {Array} imgs The images and its gps data
 */
const getExifData = async (images) => {
  const exifPromises = images.map(async (img) => {
    const exifData = await exif.read(`${FILES_PATH}/${img}`);
    return {
      img,
      gps: exifData.gps,
    };
  });
  const results = await Promise.all(exifPromises);
  return results;
};

/**
 * Loops trough each one of the images and convert the gps data
 * from degrees to decimal so that we can use turf library
 * to make calulations
 * @param imagesData Images and their gps data
 * @returns {Array} imgs The images and its gps data converted to decimal
 */
const degreesToDecimal = (imagesData) => {
  const imagesDecimalData = imagesData.map((imageData) => {
    const imageDecimalData = {};
    imageDecimalData.name = imageData.img;
    imageDecimalData.lat = imageData.gps.GPSLatitude[0]
      + (imageData.gps.GPSLatitude[1] / 60) + (imageData.gps.GPSLatitude[2] / 3600);
    imageDecimalData.lng = imageData.gps.GPSLongitude[0]
      + (imageData.gps.GPSLongitude[1] / 60) + (imageData.gps.GPSLongitude[2] / 3600);
    return imageDecimalData;
  });
  return imagesDecimalData;
};

/**
 * Read the csv file and converts it to a json object.
 * Note: This can be done in a single line without a function, for consistency
 * a function is used.
 * @returns {JSON} jsonCSV A json object with the data from the csv.
 */
const readCsv = async () => {
  const jsonCSV = await csv().fromFile(`${CONTROL_FILE_PATH}/${CONTROL_FILE}`);
  const data = jsonCSV.map((csv) => {
    const csvData = {
      name: csv.name,
      lat: csv.lat,
      lng: csv.lng,
    };
    return csvData;
  });
  return data;
};

/**
 * Main function used to start processing the images.
 */
const startProcessing = async () => {
  const files = await readFilesFromDir();
  const images = sanitizeFileList(files);
  const imagesExif = await getExifData(images);
  const gpsDecimalData = degreesToDecimal(imagesExif);
  const contronPoints = await readCsv();
  gpsDecimalData.forEach((img) => {
    console.log(img);
  });
  console.log('**********');
  contronPoints.forEach((controlPoint) => {
    console.log(controlPoint);
  });
};

startProcessing();

/* cron.schedule('* * * * *', () => {
  processImages();
}); */
