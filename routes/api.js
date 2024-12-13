'use strict';

const Issue = require('../models/Issue')

module.exports = function (app) {

  app.route('/api/issues/:project')
  


    .get(async (req, res) => {
      const project = req.params.project;
      const filters = req.query;
  
      try {
        const issues = await Issue.find({project, ...filters });
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'Error fetching issues' });
      }
    })
  
  
    
    .post(async (req, res) => {
      const project = req.params.project;
      const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
      if(!issue_title || !issue_text) return res.json({"error": "required field(s) missing"});
    
      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
        project
      });

      try {
        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch(err) {
        res.json({error: "Error saving the issue"});
      }
    })
    
    .put(async (req, res) => {
      const { _id, ...fieldsToUpdate } = req.body;
    
      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
    
      // Check if there are any fields to update
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
    
      // Add updated_on timestamp
      fieldsToUpdate.updated_on = new Date();
    
      try {
        // Update issue
        const updatedIssue = await Issue.findByIdAndUpdate(
          _id,
          fieldsToUpdate,
          { new: true } // Return the updated document
        );
    
        if (!updatedIssue) {
          return res.json({ error: 'could not update', _id });
        }
    
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    
    
    .delete(async (req, res) => {
      const {_id} = req.body;

      if (!_id) return res.json({error:"missing _id"});

      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);
        if(!deletedIssue) return res.json({error:"could not delete", _id});
        res.json({result:"successfully deleted", _id});
      } catch(err){
        res.json({error:"could not delete", _id})
      }
      
    });
    
};
