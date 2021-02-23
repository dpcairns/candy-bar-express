function getCategoryId(
  candy, 
  // if something's an array, chances are you want to loop through it. otherwise, it maybe shouldn't be an array
  categories
) {
  // loop through the categories to find the category that matches the the supplied candy's category
  // find the category whose 'name' is equal to the supplied candy's 'category' property 
  const category = categories.find(cat => candy.category === cat.name);

  const categoryId = category.id;
 
  return categoryId;
}

module.exports = {
  getCategoryId
};

