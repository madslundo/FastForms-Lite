const express = require('express');
const router = express.Router();
const { getCollection } = require('../mongoDriver');

// Fetch order types with explicit projection and error handling
router.get('/order-types', async (req, res) => {
  try {
    const ordersCollection = await getCollection('Orders', 'DatabaseName');
    const orderTypes = await ordersCollection.aggregate([
      { $group: { _id: "$orderType" } },
      { $project: { _id: 0, orderType: "$_id" } }
    ]).toArray();
    
    res.json({ orderTypes: orderTypes.map(item => item.orderType) }); // Ensure consistent casing (Important for saving)
  } catch (error) {
    console.error("Error fetching order types:", error.message);
    res.status(500).json({ error: 'Failed to fetch order types', details: error.message });
  }
});


// Fetch plants using aggregation instead of distinct
router.get('/plants', async (req, res) => {
  try {
    const plantsCollection = await getCollection('Plants', 'DatabaseName');
    const plants = await plantsCollection.aggregate([
      { $group: { _id: "$_id" } },
      { $project: { _id: 1 } }
    ]).toArray();
    
    res.json(plants.map(item => item._id));
  } catch (error) {
    console.error("Error fetching plants:", error.message);
    res.status(500).json({ error: 'Failed to fetch plant types', details: error.message });
  }
});


module.exports = router;
