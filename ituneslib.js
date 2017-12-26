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
    Object.keys(data).forEach(function (key) {
      var value = data[key];
      if (typeof value === 'object') {
        reformat_keys(value);
      }
      delete data[key];
      var newkey = key.toLowerCase().replace(/\s/g, '_');
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

  this.Track = function Track(trackData) {
    var track_keys = [
      'track_id',
      'size',
      'total_time',
      'date_modified',
      'date_added',
      'bit_rate',
      'sample_rate',
      'persistent_id',
      'track_type',
      'file_folder_count',
      'library_folder_count',
      'name',
      'artist',
      'album',
      'genre',
      'kind',
      'location'
    ];
    if (trackData != null && typeof trackData === 'object') {
      for (var i = 0; i < track_keys.length; i++) {
        var key = track_keys[i];
        if (trackData[key] !== null) {
          this[key] = trackData[key];
        }
      }
    }
  };

  this.getMajorVersion = function getMajorVersion() {
    if (ready) {
      return data.major_version;
    }
  };

  this.getMinorVersion = function getMinorVersion() {
    if (ready) {
      return data.minor_version;
    }
  };

  this.getApplicationVersion = function getApplicationVersion() {
    if (ready) {
      return data.application_version;
    }
  };
};


