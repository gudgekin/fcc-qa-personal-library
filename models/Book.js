// models/Book.js

const mongoose = require('mongoose');

// define the Schema 
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    comments: {
        type: [String], // defines as an array of strings
        default: []     // default value 
    }
});

// virtual property 'commentcount'
bookSchema.virtual('commentcount').get(function() {
    return this.comments.length;
});

// create and export the Model
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;