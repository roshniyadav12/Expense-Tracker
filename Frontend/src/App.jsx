import { useEffect, useState } from "react"; 
import { FaTrash, FaEdit, FaWindowClose } from "react-icons/fa";
import { PieChart } from "@mui/x-charts/PieChart";
import { publicRequest } from "./requestMethods";

const categories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Salary",
  "Other",
];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showChart, setShowChart] = useState(false);

  const [formType, setFormType] = useState("expense");
  const [formLabel, setFormLabel] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState("Food");

  const [editId, setEditId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editType, setEditType] = useState("expense");

  const [error, setError] = useState("");

  // Fetch all transactions from backend using /expenses
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await publicRequest.get("/expenses");
        setTransactions(res.data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  const handleAddTransaction = async () => {
    setError("");

    if (!formLabel.trim()) return setError("Description is required.");
    if (!formDate) return setError("Date is required.");
    if (!formAmount || isNaN(formAmount) || Number(formAmount) <= 0)
      return setError("Please enter a valid amount greater than 0.");

    const newTransaction = {
      label: formLabel.trim(),
      date: formDate,
      category: formCategory,
      type: formType,
      amount: Number(formAmount),
    };

    try {
      const res = await publicRequest.post("/expenses", newTransaction);
      setTransactions((prev) => [res.data, ...prev]);
      clearForm();
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to save transaction:", error);
      setError("Failed to save transaction. Please try again.");
    }
  };

  const clearForm = () => {
    setFormLabel("");
    setFormAmount("");
    setFormDate("");
    setFormCategory("Food");
    setFormType("expense");
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      await publicRequest.delete(`/expenses/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const openEdit = (transaction) => {
    setEditId(transaction._id);
    setEditLabel(transaction.label);
    setEditAmount(transaction.amount);
    setEditDate(transaction.date);
    setEditCategory(transaction.category);
    setEditType(transaction.type);
    setIsEditing(true);
    setError("");
  };

  const handleEditSave = async () => {
    setError("");

    if (!editLabel.trim()) return setError("Description is required.");
    if (!editDate) return setError("Date is required.");
    if (!editAmount || isNaN(editAmount) || Number(editAmount) <= 0)
      return setError("Please enter a valid amount greater than 0.");

    const updated = {
      label: editLabel.trim(),
      amount: Number(editAmount),
      date: editDate,
      category: editCategory,
      type: editType,
    };

    try {
      const res = await publicRequest.put(`/expenses/${editId}`, updated);
      setTransactions((prev) =>
        prev.map((t) => (t._id === editId ? res.data : t))
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Update failed. Try again.");
    }
  };

  const filteredTransactions =
    filterCategory === "All"
      ? transactions
      : transactions.filter((t) => t.category === filterCategory);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const expenseByCategory = categories
    .map((cat) => ({
      category: cat,
      value: filteredTransactions
        .filter((t) => t.type === "expense" && t.category === cat)
        .reduce((acc, t) => acc + t.amount, 0),
    }))
    .filter((item) => item.value > 0);

  const pieChartData = {
    data: expenseByCategory.map((item) => ({
      name: item.category,
      value: item.value,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-700 text-center mb-8">
          Expense Tracker
        </h1>

        {/* Filter & Add buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsAdding(!isAdding);
                setIsEditing(false);
                clearForm();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
            >
              {isAdding ? "Close Form" : "Add Transaction"}
            </button>
            <button
              onClick={() => setShowChart(!showChart)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
            >
              {showChart ? "Hide Report" : "Show Expense Report"}
            </button>
          </div>

          <select
            className="border border-gray-300 rounded px-3 py-2 shadow w-full sm:w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Add Transaction Form */}
        {isAdding && (
          <div className="bg-white rounded shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Add New Transaction
              </h2>
              <button
                onClick={() => setIsAdding(false)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                <FaWindowClose />
              </button>
            </div>

            {error && (
              <div className="mb-4 text-red-600 font-semibold">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <button
              onClick={handleAddTransaction}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow"
            >
              Add Transaction
            </button>
          </div>
        )}

        {/* Edit Transaction Form */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded shadow p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Edit Transaction
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  <FaWindowClose />
                </button>
              </div>

              {error && (
                <div className="mb-4 text-red-600 font-semibold">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <button
                onClick={handleEditSave}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="bg-white rounded shadow p-6 mb-6 flex flex-col sm:flex-row justify-around text-center">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold text-green-600">Total Income</h3>
            <p className="text-xl font-bold text-gray-700">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold text-red-600">Total Expenses</h3>
            <p className="text-xl font-bold text-gray-700">${totalExpense.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-600">Net Balance</h3>
            <p className="text-xl font-bold text-gray-700">${netBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Pie Chart */}
        {showChart && expenseByCategory.length > 0 && (
          <div className="bg-white rounded shadow p-6 mb-6 max-w-md mx-auto">
            <PieChart
              series={[{ data: pieChartData.data, innerRadius: 40, outerRadius: 100 }]}
              width={320}
              height={320}
            />
            <p className="mt-4 font-semibold text-gray-700 text-center">
              Expense Distribution by Category
            </p>
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 && (
            <p className="text-center text-gray-500">No transactions to show.</p>
          )}
          {filteredTransactions.map((t) => (
            <div
              key={t._id}
              className={`bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between items-center
                ${t.type === "income" ? "border-l-8 border-green-500" : "border-l-8 border-red-500"}`}
            >
              <div className="text-center sm:text-left mb-2 sm:mb-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-800">{t.label}</h2>
                <p className="text-sm text-gray-600">{t.date.split("T")[0]}</p>

                <p className="text-sm font-medium mt-1">
                  Category: <span className="capitalize">{t.category}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                 {t.type === "income" ? "+" : "-"}${(t.amount ?? 0).toFixed(2)}

                </span>
                <FaEdit
                  className="text-blue-500 cursor-pointer"
                  onClick={() => openEdit(t)}
                  title="Edit"
                />
                <FaTrash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDelete(t._id)}
                  title="Delete"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
