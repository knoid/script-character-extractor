'use strict';

const
cli = require('commander');

cli.
  option('-n, --dry-run', 'don\'t write output files').
  option('-o, --output <path>',
      'specify output directory, default is input file without extension').
  parse(process.argv);

const
fs = require('./lib/fs-promise'),
path = require('path'),

startsWithCharRegex = /^([A-Z\s1-9]+):\s*/,
throwFromPromise = (err) => {
  process.nextTick(() => {
    throw err;
  });
};

// output variables
let dialogs = {},
lines = {},
characters = new Set(),

file = cli.args[0],

// create output directory
dir = path.basename(file, path.extname(file));
dir = cli.output || path.join(path.dirname(file), dir);

let mkOutputDir = fs.stat(dir);
if (!cli.dryRun) {
  mkOutputDir.
    then((stats) => {
      if (!stats.isDirectory()) {
        throwFromPromise(new Error('Output directory name already exists, ' +
            'please remove it or specify another directory.'));
      }
    }, (err) => {
      if (err.code === 'ENOENT') { // no such file or directory
        return fs.mkdir(dir);
      }
      throwFromPromise(err);
    });
}

fs.readFile(file, { encoding: 'utf8' }).then((data) => {
  let
  character = null,
  isOnChar = false;
  data.split(/\r?\n/).forEach((line) => {
    line = line.replace(/^\s+|\s+$/, '');

    if (line.length === 0) {
      isOnChar = false;
    }

    let characterMatches = line.match(startsWithCharRegex);
    if (characterMatches) {
      isOnChar = true;
      let toStrip = characterMatches[0];
      character = characterMatches[1];
      line = line.substr(toStrip.length);
    }

    if (isOnChar) {
      characters.add(character);
      lines[character] = (lines[character] || 0) + 1;
      dialogs[character] = (dialogs[character] || '') + ' ' + line;
    }
  });

  // remove comments and write files
  for (let character of characters) {
    let text = dialogs[character],
    commentStarts = -1,
    commentEnds = -1;
    while (~(commentStarts = text.lastIndexOf('(')) &&
           ~(commentEnds = text.indexOf(')', commentStarts))) {
      text = text.substr(0, commentStarts) + text.substr(commentEnds + 1);
    }

    if (!cli.dryRun) {
      mkOutputDir.then(() => {
        fs.writeFile(path.join(dir, character + '.txt'), text);
      });
    }
  }

  // print character lines in order
  let arrLines = [];
  for (let character of characters) {
    arrLines.push([lines[character], character]);
  }
  arrLines.
    sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])).
    forEach((lines) => {
      console.log(lines[1] + ' has ' + lines[0] + ' lines.');
    });
});
