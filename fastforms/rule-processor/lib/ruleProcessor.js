const { getCollection, ObjectId } = require('../../backend/api/mongoDriver');

const processRules = async () => {
    const rulesCollection = await getCollection('Rule');
    const ordersCollection = await getCollection('Orders', 'DatabaseName');
    const formInstancesCollection = await getCollection('FormInstance');

    const rules = await rulesCollection.find().toArray();
    const orders = await ordersCollection.find().toArray();

    for (const rule of rules) {
        console.log(`Processing Rule ID: ${rule._id}`);

        for (const order of orders) {
            const isMatch = evaluateRule(rule, order);

            if (isMatch) {
                console.log(`Rule matched Order ID: ${order._id}`);

                // Fetches form template for form_id 
                const formTemplateCollection = await getCollection('FormTemplate');

                const formTemplate = await formTemplateCollection.findOne({
                    _id: new ObjectId(rule.form_id),
                });

                if (formTemplate) {
                    // Check if a form instance already exists for this formId and orderId
                    const existingFormInstance = await formInstancesCollection.findOne({
                        formId: rule.form_id,
                        orderId: order._id,
                    });


                    if (existingFormInstance) {
                        // If a form instance already exists, then it is updated instead of creating a new form instance
                        await formInstancesCollection.updateOne(
                            { formId: rule.form_id, orderId: order._id },
                            {
                                $set: {
                                    fields: formTemplate.fields,
                                    dates: {
                                        created: formTemplate.dates.created,
                                        submitted: new Date().toISOString(),
                                        modified: formTemplate.dates.modified,
                                    },
                                    status: formTemplate.status,
                                    version: formTemplate.version,
                                    deleted: formTemplate.deleted !== undefined ? formTemplate.deleted : false, // Default to false if undefined
                                }
                            }
                        );
                        console.log(`Form instance updated for Order: ${order._id}`);
                    } else {
                        // If it doesn't exist, create a new form instance with the form template fields
                        await formInstancesCollection.insertOne({
                            formId: rule.form_id,
                            fields: formTemplate.fields,
                            dates: {
                                created: formTemplate.dates.created || new Date(),
                                submitted: new Date().toISOString(),
                                modified: formTemplate.dates.modified || new Date(),
                            },
                            status: formTemplate.status,
                            version: formTemplate.version,
                            deleted: formTemplate.deleted,
                            orderId: order._id,
                        });
                        console.log(`Form instance created for Order: ${order._id}`);
                    }
                } else {
                    console.warn(`No form template found for Rule ID: ${rule._id}`);
                }
            } else {
                console.log(`Rule did not match Order ID: ${order._id}`);
            }
        }
    }
};

const evaluateRule = (rule, order) => {
    const { conditions, logicalOperators } = rule;
    let result = evaluateCondition(conditions[0], order);

    for (let i = 1; i < conditions.length; i++) {
        const operator = logicalOperators[i - 1];
        const conditionResult = evaluateCondition(conditions[i], order);

        if (operator === 'and') {
            result = result && conditionResult;
        } else if (operator === 'or') {
            result = result || conditionResult;
        }
    }
    return result;
};

const getValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

const evaluateCondition = (condition, order) => {
    const { option, value, condition: conditionType } = condition;
    const orderValue = getValue(order, option); // Get value using a path resolver

    console.log(`Evaluating condition:`, condition);
    console.log(`Order value for ${option}:`, orderValue);

    if (orderValue === undefined) {
        console.warn(`Field "${option}" is undefined in the order.`);
        return false;
    }

    switch (conditionType) {
        case 'equal':
            return orderValue === value;
        case 'contains':
            return orderValue.includes(value); // Add more condition types here
        default:
            console.warn(`Unsupported condition type: ${conditionType}`);
            return false;
    }
};

module.exports = { processRules };
