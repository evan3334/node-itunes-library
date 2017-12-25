var fs = require('fs');
var Promise = require('promise');
var plist = require('plist');

function ituneslib(filename){

  //function to make sure we're given a valid file
  function validateFilename(fname) {
    //will fail if filename is null or not a string, file doesn't exist, or file is a directory
    return (fname!==null && typeof fname==='string' && fs.existsSync(fname) && !fs.lstatSync(fname).isDirectory());
  }

  //function to reformat all the keys from the plist file to not be strings with spaces and stuff in them
  function reformat_keys(data) {
    Object.keys(data);
  }
  
  this.open = function open() {
    return new Promise(function(fulfill,reject) {
      fs.readFile(this.filename, function(err, dat) {
        if(err) {
          //if there's an error reading the file, reject the promise
          reject(err);
        }
        else {
          try {
            var xmlData = dat.toString();
            xmlData = xmlData.replace(/[\n\t\r]/g, '');
            data = plist.parse(xmlData);
          }
          catch(err) {
            //if any errors thrown, reject the promise
            reject(err);
          }
        }
      });
    });
  };
    
  var data;
 
  if(!validateFilename()) {
    throw 'Invalid file path!';
  }
  else
  {
    this.filename = filename;
  }
  

  
  
  
}


