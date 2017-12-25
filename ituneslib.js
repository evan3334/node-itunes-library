var fs = require('fs');
var Promise = require('promise');
var plist = require('plist');

module.exports = function ituneslib() {
  var data;
  var ready = false;

  //function to make sure we're given a valid file
  function validateFilename(fname) {
    //will fail if filename is null or not a string, file doesn't exist, or file is a directory
    return (fname !== null && typeof fname === 'string' && fs.existsSync(fname) && !fs.lstatSync(fname).isDirectory());
  }

  //function to reformat all the keys from the plist file to not be strings with spaces and stuff in them
  function reformat_keys(data) {
    Object.keys(data).forEach(function(key){
      var value = data[key];
      if(typeof value==='object') {
        reformat_keys(value);
      }
      delete data[key];
      var newkey = key.toLowerCase().replace(/\s/,'');
      data[newkey] = value;
    });
  }

  //opens an itunes library xml file and reads and reformats the data
  this.open = function open(filename) {
    if (!validateFilename(filename)) {
      throw 'Invalid file path!';
    }
    return new Promise(function (fulfill, reject) {
      fs.readFile(filename, function (err, dat) {
        if (err) {
          //if there's an error reading the file, reject the promise
          reject(err);
        }
        else {
          try {
            var xmlData = dat.toString();
            xmlData = xmlData.replace(/[\n\t\r]/g, '');
            data = plist.parse(xmlData);
            reformat_keys(data);
            ready = true;
            fulfill();
          }
          catch (err) {
            //if any errors thrown, reject the promise
            reject(err);
          }
        }
      });
    });
  };

  this.getRawData = function getRawData() {
    return data;
  };




}


