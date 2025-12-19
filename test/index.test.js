const plugin = require('../src/index');
const fs = require('fs').promises;
const toml = require('smol-toml');

jest.mock('../src/poetry_version_replace', () => {
    const poetryVersionReplace = jest.requireActual('../src/poetry_version_replace')
    return {
        __esModule: true,
        replaceTomlToolPoetryVersion: (existingContent, nextRelease) => {
            let outputContent = poetryVersionReplace.replaceTomlToolPoetryVersion(existingContent, nextRelease) 
            if (existingContent.indexOf("will-be-a-broken-document-when-this-plugin-will-manipulate") !== -1) {
                outputContent = outputContent.replaceAll("=", ";")
                outputContent = outputContent.replaceAll("[", "{")
            }
            return outputContent
        }
    };
});

describe('semantic release integration', () => {
    test('verifyConditions run ok with tool.poetry.version', async () => {
        // Mock context
        const context = {
            nextRelease: { version: '1.0.0' },
            logger: { log: jest.fn() }
        };
        // Mock fs
        const mockPyproject = {
            tool: {
                poetry: {
                    version: '0.1.0'
                }
            }
        };
        fs.readFile = jest.fn().mockResolvedValue(toml.stringify(mockPyproject));
        await plugin.verifyConditions({}, context);
        expect(fs.readFile).toHaveBeenCalled();
    });

    test('verifyConditions run ok with project.version', async () => {
        // Mock context
        const context = {
            nextRelease: { version: '1.0.0' },
            logger: { log: jest.fn() }
        };
        // Mock fs
        const mockPyproject = {
            project: {
                version: '0.1.0'
            }
        };
        fs.readFile = jest.fn().mockResolvedValue(toml.stringify(mockPyproject));
        await plugin.verifyConditions({}, context);
        expect(fs.readFile).toHaveBeenCalled();
    });


    test('verifyConditions throw error if manifest is bad', async () => {
        // Mock context
        const context = {
            nextRelease: { version: '1.0.0' },
            logger: { log: jest.fn() }
        };
        // Mock fs
        const mockPyproject = {
            tool: {}
        };
        fs.readFile = jest.fn().mockResolvedValue(toml.stringify(mockPyproject));
        await expect(async () => {
            await plugin.verifyConditions({}, context);
        }).rejects.toThrow("Error while checking pyproject.toml file");
    });

    test('replace simple TOML', async () => {
        // Mock context
        const context = {
            nextRelease: { version: '1.0.0' },
            logger: { log: jest.fn() }
        };
        // Mock fs
        const mockPyproject = {
            tool: {
                poetry: {
                    version: '0.1.0'
                }
            }
        };
        fs.readFile = jest.fn().mockResolvedValue(toml.stringify(mockPyproject));
        fs.writeFile = jest.fn().mockResolvedValue();
        await plugin.prepare({}, context);
        expect(fs.writeFile).toHaveBeenCalled();
        const writtenContent = fs.writeFile.mock.calls[0][1];
        expect(writtenContent).toContain('version = "1.0.0"');
    });

    test('it will rejects invalid TOML as input', async () => {
        // Mock context
        const context = {
            nextRelease: { version: '1.0.0' },
            logger: { log: jest.fn() }
        };
        // Mock fs
        const mockPyproject = {
            tool: {
                poetry: {
                    version: '0.1.0'
                }
            }
        };
        fs.readFile = jest.fn().mockResolvedValue(toml.stringify(mockPyproject).replace("=", "}"));
        fs.writeFile = jest.fn().mockResolvedValue();
        await expect(async () => {
            await plugin.prepare({}, context);
        })
            .rejects
            .toThrow("Error while replacing version in pyproject.toml: Invalid input TOML:");
    });

    test('it will rejects invalid output TOML', async () => {
        // Mock context
        const context = {
            nextRelease: { version: '1.0.0' },
            logger: { log: jest.fn() }
        };
        // Mock fs
        const mockPyproject = {
            _comment: "will-be-a-broken-document-when-this-plugin-will-manipulate", 
            tool: {
                poetry: {
                    version: '0.1.0'
                }
            }
        };

        fs.readFile = jest.fn().mockResolvedValue(toml.stringify(mockPyproject));
        fs.writeFile = jest.fn().mockResolvedValue();

        await expect(async () => {
            await plugin.prepare({}, context);
        })
            .rejects
            .toThrow("Error while replacing version in pyproject.toml: Invalid output TOML")
    });
}); 
