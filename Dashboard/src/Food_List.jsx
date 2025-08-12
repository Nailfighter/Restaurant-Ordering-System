const Food_List = [
  {
    id: 1,
    image: "Image/Chicken Tikka.jpg",
    name: "Chicken Butter Masala",
    alias: "Chicken Box",
    price: 12,
    tags: ["Diary", "Nuts", "Gluten", "Egg"],
  },
  {
    id: 2,
    image: "Image/Paneer Tikka.jpg",
    name: "Panner Tikka Masala",
    alias: "Panner Box",
    price: 12,
    tags: ["Diary", "Nuts", "Gluten", "Egg"],
  },
  {
    id: 3,
    image: "Image/Chole.jpg",
    name: "Chickpea Masala",
    alias: "Chickpea Box",
    price: 12,
    tags: ["Vegan", "Gluten", "Egg"],
  },
  {
    id: 4,
    image: "Image/Tandoori.jpg",
    name: "Tandoori Chicken",
    alias: "Tandoori Chicken",
    price: 6,
    tags: ["Diary"],
  },
  {
    id: 5,
    image: "Image/Chicken Tikka.jpg",
    name: "Chicken Butter Masala Combo",
    alias: "Chicken Combo",
    price: 15,
    tags: ["Diary", "Nuts", "Gluten", "Egg"],
  },
  {
    id: 6,
    image: "Image/Paneer Tikka.jpg",
    name: "Panner Tikka Masala Combo",
    alias: "Panner Combo",
    price: 15,
    tags: ["Diary", "Nuts", "Gluten", "Egg"],
  },
  {
    id: 7,
    image: "Image/Chole.jpg",
    name: "Chickpea Masala Combo",
    alias: "Chickpea Combo",
    price: 15,
    tags: ["Vegan", "Gluten", "Egg"],
  },
  {
    id: 8,
    image: "Image/Tandoori.jpg",
    name: "Tandoori Chicken Combo",
    alias: "Tandoori Combo",
    price: 9,
    tags: ["Diary"],
  },
  {
    id: 9,
    image: "Image/Samosa.jpg",
    name: "Samosa",
    alias: "Samosa",
    price: 5,
    tags: ["Vegan", "Gluten"],
  },
  {
    id: 10,
    image: "Image/Lassi.jpg",
    name: "Mango Lassi",
    alias: "Mango Lassi",
    price: 5,
    comboPrice: 3,
    tags: ["Diary", "Cold"],
  },
  {
    id: 11,
    image: "Image/Water.jpg",
    name: "Water",
    alias: "Water",
    price: 2,
    tags: ["Cold"],
  },
  {
    id: 12,
    image: "Image/Soda.jpg",
    name: "Soda",
    alias: "Soda",
    price: 2,
    tags: ["Cold"],
  },
  {
    id: 13,
    image: "Image/Recycle.jpg",
    name: "Extra Rice/Naan",
    alias: "Extra Rice/Naan",
    price: 1,
    tags: ["Cold"],
  },
];

export const colors = [
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-rose-500",
];

const getRandomAmount = () => Math.floor(Math.random() * 2000) + 1000;
const getRandomQuantity = () => Math.floor(Math.random() * 100) + 1;

const generateDummyData = (foodList) => {
  let usedColors = [];
  let totalAmount = 0;
  let totalQuantity = 0;

  const dummyData = foodList.map((item, index) => {
    const amount = getRandomAmount();
    const quantity = getRandomQuantity();
    totalAmount += amount;
    totalQuantity += quantity;

    let color = colors[index % colors.length];

    usedColors.push(color);

    return {
      name: item.name,
      amount,
      quantity,
      color,
    };
  });

  return dummyData.map((item) => ({
    ...item,
    amountShare: ((item.amount / totalAmount) * 100).toFixed(2) + "%",
    quantityShare: ((item.quantity / totalQuantity) * 100).toFixed(2) + "%",
  }));
};

const dummyData = generateDummyData(Food_List);

export default dummyData;
