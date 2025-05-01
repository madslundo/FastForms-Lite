const express = require('express');
const router = express.Router();
const { getCollection, ObjectId } = require('../mongoDriver');

// Middleware to check if ObjectId is valid
const isValidObjectId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.form_id)) {
    return res.status(400).json({ error: 'Invalid form ID format' });
  }
  next();
};

// POST route to create or update rules for a form
router.post("/create", async (req, res) => {
  const { form_id, rules } = req.body;

  if (!form_id || !rules || rules.length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const db = await getCollection("Rule");

    const ruleData = {
      form_id: new ObjectId(form_id),
      conditions: [],
      logicalOperators: [],
    };

    rules.forEach((rule, index) => {
      // Extract the condition for each rule
      const condition = {
        option: rule.rule.option?.value,
        condition: rule.rule.condition?.value,
        value: rule.rule.value?.value,
      };
      ruleData.conditions.push(condition);

      // Only add logical operators for rules after the first rule and before the last rule
      if (index > 0 && index < rules.length) {
        ruleData.logicalOperators.push(rule.logicalOperator?.value || "");
      }
    });


    // Check if rules for the form already exist
    const existingRules = await db.findOne({ form_id: new ObjectId(form_id) });

    if (existingRules) {
      // If rules exist, update them in Mongo
      await db.updateOne(
        { form_id: new ObjectId(form_id) },
        { $set: ruleData }
      );
      res.json({ message: "Rules updated successfully" });
    } else {
      // If no rules exist, insert new ones
      const result = await db.insertOne(ruleData);
      res.json({ message: "Rules saved successfully", _id: result.insertedId });
    }
  } catch (error) {
    console.error("Error saving/updating rules:", error);
    res.status(500).json({ error: "Failed to save/update rules" });
  }
});

// GET route to fetch rules by form_id
router.get("/:form_id", isValidObjectId, async (req, res) => {
  const { form_id } = req.params;

  try {
    const db = await getCollection("Rule");
    const rules = await db.findOne({ form_id: new ObjectId(form_id) });

    if (!rules) {
      return res.status(200).json([]);
    }

    res.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});


module.exports = router;
