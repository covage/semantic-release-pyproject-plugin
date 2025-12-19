const fs = require('fs').promises;
const SemanticReleaseError = require('@semantic-release/error');
const { replaceTomlProjectVersion } = require('./pyproject_version_replace');
const { parse: parseToml } = require('smol-toml');

const DEFAULT_PYPROJECT_FILE_NAME = 'pyproject.toml';

async function verifyConditions(_pluginConfig, context) {
    const { logger } = context;
    const pyprojectPath = DEFAULT_PYPROJECT_FILE_NAME;
    try {
        const content = await fs.readFile(pyprojectPath, 'utf8');
        const parsed = parseToml(content);
        if (
            (!parsed.project || !parsed.project.version) &&
            (!parsed.tool || !parsed.tool.poetry || !parsed.tool.poetry.version)
        ) {
            throw new Error(
                `Did not find expected "project.version" or "tool.poetry.version" field in the pyproject.toml.`
            );
        }
        logger.log(`${pyprojectPath} is ok.`);
    } catch (error) {
        throw new SemanticReleaseError(
            `Error while checking ${pyprojectPath} file: ` + error.message
        );
    }

}

async function prepare(pluginConfig, context) {
    const { nextRelease, logger } = context;

    const pyprojectPath = DEFAULT_PYPROJECT_FILE_NAME;

    const bumpVersion = (content, nextRelease) => {
        // verify to ensure TOML validity before changes
        try {
            parseToml(content);
        } catch (error) {
            throw new Error("Invalid input TOML: " + error)
        }

        const nextVersionRepr = nextRelease.version;
        const updatedContent = replaceTomlProjectVersion(content, nextVersionRepr);

        // verify to ensure TOML validity after changes (safe-guard)
        try {
            parseToml(updatedContent);
        } catch (error) {
            throw new Error("Invalid output TOML: " + error)
        }

        return updatedContent;
    }
    
    try {
        const content = await fs.readFile(pyprojectPath, 'utf8');
        
        const updatedContent = bumpVersion(content, nextRelease);

        await fs.writeFile(pyprojectPath, updatedContent);

        logger.log(`Updated ${pyprojectPath} version to "${nextRelease.version}".`);
    } catch (error) {
        throw new SemanticReleaseError(
            `Error while replacing version in ${pyprojectPath}: ` + error.message
        );
    }
}

module.exports = {
    verifyConditions,
    prepare
};
