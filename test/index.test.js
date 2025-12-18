const plugin = require('../src/index');
const fs = require('fs').promises;
const toml = require('smol-toml');

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

}); 
