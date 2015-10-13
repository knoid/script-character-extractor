'use strict';

const
Parser = require('./parser'),
startsWithCharRegex = /^([A-Z\s1-9]+):\s*/;

module.exports = class TxtParser extends Parser {

  process(data) {
    let
    isOnChar = false,
    character = null;

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
        this.characters.add(character);
        this.lines[character] = (this.lines[character] || 0) + 1;
        this.dialogs[character] = (this.dialogs[character] || '') + ' ' + line;
      }
    });

    this.removeComments('(', ')');
  }

};
