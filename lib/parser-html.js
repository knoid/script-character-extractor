'use strict';

const
Parser = require('./parser'),
lineRegex = /^<dt>\s<b>(.+)<\/b>:\s.*<dd>\s(.+)$/;

module.exports = class HtmlParser extends Parser {

  process(data) {
    data = data.replace(/\r?\n/g, ' ');

    let character = null,
    dialog = null,
    text = null,
    lineMatches = null,
    dialogStarts = -1,
    dialogSequenceEnds = -1,
    lastDialog = -1,
    nextDialogStarts = 0;
    do {
      dialogStarts = data.indexOf('<dt>', lastDialog + 1);
      nextDialogStarts = data.indexOf('<dt>', dialogStarts + 1);
      dialogSequenceEnds = data.indexOf('</dl>', dialogStarts);
      if (~dialogSequenceEnds && dialogSequenceEnds < nextDialogStarts) {
        dialog = data.substring(dialogStarts, dialogSequenceEnds);
      } else {
        dialog = data.substring(dialogStarts, nextDialogStarts);
      }

      if (~nextDialogStarts) {
        lineMatches = dialog.match(lineRegex);
        character = lineMatches[1];
        text = lineMatches[2];
        this.characters.add(character);
        this.lines[character] = (this.lines[character] || 0) + 1;
        this.dialogs[character] = (this.dialogs[character] || '') + ' ' + text;
        lastDialog = dialogStarts;
      }
    } while (~nextDialogStarts);

    this.removeComments('<i>[', ']</i>');
    for (let character of this.characters) {
      this.dialogs[character] = this.dialogs[character].replace(/<[^>]+>/g, '');
    }
  }

};
