const helpers = module.exports = {};

const bagOfWords = require('./words');
const wordsCount = bagOfWords.length;

const consonants = [ 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Z', 'W', 'Y' ];

// sigmoid of level/10 normalized between 0 and 1
helpers.levelCounterToBias = (level) => (1 / (1 + Math.exp(-level / 10))) * 2 - 1;

helpers.getRandomNumberBetween = ({
                                    min = 0,
                                    max = 100,
                                    biasPercentage = 0,
                                    influence = 0
                                  }) => {

  const bias = Math.round((biasPercentage * (max - min)) + min);
  const randomValue = Math.random() * (max - min) + min;
  const mix = Math.random() * influence;

  const finalValue = randomValue * (1 - mix) + bias * mix;

  return Math.max(min, Math.min(max, finalValue));
};

helpers.getRandomConsonants = ({ lettersPerCell }) => {

  const arr = new Array(lettersPerCell);
  for (let i = 0; i < lettersPerCell; i++) {
    arr[ i ] = consonants[ Math.round(
      helpers.getRandomNumberBetween({ max: consonants.length })
    ) ];
  }
  return arr.join('');
};

helpers.getRandomWord = ({ lettersPerCell, level = 0 }) => {

  // level bias should indicate the bias of where to get the word
  // 0 beginning, 1 end
  // beginning -> less chars
  // end -> more chars

  const biasPercentage = helpers.levelCounterToBias(level);

  const randomSample = 10;

  let word;
  let index;
  do {
    const randoms = new Array(randomSample);
    for (let i = 0; i < randomSample; i++) {
      randoms[ i ] = helpers.getRandomNumberBetween({
        max: wordsCount,
        biasPercentage,
        influence: 1
      });
    }

    index = Math.round(randoms.reduce((a, c) => a + c, 0) / randomSample);

    word = bagOfWords[ index ];
  } while (word.length % lettersPerCell !== 0);

  return { word, index };
};

helpers.splitWords = ({ words, lettersPerCell }) => {

  const set = new Set();
  words.forEach(word => {
    const len = word.length;
    for (let i = 0; i < len; i += lettersPerCell) {
      set.add(word.slice(i, i + lettersPerCell));
    }
  });

  return set;
};

helpers.getSeedWord = ({ lettersPerCell, multiplier = 2 }) => {
  // clip this as we don't have words that big
  const len = Math.min(12, lettersPerCell * multiplier);

  const words = helpers.getSeedWord.cache.has(len) ?
    helpers.getSeedWord.cache.get(len) :
    helpers.getSeedWord.cache.set(len,
      bagOfWords
        .map((word, index) => ({ word, index }))
        .filter(x => x.word.length === len)
    ).get(len);

  const index = Math.round(helpers.getRandomNumberBetween({ max: words.length }));

  return words[ index ];
};
helpers.getSeedWord.cache = new Map();

helpers.getGridAndWords = ({
                             gridCount = 9,
                             lettersPerCell = 2,
                             levelCounter = 0
                           } = {}) => {

  // get a random word
  // try to fit in gridCount with lettersPerCell
  // if it does fit, push another word and try again
  // after everything fits, fill in the blanks with random 2 chars extracted from words

  const words = [];

  const indexes = [];

  let wordSet;
  let retries = 3;

  // do the seed
  const seed = helpers.getSeedWord({
    lettersPerCell,
    multiplier: Math.max(Math.round(levelCounter / 10), 2)
  });
  words.push(seed.word);
  indexes.push(seed.index);
  wordSet = helpers.splitWords({ words, lettersPerCell });

  let maxIterations = 1000;

  while (
    wordSet.size <= gridCount &&
    maxIterations-- >= 0
    ) {

    const {
      word: newWord,
      index: newIndex
    } = helpers.getRandomWord({ lettersPerCell, level: levelCounter });

    if (words.indexOf(newWord) !== -1) {
      continue;
    }

    indexes.push(newIndex);
    words.push(newWord);
    wordSet = helpers.splitWords({ words, lettersPerCell });

    // if we are full, just a bit retry
    if (retries && wordSet.size > gridCount) {
      retries--;
      indexes.pop();
      words.pop();
      wordSet = helpers.splitWords({ words, lettersPerCell });
    }
  }

  if (wordSet.size > gridCount) {
    indexes.pop();
    words.pop();
    wordSet = helpers.splitWords({ words, lettersPerCell });
  }

  // when exited it means that we are at least one over
  // so we pop & recompute wordSet;
  // indexes.pop();
  // words.pop();
  // wordSet = helpers.splitWords({ words, lettersPerCell });

  // populate leftovers
  // with 2 consecutive consonants
  // so that they don't have a possibility to form another word by chance
  const extraSpace = [];
  while (wordSet.size < gridCount) {
    const dummy = helpers.getRandomConsonants({ lettersPerCell });
    extraSpace.push(dummy);
    wordSet.add(dummy);
  }

  return { pieces: [ ...wordSet.keys() ], words, extraSpace, indexes };
};