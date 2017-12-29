var fs = require('fs');
var Promise = require('promise');
var plist = require('plist');

module.exports = function ituneslib() {
  var data;
  var ready = false;
  var instance = this;

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

  module.exports.Track = function Track(trackData) {
    //list of all the properties that an iTunes library track will have
    var properties = [
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
      //go through all the valid properties and assign them to our new Track object
      //this makes sure that a returned Track object always has the same properties and doesn't have any extras
      for (var i = 0; i < properties.length; i++) {
        //variable to hold current property
        var prop = properties[i];
        //set the current property's value to the new Trap object
        this[prop] = trackData[prop];

      }
    }
  };

  this.getTracks = function getTracks() {
    var getTrackByIDSync = this.getTrackByIDSync;
    return new Promise(function (fulfill, reject) {
      if (ready) {
        try {
          var output = [];
          var keys = Object.keys(data.tracks);
          for (var i = 0; i < keys.length; i++) {
            var currentKey = keys[i];
            output.push(getTrackByIDSync(currentKey));
          }
          fulfill(output);
        }
        catch (e) {
          reject(e);
        }
      }
      else {
        reject(new Error("No data ready (call open() first)!"));
      }
    })
  };

  this.getTrackByIDSync = function getTrackByIDSync(id) {
    var Track = module.exports.Track;
    if (ready) {
      if (id !== null) {
        if (data.tracks[id]) {
          var tdata = data.tracks[id];
          return new Track(tdata);
        }
        else {
          throw new Error("No track found for the specified id!");
        }
      }
      else {
        throw new Error("Track ID is null!");
      }
    }
    else {
      throw new Error("No data ready (call open() first)!");
    }
  };

  this.getTrackByID = function getTrackByID(id) {
    var Track = module.exports.Track;
    return new Promise(function (fulfill, reject) {
      if (ready) {
        if (id !== null && id !== undefined) {
          if (data.tracks[id]) {
            try {
              var tdata = data.tracks[id];
              var t = new Track(tdata);
              fulfill(t);
            }
            catch (e) {
              reject(e);
            }
          }
          else {
            reject(new Error("No track found for the specified id!"));
          }
        }
        else {
          reject(new Error("Track ID is null!"));
        }
      }
      else {
        reject(new Error("No data ready (call open() first)!"));
      }
    })
  };

  module.exports.Playlist = function Playlist(playlistData) {
    var getTrackByIDSync = instance.getTrackByIDSync;
    var thisPlaylist = this;
    var properties = [
      'master',
      'playlist_id',
      'playlist_persistent_id',
      'all_items',
      'visible',
      'name',
      'playlist_items',
      'distinguished_kind',
      'music',
      'smart_info',
      'smart_criteria',
      'movies',
      'tv_shows',
      'podcasts',
      'itunesu',
      'audiobooks',
      'books'
    ];
    if (playlistData != null && typeof playlistData === 'object') {
      //go through all the valid properties and assign them to our new Track object
      //this makes sure that a returned Track object always has the same properties and doesn't have any extras
      for (var i = 0; i < properties.length; i++) {
        //variable to hold current property
        var prop = properties[i];
        //set the current property's value to the new Trap object
        this[prop] = playlistData[prop];

      }
    }

    this.getPlaylistItems = function getPlaylistItems(full_data) {
      return new Promise(function (fulfill, reject) {
        try {
          var output = [];
          if (full_data === undefined) {
            full_data = true;
          }
          if (thisPlaylist.playlist_items === null || thisPlaylist.playlist_items === undefined) {
            fulfill([]);
          }

          for (var i = 0; i < thisPlaylist.playlist_items.length; i++) {
            if (full_data) {
              output.push(getTrackByIDSync(thisPlaylist.playlist_items[i].track_id));
            }
            else {
              output.push(thisPlaylist.playlist_items[i]);
            }
          }
          fulfill(output);
        }
        catch (e) {
          reject(e);
        }
      });
    }
  };

  this.getPlaylistByID = function getPlaylistByID(id) {
    var Playlist = module.exports.Playlist;
    return new Promise(function (fulfill, reject) {
      if (ready) {
        if (id !== null && id !== undefined) {
          try {
            var playlists = data.playlists;
            for (var i = 0; i < playlists.length; i++) {
              var playlist = playlists[i];
              if (playlist.playlist_id && playlist.playlist_id === id) {
                fulfill(new Playlist(playlist));
              }
            }
          }
          catch (e) {
            reject(e);
          }
          reject(new Error("No playlist found for the specified id!"));
        }
        else {
          reject(new Error("Playlist ID is null!"));
        }
      }
      else {
        reject(new Error("No data ready (call open() first)!"));
      }
    })
  };

  this.getPlaylistByIDSync = function getPlaylistByIDSync(id) {
    var Playlist = module.exports.Playlist;
      if (ready) {
        if (id !== null && id !== undefined) {
          try {
            var playlists = data.playlists;
            for (var i = 0; i < playlists.length; i++) {
              var playlist = playlists[i];
              if (playlist.playlist_id && playlist.playlist_id === id) {
                return new Playlist(playlist);
              }
            }
          }
          throw new Error("No playlist found for the specified id!");
        }
        else {
          throw new Error("Playlist ID is null!");
        }
      }
      else {
        throw new Error("No data ready (call open() first)!");
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
};