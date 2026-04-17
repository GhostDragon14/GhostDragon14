const axios = require('axios');

const client = axios.create({
  baseURL: 'https://trackapi.nutritionix.com/v2',
  headers: {
    'x-app-id': process.env.NUTRITIONIX_APP_ID,
    'x-app-key': process.env.NUTRITIONIX_API_KEY,
    'Content-Type': 'application/json',
  },
});

const searchFood = async (query) => {
  const { data } = await client.get('/search/instant', { params: { query, detailed: true } });
  const results = [];
  if (data.branded) {
    results.push(...data.branded.slice(0, 10).map(item => ({
      id: item.nix_item_id,
      name: item.food_name,
      brand: item.brand_name,
      calories: item.nf_calories,
      protein: item.nf_protein,
      carbs: item.nf_total_carbohydrate,
      fat: item.nf_total_fat,
      fiber: item.nf_dietary_fiber,
      sugar: item.nf_sugars,
      sodium: item.nf_sodium,
      serving: item.serving_qty,
      servingUnit: item.serving_unit,
      servingWeightG: item.serving_weight_grams,
      source: 'nutritionix',
      type: 'branded',
    })));
  }
  if (data.common) {
    results.push(...data.common.slice(0, 10).map(item => ({
      id: item.food_name,
      name: item.food_name,
      brand: null,
      serving: item.serving_qty,
      servingUnit: item.serving_unit,
      source: 'nutritionix',
      type: 'common',
    })));
  }
  return results;
};

const getNutritionByName = async (query) => {
  const { data } = await client.post('/natural/nutrients', { query });
  return data.foods.map(food => ({
    name: food.food_name,
    brand: food.brand_name,
    calories: food.nf_calories,
    protein: food.nf_protein,
    carbs: food.nf_total_carbohydrate,
    fat: food.nf_total_fat,
    fiber: food.nf_dietary_fiber,
    sugar: food.nf_sugars,
    sodium: food.nf_sodium,
    saturatedFat: food.nf_saturated_fat,
    cholesterol: food.nf_cholesterol,
    serving: food.serving_qty,
    servingUnit: food.serving_unit,
    servingWeightG: food.serving_weight_grams,
    source: 'nutritionix',
  }));
};

const getByBarcode = async (barcode) => {
  const { data } = await client.get('/search/item', { params: { upc: barcode } });
  if (!data.foods || data.foods.length === 0) return null;
  const food = data.foods[0];
  return {
    id: food.nix_item_id,
    name: food.food_name,
    brand: food.brand_name,
    calories: food.nf_calories,
    protein: food.nf_protein,
    carbs: food.nf_total_carbohydrate,
    fat: food.nf_total_fat,
    fiber: food.nf_dietary_fiber,
    sugar: food.nf_sugars,
    sodium: food.nf_sodium,
    saturatedFat: food.nf_saturated_fat,
    serving: food.serving_qty,
    servingUnit: food.serving_unit,
    servingWeightG: food.serving_weight_grams,
    barcode,
    source: 'nutritionix',
  };
};

module.exports = { searchFood, getNutritionByName, getByBarcode };
