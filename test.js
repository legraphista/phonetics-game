console.time('loading');
const helpers = require('./src/helpers');
console.timeEnd('loading');

const gridCount = 9;
const lettersPerCell = 2;

for (let i = 0; i < 40; i++) {
  console.log(i);
  console.time('generating ' + i);
  console.dir(helpers.getGridAndWords({
    levelCounter: i,
    gridCount,
    lettersPerCell
  }));
  console.timeEnd('generating ' + i);
  console.log('~'.repeat(80));
}
//
// for (let i = 0; i < 20; i++) {
//   console.log('level:', i);
//   const biasPercentage = helpers.levelCounterToBias(i);
//   console.log('bias%:', biasPercentage);
//   console.log('random:');
//
//   console.group();
//   const arr = new Array(10);
//   for (let i = 0; i < 10; i++) {
//     console.log(arr[ i ] = helpers.getRandomNumberBetween({
//       min: 0,
//       max: 100,
//       biasPercentage,
//       influence: 1
//     }))
//   }
//   console.groupEnd();
//   console.log('avg:', arr.reduce((a, c) => a + c, 0) / 10);
//
//   console.log('~'.repeat(80))
// }