const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); 


const Feedback = require('./models/feedback');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Middleware
app.set('view engine', 'ejs');
// Set the directory for views
app.set('views', path.join(__dirname, 'views'));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));



// 1. Root route: Display the feedback submission form
app.get('/', (req, res) => {
    res.render('form', { title: 'Submit Feedback' });
});

// 2. Handle feedback submission
app.post('/submit', async (req, res) => {
    try {
        const { name, message, rating } = req.body;

        // Basic server-side validation
        if (!name || !message || !rating) {
            return res.status(400).send('All fields are required.');
        }

        const newFeedback = new Feedback({
            name,
            message,
            rating: parseInt(rating, 10)
        });

        await newFeedback.save();
        res.redirect('/testimonials');

    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send('An error occurred while submitting your feedback.');
    }
});

// 3. Display all testimonials
app.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await Feedback.find({}).sort({ createdAt: -1 });
        res.render('testimonials', { title: 'All Testimonials', testimonials });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).send('An error occurred while fetching testimonials.');
    }
});

// 4. Display a single testimonial
app.get('/testimonial/:id', async (req, res) => {
    try {
        const testimonial = await Feedback.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).send('Testimonial not found.');
        }
        res.render('testimonial', { title: 'Testimonial', testimonial });
    } catch (error) {
        console.error('Error fetching testimonial:', error);
        res.status(500).send('An error occurred while fetching the testimonial.');
    }
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
