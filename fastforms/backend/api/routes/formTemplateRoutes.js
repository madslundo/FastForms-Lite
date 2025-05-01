const express = require('express'); 
const { getCollection, ObjectId } = require('../mongoDriver');
const router = express.Router();

// Fetch all forms
router.get('/', async (req, res) => {
  try {
    const formTemplateCollection = await getCollection('FormTemplate');
    const forms = await formTemplateCollection.find({ deleted: { $ne: true }}).toArray(); // Fetch all forms
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});


router.get('/:formId', async (req, res) => {
  try {
    const formTemplateCollection = await getCollection('FormTemplate');
    const form = await formTemplateCollection.findOne({ _id: new ObjectId(req.params.formId) });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create a new form
router.post('/', async (req, res) => {
  try {
    console.log('Request Body:', req.body); 
    const formTemplateCollection = await getCollection('FormTemplate');
    const newFormTemplate = req.body;

    if (!newFormTemplate.user_id || !newFormTemplate.name || !newFormTemplate.fields) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Formatted Fields:', newFormTemplate.fields);

    const result = await formTemplateCollection.insertOne(newFormTemplate);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    console.error('Error creating form:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to create form' });
  }
});



// Update an existing form template
router.put('/:formId', async (req, res) => {
  try {
    const formTemplateCollection = await getCollection('FormTemplate');
    const updatedFormTemplate = req.body;

    // Set the status to "active" if it’s being completed
    if (updatedFormTemplate.status) {
      updatedFormTemplate.status = updatedFormTemplate.status === 'complete' ? 'active' : updatedFormTemplate.status;
    }

    const result = await formTemplateCollection.updateOne(
      { _id: new ObjectId(req.params.formId) },
      { $set: updatedFormTemplate }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Form updated successfully' });
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update form' });
  }
});


// Delete a form template
router.delete('/:formId', async (req, res) => {
  try {
    const formTemplateCollection = await getCollection('FormTemplate');
    const result = await formTemplateCollection.deleteOne({ _id: new ObjectId(req.params.formId) });
    if (result.deletedCount > 0) {
      res.json({ message: 'Form deleted successfully' });
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Soft delete a form by setting the "deleted" flag
router.patch('/soft-delete/:id', async (req, res) => {
  const formId = req.params.id;
  try {
    const collection = await getCollection('FormTemplate'); 
    const result = await collection.updateOne(
      { _id: new ObjectId(formId) },
      { $set: { deleted: true } }
    );
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Form marked as deleted' });
    } else {
      res.status(404).json({ message: 'Form not found' });
    }
  } catch (error) {
    console.error('Error in soft delete:', error);
    res.status(500).json({ message: 'Error marking form as deleted' });
  }
});


router.post('/create', async (req, res) => {
  try {
    const collection = await getCollection('FormTemplate'); 
    const { _id, user_id, name, dates, fields, status, usage_count, version, deleted } = req.body;

    const formattedFields = fields.map(field => {
      // Ensure static text gets saved properly
      if (field.type === 'text') {
        return { ...field, value: field.value }; // Save the static text field value
      }

      if (field.type === 'checkbox') {
        return { ...field, value: field.value}
      }

      // Ensure dropdown options are saved properly
      if (field.type === 'dropdown') {
        return { 
          ...field, 
          options: field.options || [] // Save dropdown options in 'options'
        }; 
      }

      return field; 
    });
    
    // Assuming req.body contains user_id, name, dates, fields, status, and usage_count
    const newForm = {
      _id: new ObjectId(_id),
      user_id: new ObjectId(user_id), 
      name,
      dates,  
      fields: formattedFields,
      status: status || 'draft', // Default status to 'draft' if not provided
      usage_count: usage_count || 0, 
      version: version , 
      deleted: deleted || false
    };   

    const result = await collection.insertOne(newForm);
    res.status(201).json({ message: 'Form created successfully', _id: result.insertedId });
  } catch (error) {
    console.error('Error creating form:', error); 
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, name, dates, fields, status, usage_count, version } = req.body;

  try {
    const collection = await getCollection('FormTemplate');
    
    // Format the fields just like in the POST route
    const formattedFields = fields.map(field => {
      if (field.type === 'text') {
        return { ...field, value: field.value }; 
      }

      if (field.type === 'checkbox') {
        return { ...field, value: field.value }; 
      }

      if (field.type === 'dropdown') {
        return {
          ...field,
          options: field.options || [] 
        };
      }

      return field; 
    });

    // Update the form template in the database
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          user_id: new ObjectId(user_id), // Ensure user_id is converted to ObjectId
          name,
          dates,
          fields: formattedFields,
          status: status || 'draft', // Default to 'draft' if not provided
          usage_count: usage_count || 0, 
          version: version, 
        },
      }
    );

    // Check if the document was modified
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Form not found or no changes made' });
    }

    res.status(200).json({ message: 'Form updated successfully', formId: id });
  } catch (error) {
    console.error('Error updating form template:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

router.patch('/:formId', async (req, res) => {
  const { formId } = req.params;
  const { status } = req.body;

  try {
    const formTemplateCollection = await getCollection('FormTemplate');
    await formTemplateCollection.updateOne(
      { _id: new ObjectId(formId) },
      { $set: { status } }
    );
    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});


module.exports = router;
