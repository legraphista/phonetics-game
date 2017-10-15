const fs = require('fs');
const words = [
  fs
    .readFileSync('./dependencies/google-10k-words/google-10000-english-usa-no-swears-medium.txt')
    .toString()
    .split('\n'),
  fs
    .readFileSync('./dependencies/google-10k-words/google-10000-english-usa-no-swears-short.txt')
    .toString()
    .split('\n'),
  fs
    .readFileSync('./dependencies/google-10k-words/google-10000-english-usa-no-swears-long.txt')
    .toString()
    .split('\n')
].reduce((a, c) => a.concat(c), []);


// const words = require('an-array-of-english-words');

// we need words that are
// between 4 and 12 letters

// game will have a 2 letter/3 letter variance

const bagOfWords = words
  .filter(word => word.length >= 4 && word.length <= 12)
  .filter(word => word.length % 2 === 0 || word.length % 3 === 0)
  .sort((a, b) => {
    const lengthDiff = a.length - b.length;
    if (lengthDiff !== 0) {
      return lengthDiff;
    }

    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1
    }
    return 0
  });

console.log('extracted', bagOfWords.length, 'words');

require('fs').writeFileSync(__dirname + '/../src/words.js',
  `// AUTO-GENERATED FROM SCRIPTS 
module.exports = ${JSON.stringify(bagOfWords)};
`);