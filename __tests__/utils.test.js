const { getCategoryId } = require('../data/dataUtils.js');

describe('data utils', () => {

  test('getCategoryId should take in a candy and all categories and return the appropriate id', async() => {
    const expectation = 7;
    const candy = {
      name: 'butterfinger',
      category: 'classic'
    };
    const categories = [
      {
        id: 5,
        name: 'modern'
      },
      {
        id: 7,
        name: 'classic',
      },
      {
        id: 3,
        name: 'some other category'
      }
    ];

    const actual = getCategoryId(candy, categories); 

    expect(actual).toEqual(expectation);
  });


});
