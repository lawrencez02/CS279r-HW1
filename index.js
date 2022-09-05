// Require Express, which is a Node.js web app framework for frontend
const express = require("express");
// Create Express app
const app = express();
// Require dotenv, so that we can add a dotfile to keep sensitive information like database connection strings
const dotenv = require("dotenv");
// Configure the .env file
dotenv.config();
// Use mongoose library to access MongoDB with node.js
const mongoose = require("mongoose");

// Import the to-do task database model schema
const TodoTask = require("./models/TodoTask");

// Tell app to use/serve static files stored in public folder, e.g., our CSS stylesheet
app.use("/static", express.static("public"))
// Tell app to use certain library so that we can POST nested objects for convenience
app.use(express.urlencoded({ extended: true }));

// Try to connect to MongoDB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
    // Log that app has connected to database
    console.log("Connected to database!");
    // Only run app after connection to MongoDB has been established
    app.listen(3000, () => console.log("Server up and running!"));
});

// Set view engine configuration for app
app.set("view engine", "ejs");

// Define GET request behavior in root directory so that a GET renders the to-do list, fetching all existing tasks from the database
app.get("/", (req, res) => {
    TodoTask.find({}, (err, tasks) => {
        res.render("todo.ejs", { todoTasks: tasks });
    });
});

// Define POST request behavior in root directory so that a POST adds to the to-do list 
app.post('/',async (req, res) => {
    // Create a new task with the request body, in the format of the MongoDB model we defined
    const todoTask = new TodoTask({content: req.body.content});
    
    // Try to save the new task to the database
    try {
        await todoTask.save();
        // If successfully saved, reload the to-do list with the new task
        res.redirect("/");
    } 
    catch (err) {
        // Reload the to-do list even if the task isn't succesfully saved
        res.redirect("/");
    }
});

// Code for handling edits of tasks in to-do list
app
    .route("/edit/:id")
    .get((req, res) => {
        // Get the ID of the task that the user clicked edit on
        const id = req.params.id;
        TodoTask.find({}, (err, tasks) => {
            // Render the special template where one task is in edit mode and other tasks are normally displayed
            res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        // Update MongoDB on the new title of the task that was edited
        TodoTask.findByIdAndUpdate(id, { content: req.body.content }, err => {
            // Error out the to-do list webapp if we can't update the database properly
            if (err) return res.send(500, err);
            res.redirect("/");
        });
    });


// Code for handling deletion of tasks in to-do list
app
    .route("/remove/:id")
    .get((req, res) => {
        const id = req.params.id;
        // Tell MongoDB to find the appropriate database entry and delete it
        TodoTask.findByIdAndRemove(id, err => {
            if (err) return res.send(500, err);
            // Redirect to to-do list, where the deleted entry won't show
            // because it doesn't exist in the database anymore
            res.redirect("/");
        });
    });