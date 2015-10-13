'use strict';

const
cli = require('commander');

cli.
  usage('[options] <file>').
  description('Split a movie script into files for each character removing ' +
      'comments.').
  option('-n, --dry-run', 'don\'t write output files').
  option('-o, --output <path>',
      'specify output directory, default is input file without extension').
  parse(process.argv);

const
fs = require('./lib/fs-promise'),
path = require('path'),

throwFromPromise = (err) => {
  process.nextTick(() => {
    throw err;
  });
};

let file = cli.args[0],

// create output directory
extension = path.extname(file),
Parser = require('./lib/parser-' + extension.substr(1)),
parser = new Parser(),
dir = path.basename(file, extension);
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
        mkOutputDir = fs.mkdir(dir); // promises work weird
        return mkOutputDir;
      }
      throwFromPromise(err);
    });
}

fs.readFile(file, { encoding: 'utf8' }).then((data) => {
  parser.process(data);

  // write files
  if (!cli.dryRun) {
    for (let character of parser.characters) {
      mkOutputDir.then(() => {
        let text = parser.dialogs[character];
        fs.writeFile(path.join(dir, character + '.txt'), text);
      });
    }
  }

  // print character lines in order
  let arrLines = [];
  for (let character of parser.characters) {
    arrLines.push([parser.lines[character], character]);
  }
  arrLines.
    sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])).
    forEach((lines) => {
      console.log(lines[1] + ' has ' + lines[0] + ' lines.');
    });
});
