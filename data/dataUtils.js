const getCategoryId = ({ category }, categories) => categories.find(cat => category === cat.name).id;

module.exports = {
  getCategoryId
};

