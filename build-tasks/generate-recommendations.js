/**
 * Generates the recommended_ruleset.js file.
 */

const { red } = require('chalk');
const { writeFile } = require('./common/files');
const { getAllRules, getMetadataFromFile, getMetadataValue } = require('./common/meta');
const groupedRows = {};
const warnings = [];

/**
 * @see https://github.com/Microsoft/tslint-microsoft-contrib/issues/694
 */
const ignoredRulesNotYetAdded = new Set(['ban-ts-ignore', 'comment-type', 'no-default-import', 'unnecessary-constructor']);

getAllRules().forEach(ruleFile => {
    const metadata = getMetadataFromFile(ruleFile);

    const ruleName = getMetadataValue(metadata, 'ruleName');
    if (ignoredRulesNotYetAdded.has(ruleName)) {
        return;
    }

    const groupName = getMetadataValue(metadata, 'group');
    if (groupName === 'Ignored') {
        return;
    }
    if (groupName === '') {
        warnings.push('Could not generate recommendation for rule file: ' + ruleFile);
    }
    if (groupedRows[groupName] === undefined) {
        groupedRows[groupName] = [];
    }

    let recommendation = getMetadataValue(metadata, 'recommendation', true, true);
    if (recommendation === '') {
        recommendation = 'true,';
    }
    // Replace double quotes with single quote
    recommendation = recommendation.replace(/"/g, "'");

    groupedRows[groupName].push(`        '${ruleName}': ${recommendation}`);
});

if (warnings.length > 0) {
    console.log('\n' + red(warnings.join('\n')));
    process.exit(1);
}
Object.keys(groupedRows).forEach(groupName => groupedRows[groupName].sort());

const recommendedTemplate = require('./templates/recommended_ruleset.template');
const data = recommendedTemplate(groupedRows);

writeFile('recommended_ruleset.js', data);
