const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },  // Changed from String to Date for better date handling
    category: { type: String, required: true },
    type: { type: String, required: true, enum: ['income', 'expense'] },  // Enum to restrict to these two values
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
