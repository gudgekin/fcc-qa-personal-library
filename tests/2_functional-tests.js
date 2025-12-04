const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let testBookID; 
  let invalidBookID = '5871dda29f8f2038743129e0';

//----[EXAMPLE TEST]----
 /*
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .keepOpen()
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  */
// ----[END of EXAMPLE TEST]----


  // The BIG ROUTING TESTS SUITE IN THE SKY
  suite('Routing tests', function() {

    // Suite POST api/books
    suite('POST /api/books with title => create book object/expect book object', function() {
      // TEST 1
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .send({
              title: 'Functional Test Book'
          })
          .end(function(err, res) {
              // Assertions | check response structure
              assert.equal(res.status, 200);
              assert.property(res.body, 'title', 'Response should contain title');
              assert.property(res.body, '_id', 'Response should contain _id');
              assert.equal(res.body.title, 'Functional Test Book');

              // save ID
              testBookID = res.body._id; 

              done(); // Finish the async test
        });
      }); // end TEST 1

      // TEST 2
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
            .keepOpen()
            .post('/api/books')
            .send({
                title: ''
            })
            .end(function(err, res) {
                // Assert status 200
                assert.equal(res.status, 200); 
                assert.equal(res.text, 'missing required field title');
                done();
            });
      }); // end TEST 2
      
    }); // end Suite POST api/books

    // Suite GET api/books
    suite('GET /api/books => array of books', function(){
      
      // TEST 3
      test('Test GET /api/books',  function(done){
        chai.request(server)
            .keepOpen()
            .get('/api/books')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'Response should be an array');
                
                // check array is not empty
                assert.isAbove(res.body.length, 0); 
                
                // check at least one item has required properties
                assert.property(res.body[0], 'commentcount', 'Items should contain commentcount');
                assert.property(res.body[0], 'title', 'Items should contain title');
                assert.property(res.body[0], '_id', 'Items should contain _id');
                done();
            });
      }); // end TEST 3   
      
    }); // end Suite GET api/books

    // Suite GET [id]
    suite('GET /api/books/[id] => book object with [id]', function(){
      
      // TEST 4
      test('Test GET /api/books/[id] with id not in db',  function(done) {

        chai.request(server)
        .keepOpen()
        .get('/api/books/' + invalidBookID) // fake ID
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists'); 
            done();
        });
  
      }); // end TEST 4
      
      // TEST 5
      test('Test GET /api/books/[id] with valid id in db',  function(done){

        chai.request(server)
        .keepOpen()
        .get('/api/books/' + testBookID) 
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Response should contain title');
            assert.property(res.body, '_id', 'Response should contain _id');
            assert.property(res.body, 'comments', 'Response should contain comments array');
            assert.property(res.body, 'commentcount', 'Response should contain commentcount');
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.equal(res.body._id, testBookID); 
            done();
            });

      }); // end TEST 5
      
    }); // end Suite GET [id]

    // Suite POST [id]
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      // TEST 6
      test('Test POST /api/books/[id] with comment', function(done) {

        chai.request(server)
        .keepOpen()
        .post('/api/books/' + testBookID) // Use the ID saved from Test 2
        .send({
            comment: 'This is a test comment.'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'comments');
            assert.isArray(res.body.comments);
            
            // Check that the comments array now has 1 item
            assert.equal(res.body.comments.length, 1); 
            
            // Check that the commentcount is correctly updated to 1
            assert.equal(res.body.commentcount, 1); 
            
            done();
        });

      }); // end TEST 6

      // TEST 7
      test('Test POST /api/books/[id] without comment field', function(done) {

        chai.request(server)
        .keepOpen()
        .post('/api/books/' + testBookID) 
        .send({
            comment: ''
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment');
            done();
        });
 
      }); // end TEST 7

      // TEST 8
      test('Test POST /api/books/[id] with comment, id not in db', function(done) {

        chai.request(server)
        .keepOpen()
        .post('/api/books/' + invalidBookID) // Use the fake ID
        .send({
            comment: 'Should not save'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
        });

      }); // end TEST 8
      
    }); // end Suite POST [id]

    // Suite DELETE [id]
    suite('DELETE /api/books/[id] => delete book object id', function() {

      // TEST 9
      test('Test DELETE /api/books/[id] with valid id in db', function(done){

        chai.request(server)
        .keepOpen()
        .delete('/api/books/' + testBookID) // Use the ID saved from Test 2
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
        });
  
      }); // end TEST 9

      // TEST 10
      test('Test DELETE /api/books/[id] with  id not in db', function(done){

        chai.request(server)
        .keepOpen()
        .delete('/api/books/' + invalidBookID) // Use the fake ID
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
        });

      }); // end TEST 10

    }); // end Suite DELETE [id]


    // TEST 11
    test('Test DELETE /api/books/ => delete all books', function(done) {
    chai.request(server)
        .keepOpen()
        .delete('/api/books')
        .end(function(err, res) {
            if (err) return done(err); 
            assert.equal(res.status, 200);
            assert.equal(res.text, 'complete delete successful');
            done();
        });
      }); // end TEST 11


  });

});
