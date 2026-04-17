const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return { value: Math.round(bmi * 10) / 10, category: getBMICategory(bmi) };
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const calculateBMR = (weightKg, heightCm, age, gender) => {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
};

const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

const calculateMacroPercentages = (protein, carbs, fat) => {
  const totalCals = protein * 4 + carbs * 4 + fat * 9;
  if (totalCals === 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round((protein * 4 / totalCals) * 100),
    carbs: Math.round((carbs * 4 / totalCals) * 100),
    fat: Math.round((fat * 9 / totalCals) * 100),
  };
};

const caloriesBurnedFromSteps = (steps, weightKg = 70) => {
  return Math.round(steps * 0.04 * (weightKg / 70));
};

module.exports = { calculateBMI, calculateBMR, calculateTDEE, calculateMacroPercentages, caloriesBurnedFromSteps };
