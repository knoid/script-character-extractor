'use strict';

const fs = require('fs'),
push = Array.prototype.push,

fsApply = (funcName) => {
  return function() {
    return new Promise((resolve, reject) => {
      push.call(arguments, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
      fs[funcName].apply(fs, arguments);
    });
  };
};

for (let method in fs) {
  module.exports[method] = fsApply(method);
}
