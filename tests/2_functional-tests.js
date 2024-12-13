const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server'); // Adjust this path to your server

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let issueId;

  // Create an issue with every field
  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue.',
        created_by: 'Tester',
        assigned_to: 'Joe',
        status_text: 'In Progress',
        project: 'apitest'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        issueId = res.body._id;  // Save the ID for later tests
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        done();
      });
  });

  // Create an issue with only required fields
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue 2',
        issue_text: 'This is another test issue.',
        created_by: 'Tester',
        project: 'apitest'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        done();
      });
  });

  // Create an issue with missing required fields
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue 3',
        created_by: 'Tester',
        project: 'apitest'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  // View issues on a project
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // View issues on a project with one filter
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest?open=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // View issues on a project with multiple filters
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest?open=true&assigned_to=Joe')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Update one field on an issue
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: issueId,
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Update multiple fields on an issue
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: issueId,
        issue_title: 'Updated Title 2',
        status_text: 'Closed'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId);
        done();
      });
  });

  // Update an issue with missing _id
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: 'Updated Title without ID'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  // Update an issue with no fields to update
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: issueId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: issueId });
        done();
      });
  });

  // Update an issue with an invalid _id
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'invalidid',
        issue_title: 'Invalid Update'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: 'invalidid' });
        done();
      });
  });

  // Delete an issue
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: issueId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully deleted', _id: issueId });
        done();
      });
  });

  // Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: 'invalidid'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', _id: 'invalidid' });
        done();
      });
  });

  // Delete an issue with missing _id
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });
});
