const fs = require("fs");
const path = require("path");

const STATIC_DIR = './../';

function resolveDir(dir) {
    return path.join(__dirname, STATIC_DIR, dir)
}

function readFileJSON(path){
    return JSON.parse(fs.readFileSync(resolveDir(path)));
}

function readFileJSONExists(path) {
    let result = undefined;
    if(fs.existsSync(resolveDir(path))){
      result = fs.readFileSync(resolveDir(path)).toString();
      result = result === undefined || result === '' ? undefined : JSON.parse(result);
    }
    return result;
}

function writeFileJSON(path, data){
    fs.writeFileSync(resolveDir(path), JSON.stringify(data, null, 4));
}

function isDir(path){
    return fs.existsSync(path);
}

module.exports = {
    resolveDir: resolveDir,
    readFileJSON: readFileJSON,
    writeFileJSON: writeFileJSON,
    isDir: isDir,
    readFileJSONExists: readFileJSONExists
};