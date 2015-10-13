'use strict';

module.exports = class Parser {

  constructor() {
    this.characters = new Set();
    this.dialogs = {};
    this.lines = {};
  }

  process() {
    throw new Error('not implemented!');
  }

  removeComments(start, end) {
    for (let character of this.characters) {
      let text = this.dialogs[character],
      commentStarts = -1,
      commentEnds = -1;
      while (~(commentStarts = text.lastIndexOf(start)) &&
             ~(commentEnds = text.indexOf(end, commentStarts))) {
        text = text.substr(0, commentStarts) +
               text.substr(commentEnds + end.length);
      }
      this.dialogs[character] = text;
    }
  }

};
