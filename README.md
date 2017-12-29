# node-itunes-library [![npm version](https://badge.fury.io/js/node-itunes-library.svg)](https://badge.fury.io/js/node-itunes-library)
## Description
Node.JS module to parse an iTunes library database file.
The module provides users with access to the track and playlist information inside the library, as well as other information such as the music folder location.

## Installation
You can install from npm by simply entering your project directory and running

`npm install --save node-itunes-library`

## Usage
```javascript
//require the module
var ItunesLibrary = require('node-itunes-library');
//create a new instance of the library class
var library = new ItunesLibrary;
//open an itunes library XML file (returns a promise)
library.open('/path/to/library/file.xml')
  .then(function() {
    console.log("Success! You can now run other methods!");
  })
  .catch(function(err) {
    console.error("Something went wrong! See details below.");
    console.error(err);
  });
//now we can use some other method
//print the library location
console.log(library.getMusicFolder());
//print information about playlist with ID 12345
getPlaylistByID(12345).then(console.log).catch(console.error);
```
## Documentation
### `ItunesLibrary`
Main class of the module. Returned when executing `require('node-itunes-library');`
#### Classes:
##### `Track`
Class to represent a single track in the iTunes library.

All instances of this class will always have the following properties. Some of these properties may be undefined, please check before using them. **Please note that I'm not sure about the exact meanings or units of these properties, they are simply carried over from the ones iTunes creates and stores in its XML database file.** Apple doesn't document any of this stuff, it's all closed-source.
- `track_id` - The ID of the track
- `size` - The size of the audio file, I assume in bytes
- `total_time` - Length in time of the track, I don't know the unit (could possibly be samples?)
- `date_modified` - Date object representing the last modification of the file
- `date_added` - Date object representing the date and time the track was added to library
- `bit_rate` - bitrate of the audio file
- `sample_rate` - sample rate of the audio file
- `persistent_id` - some other form of ID for the track, it's possible that `track_id` could change for the same track
- `track_type` - type of the track as a string. All I've seen is "File," it's possible this could change for some track in the library that is streamed or has some network location
- `file_folder_count` - Unknown purpose
- `library_folder_count` - Unknown purpose
- `name` - Title of the track
- `artist` - Artist of the track
- `album` - Album that the track belongs to
- `genre` - Genre of the track
- `kind` - string with the type of the audio file, all the ones I've seen have been of the form "AAC Audio File"
- `location` - File (`file://`) URI with the absolute location of the audio file on disk.

##### `Playlist`
Class to represent a playlist in the iTunes library.

All instances of this class will always have the following properties. Some of these properties may be undefined, please check before using them. **As with the `Track` class, the function or meaning of some of these in context may be unknown.**
- `master` - Will be true if the playlist is the "master" playlist. Only the "Library" playlist seems to have this set to `true`; it seems that iTunes stores a playlist with every song in the library in it and marks that playlist as the "master" playlist.
- `playlist_id` - The ID of the playlist
- `playlist_persistent_id` - some other form of ID for the playlist, it's possible that `playlist_id` could change for the same playlist
- `all_items` - Unknown purpose. Seems to be `true` for every playlist I've come across.
- `visible` - Whether or not the playlist is visible to a user in the iTunes interface. Is usually `undefined`, except if explicitly defined `false`. Only seen in use with the "Library" master playlist.
- `name` - The name of the playlist.
- `playlist_items` - Array containing the items in the playlist. **Please note: this array only contains objects with a `track_id` property and no other data. If you want to get playlist items, it's recommended to use the `getPlaylistItems()` function instead - see below.**
- `distinguished_kind` - Unknown purpose. Seems to be some kind of number.
- `music` - Appears to be `true` if the playlist contains music and `undefined` otherwise.
- `smart_info` - Some data in a mystery format relating to iTunes' "smart playlists". If defined, will be a `Buffer` object (in an iTunes XML file, this data is represented in Base64.)
- `smart_criteria` - More data relating to smart playlists. Will also be a `Buffer` object if defined.
- `movies` - Appears to be `true` if the playlist contains movies and `undefined` otherwise.
- `tv_shows` - Appears to be `true` if the playlist contains TV shows and `undefined` otherwise.
- `podcasts` - Appears to be `true` if the playlist contains podcasts and `undefined` otherwise.
- `itunesu` - Unknown purpose.
- `audiobooks` - Appears to be `true` if the playlist contains audiobooks and `undefined` otherwise.
- `books` - Appears to be `true` if the playlist contains books and `undefined` otherwise.
###### Functions
###### `getPlaylistItems(full_data)`
Will return a Promise. When fulfilled, will pass an array of `Playlist` classes if `full_data` is `true` or not passed. If `full_data` is explicitly defined as `false`, the Promise will simply be passed only playlist IDs, same as the contents of `playlist_items`.

#### Functions:
##### `open(filePath)`
Opens an itunes library XML file. Returns a promise, which fulfills when parsing is complete and passes no arguments, and rejects if any error is encountered during the parsing process. This error will be passed to a function in `catch()`.

**NOTE: You *MUST* call this function before any other! All other functions will throw errors if an XML file is not opened and parsed first.**

##### `getTracks()`
Function to get all the tracks in the iTunes library. Returns a promise, and passes an array of Track objects when the promise fulfills.

The returned promise will reject if any error is thrown or if `open()` has not been called first.

##### `getTrackByID(id)`
Gets a track in the library by its ID. Returns a promise, passing a `Track` object when the promise fulfills.

The returned promise will reject if no track was found for the ID, the ID passed is `null` or `undefined`, any error occurs during execution, or if `open()` has not been called first.

##### `getTrackByIDSync(id)`
Same thing as `getTrackByID()` but operates synchronously. The function will block until a track is found, and the track is returned instead of a promise.

Rather than rejecting a promise, this function will throw an error for any of the rejection conditions described in `getTrackByID()`'s documentation.

This is mostly for internal use and it is not recommended to use this function instead of an asynchronous one.

##### `getPlaylists()`
Function to get all the playlists in the iTunes library. Returns a promise, and passes an array of Playlist objects when the promise fulfills.

The returned promise will reject if any error is thrown or if `open()` has not been called first.

##### `getPlaylistByID(id)`
Gets a playlist in the library by its ID. Returns a promise, passing a `Playlist` object when the promise fulfills.

The returned promise will reject if no playlist was found for the ID, the ID passed is `null` or `undefined`, any error occurs during execution, or if `open()` has not been called first.

##### `getPlaylistByIDSync(id)`
Same thing as `getPlaylistByID()` but operates synchronously. The function will block until a playlist is found, and the playlist is returned instead of a promise.

Rather than rejecting a promise, this function will throw an error for any of the rejection conditions described in `getPlaylistByID()`'s documentation.

This is mostly for internal use and it is not recommended to use this function instead of an asynchronous one.