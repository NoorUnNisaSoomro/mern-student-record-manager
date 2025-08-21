const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studentDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Student Schema
const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  semester: { type: String, required: true },  
  grade: { type: String, required: true },
});

const Student = mongoose.model('Student', studentSchema);

// Routes
app.get('/api/students', async (req, res) => {
  try {
    const { search, sortBy } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNo: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    let sortOption = {};
    if (sortBy) {
      sortOption[sortBy] = 1;
    }
    
    const students = await Student.find(query).sort(sortOption);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post('/api/students', async (req, res) => {
  try {
    const { rollNo, name, semester, grade } = req.body;  // Changed from 'class' to 'semester'
    
    const newStudent = new Student({
      rollNo,
      name,
      semester,  // Changed from 'class'
      grade
    });
    
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rollNo, name, semester, grade } = req.body;  // Changed from 'class' to 'semester'
    
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { rollNo, name, semester, grade },  // Changed from 'class'
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});