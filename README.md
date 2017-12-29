# node-itunes-library
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
- `track_id` - The id of the track
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
Same thing as `getTrackByID` but operates synchronously. The function will block until a track is found, and the track is returned instead of a promise.

Rather than rejecting a promise, this function will throw an error for any of the rejection conditions described in `getTrackByID`'s documentation.

This is mostly for internal use and it is not recommended to use this function instead of an asynchronous one.
