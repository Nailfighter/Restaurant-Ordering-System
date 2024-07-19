const Joi = require("joi");

const orderSchema = Joi.object({
  status: Joi.string().valid("Preparing", "Completed", "Delayed").required(),
  totalPrice: Joi.number().positive().required(),
  note: Joi.string().optional(),
  cart: Joi.array()
    .items(
      Joi.object({
        itemID: Joi.number().integer().positive().required(),
        itemName: Joi.string().required(),
        quantity: Joi.number().integer().positive().required(),
        itemPrice: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
});

// const payload = {
//   status: "Preparing",
//   totalPrice: 901,
//   note: "This is another test order",
//   cart: [
//     {
//       itemID: 1,
//       itemName: "Chicken Curry with Rice + Naan",
//       quantity: 2,
//       itemPrice: 24,
//     },
//     {
//       itemID: 2,
//       itemName: "Tandoori Chicken",
//       quantity: 3,
//       itemPrice: -18,
//     },
//   ],
// };

function checkValidOrder(payload) {
  const { error } = orderSchema.validate(payload);
  return error;
}

module.exports = { checkValidOrder };
