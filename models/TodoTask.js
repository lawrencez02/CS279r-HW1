// Use mongoose library to interface with MongoDB in express.js
const mongoose = require('mongoose');

// Define new schema for how each to-do task is stored in MongoDB
const todoTaskSchema = new mongoose.Schema({
    content: {
        type: String,required: true
    },
    date: {
        type: Date,default: Date.now
    }
})

// Export this MongoDB model so that we can use it in index.js
module.exports = mongoose.model('TodoTask',todoTaskSchema);