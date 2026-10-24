// Form ke suggestion chips. Ye khane aur jagah ke naam hain (translate nahi hote, jaise dukaan/dish ke naam)

export const CITY_SUGGESTIONS = [
  "Prayagraj",
  "Lucknow",
  "Varanasi",
  "Kanpur",
  "Delhi",
  "Mumbai",
  "Patna",
  "Jaipur",
  "Indore",
  "Bhopal",
  "Pune",
  "Bengaluru",
];

export const DISH_SUGGESTIONS = {
  BREAKFAST: ["Poha", "Upma", "Aloo Paratha", "Idli Sambhar", "Bread Omelette", "Chai", "Chole Bhature", "Puri Sabzi", "Dalia", "Sandwich"],
  LUNCH: ["Dal", "Chawal", "4 Roti", "Aloo Sabzi", "Rajma", "Kadhi", "Chhole", "Paneer Sabzi", "Salad", "Raita", "Papad", "Achar"],
  DINNER: ["Dal", "4 Roti", "Mix Veg", "Paneer", "Chawal", "Khichdi", "Egg Curry", "Chicken Curry", "Salad", "Sweet"],
} as const;

export const ALL_DISHES = [...new Set(Object.values(DISH_SUGGESTIONS).flat())];

export const THALI_SUGGESTIONS = ["Veg Thali", "Mini Thali", "Special Thali", "Roti Sabzi", "Dal Chawal", "Rajma Chawal", "Paneer Thali", "Non-veg Thali"];

export const DESCRIPTION_SUGGESTIONS = ["Ghar jaisa khana", "Kam tel, kam masala", "Roti + Dal + Sabzi + Chawal", "Student special", "Office ke liye"];

export const PRICE_SUGGESTIONS = ["40", "50", "60", "80", "100", "120"];

export const PLAN_NAME_SUGGESTIONS = ["Weekly Lunch", "Weekly Lunch + Dinner", "15 Din Thali", "Monthly Tiffin", "Student Plan", "Office Lunch Plan", "Nashta + Lunch + Dinner"];

export const PLAN_DESC_SUGGESTIONS = ["Roz alag menu", "Ghar jaisa khana, kam tel", "Students aur office ke liye", "Har Ravivar special"];

export const PLAN_DAYS = [7, 15, 26, 30];

export const PLAN_PRICE_SUGGESTIONS = ["700", "1200", "1500", "2500", "3000", "4500"];
