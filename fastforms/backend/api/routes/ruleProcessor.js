const express = require('express');
const { ObjectId } = require('mongoose')
const { processRules } = require('../../../rule-processor/lib/ruleProcessor');
const router = express.Router();

router.post('/process-rules', async (req, res) => {
    try {
        await processRules();
        res.send('Rules processed successfully!');
    } catch (error) {
        console.error('Error processing rules:', error.message);
        res.status(500).send('Error processing rules.');
    }
});

module.exports = router;
