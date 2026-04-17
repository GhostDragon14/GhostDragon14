const axios = require('axios');

const BASE = 'https://api.nal.usda.gov/fdc/v1';
const KEY = () => process.env.USDA_API_KEY || 'DEMO_KEY';

const searchFood = async (query, pageSize = 20) => {
  const { data } = await axios.get(`${BASE}/foods/search`, {
    params: { query, pageSize, api_key: KEY(), dataType: 'Foundation,SR Legacy,Branded' },
  });
  return (data.foods || []).map(food => ({
    id: food.fdcId,
    name: food.description,
    brand: food.brandOwner || null,
    calories: getNutrient(food.foodNutrients, 1008),
    protein: getNutrient(food.foodNutrients, 1003),
    carbs: getNutrient(food.foodNutrients, 1005),
    fat: getNutrient(food.foodNutrients, 1004),
    fiber: getNutrient(food.foodNutrients, 1079),
    sugar: getNutrient(food.foodNutrients, 2000),
    sodium: getNutrient(food.foodNutrients, 1093),
    serving: 100,
    servingUnit: 'g',
    source: 'usda',
  }));
};

const getFoodDetails = async (fdcId) => {
  const { data } = await axios.get(`${BASE}/food/${fdcId}`, { params: { api_key: KEY() } });
  return {
    id: data.fdcId,
    name: data.description,
    brand: data.brandOwner || null,
    calories: getNutrientDetail(data.foodNutrients, 1008),
    protein: getNutrientDetail(data.foodNutrients, 1003),
    carbs: getNutrientDetail(data.foodNutrients, 1005),
    fat: getNutrientDetail(data.foodNutrients, 1004),
    fiber: getNutrientDetail(data.foodNutrients, 1079),
    sugar: getNutrientDetail(data.foodNutrients, 2000),
    sodium: getNutrientDetail(data.foodNutrients, 1093),
    saturatedFat: getNutrientDetail(data.foodNutrients, 1258),
    cholesterol: getNutrientDetail(data.foodNutrients, 1253),
    serving: 100,
    servingUnit: 'g',
    source: 'usda',
  };
};

const getNutrient = (nutrients, id) => {
  const n = (nutrients || []).find(n => n.nutrientId === id);
  return n ? Math.round(n.value * 10) / 10 : 0;
};

const getNutrientDetail = (nutrients, id) => {
  const n = (nutrients || []).find(n => n.nutrient && n.nutrient.id === id);
  return n ? Math.round(n.amount * 10) / 10 : 0;
};

module.exports = { searchFood, getFoodDetails };
