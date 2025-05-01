const { processRules } = require('./lib/ruleProcessor');

async function main() {
    console.log('Starting Rule Processing...');
    await processRules();
    console.log('Rule Processing Complete!');
}

main().catch(err => {
    console.error('Error during rule processing:', err);
});
