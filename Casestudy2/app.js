const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, 'dist', 'Frontend');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(FRONTEND_DIR));

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
  },
  { versionKey: false }
);

const Employee = mongoose.model('Employee', employeeSchema);
const API = '/api/employeelist';

function validateEmployee(body) {
  const { name, location, position, salary } = body || {};
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof location !== 'string' || !location.trim() ||
    typeof position !== 'string' || !position.trim() ||
    salary === undefined || salary === null || salary === '' ||
    !Number.isFinite(Number(salary)) || Number(salary) < 0
  ) {
    return 'Please provide valid name, location, position, and non-negative salary.';
  }
  return null;
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get(API, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    console.error('GET employees failed:', error.message);
    res.status(500).json({ message: 'Could not retrieve employees.' });
  }
});

app.get(`${API}/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json(employee);
  } catch (error) {
    console.error('GET employee failed:', error.message);
    res.status(500).json({ message: 'Could not retrieve the employee.' });
  }
});

app.post(API, async (req, res) => {
  const validationError = validateEmployee(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const employee = await Employee.create({
      name: req.body.name.trim(),
      location: req.body.location.trim(),
      position: req.body.position.trim(),
      salary: Number(req.body.salary)
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error('POST employee failed:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid employee details.' });
    }
    res.status(500).json({ message: 'Could not add the employee.' });
  }
});

app.put(API, async (req, res) => {
  const id = req.body && (req.body._id || req.body.id);
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'A valid employee ID is required.' });
  }
  const validationError = validateEmployee(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        name: req.body.name.trim(),
        location: req.body.location.trim(),
        position: req.body.position.trim(),
        salary: Number(req.body.salary)
      },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json(employee);
  } catch (error) {
    console.error('PUT employee failed:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid employee details.' });
    }
    res.status(500).json({ message: 'Could not update the employee.' });
  }
});

app.delete(`${API}/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('DELETE employee failed:', error.message);
    res.status(500).json({ message: 'Could not delete the employee.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Add your MongoDB Atlas connection string to the .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB Atlas connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Check MONGO_URI, Atlas database credentials, IP access list, internet, and DNS/SRV lookup.');
    process.exit(1);
  }
}

startServer();
