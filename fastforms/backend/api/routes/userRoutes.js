const express = require('express');
const { getCollection, ObjectId } = require('../mongoDriver');
const router = express.Router();

// Get User by user_id
router.get('/:userId', async (req, res) => {
  try {
    const userCollection = await getCollection('User');
    const user = await userCollection.findOne({ user_id: new ObjectId(req.params.userId) }); // Search by user_id
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
