'use strict';

const Book = require('../models/Book');

module.exports = function (app) {

  app.route('/api/books')

    // GET books
    .get(async function (req, res) {

      try {
        // wait for the find operation to finish
        const books = await Book.find({});

        // if database is empty, return empty array
        if (!books) {
            return res.json([]);
        }

        // return commentcount instead of comments array
        const formattedBooks = books.map(function(book) {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length 
            };
        });     

        return res.json(formattedBooks); 
       
      } catch (err) {
        console.error(err);
        return res.send('Database error finding books');
      }

    }) // end GET books
    
    // POST books
    .post(async function (req, res) {

      let title = req.body.title;

    // check if the title is missing
      if (!title) {
          return res.send('missing required field title');
      }

      // create new Book instance
      const newBook = new Book({
          title: title,
      });

      // save new book
      try {
        // Use 'await' to wait for the save operation to finish
        const savedBook = await newBook.save();       
        // success
        return res.json({ 
            title: savedBook.title, 
            _id: savedBook._id 
        });       
      } catch (err) {
        console.error(err);
        return res.send('Error saving book to database.');
      }

    }) // end POST books
    
    .delete(async function(req, res) {

      try {
            // delete ALL
            await Book.deleteMany({});
            return res.send('complete delete successful');
        } catch (err) {
            console.error(err);
            return res.send('error deleting books');
        }

    });


  app.route('/api/books/:id')

  // GET :id
    .get(async function (req, res) {

      let bookid = req.params.id;

        // check ID 
        if (!bookid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.send('no book exists');
        }

      try {
        // search collection by id
        const book = await Book.findById(bookid); 

        // check book was found
        if (!book) {
            return res.send('no book exists');
        }

        let bookObject = book.toObject();

        // add commentcount
        bookObject.commentcount = bookObject.comments.length; 

        // return full book object
        return res.json(bookObject);

    } catch (err) {
        console.error(err);
        return res.send('no book exists'); 
    }

    }) // end GET :id
    
    // POST :id
    .post(async function(req, res) {

      let bookid = req.params.id;
      let comment = req.body.comment;

      // check for comment
      if (!comment) {
          return res.send('missing required field comment');
      }

      // check ID 
      if (!bookid.match(/^[0-9a-fA-F]{24}$/)) {
          return res.send('no book exists');
      }

      try {
          // find book by ID and update
          const updatedBook = await Book.findByIdAndUpdate(
              bookid,
              // push to array
              { $push: { comments: comment } }, 
              { new: true } 
          );

          // check if a book was found and updated
          if (!updatedBook) {
              return res.send('no book exists');
          }

          // format the final response
          let bookObject = updatedBook.toObject();
          bookObject.commentcount = bookObject.comments.length; 

          // respond with ull updated book object
          return res.json(bookObject);

      } catch (err) {
          console.error(err);
          return res.send('no book exists');
      }

    }) // end POST :id
    

    // DELETE :id
    .delete(async function(req, res) {

      let bookid = req.params.id;

      // check ID format 
      if (!bookid.match(/^[0-9a-fA-F]{24}$/)) {
      // error message
      return res.send('no book exists'); 
      }

      try {
          // find book by ID and delete
          const result = await Book.findByIdAndDelete(bookid);

          // check if actually deleted
          if (!result) {
              return res.send('no book exists');
          }

          // respond with success message
          return res.send('delete successful');

      } catch (err) {
          console.error(err);
          return res.send('could not delete ' + bookid);
      }

    }); // end DELETE :id
  
};
