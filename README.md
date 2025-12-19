# semantic-release-pyproject-plugin

![npm-version](https://img.shields.io/npm/v/@covage/semantic-release-pyproject-plugin.svg) ![License](https://img.shields.io/badge/License-MIT-blue)

A [**semantic-release**](https://github.com/semantic-release/semantic-release) plugin for bumping version of Python projects inside their `pyproject.toml` file.

| Step               | Description                                                                            |
|--------------------|----------------------------------------------------------------------------------------|
| `verifyConditions` | Locate and validate a `pyproject.toml` file with a version field.                      |
| `prepare`          | Update the `pyproject.toml` with the new version without affecting the file structure. | 

## How this work

This plugin will look for the existing version string in two possible locations, and then will substitute the version.

- `version` key in the `project` section, specified in the [PEP 621](https://peps.python.org/pep-0621/#version). Used by [UV](https://docs.astral.sh/uv/).
- `version` key in the `tool.poetry` section used by [Poetry](https://python-poetry.org/).

## How to install this plugin

Make sure to install the NPM package `@covage/semantic-release-pyproject-plugin`.

In your `.releaserc.yml`, add the plugin in the proper order.
Make sure to commit the change made by this plugin on the `pyproject.toml` file.

For example:

```yaml
plugins: [
  "@semantic-release/commit-analyzer",
  '@semantic-release/release-notes-generator',
  "@semantic-release/changelog",
  "@covage/semantic-release-poetry-plugin",
  [
    '@semantic-release/git',
    {
      'assets': ["*.md", "pyproject.toml"],
      'message': "chore(semantic-release): release ${nextRelease.version}"
    }
  ]
]
branches:
  - "main"
```

## Motivation

The idea behind this plugin is to prevent the use of custom version bumping script when using semantic-release.

## Roadmap

- [x] basic support for Poetry convention
- [x] basic support for PEP 621 convention
- [x] rename from `semantic-release-poetry-plugin` to `semantic-release-pyproject-plugin`
