function replaceTomlProjectVersion(content, newVersion) {
    const sectionPositions = [
        content.indexOf("[tool.poetry]"),
        content.indexOf("[project]")
    ]

    // If neither section found or no version in either section
    if (sectionPositions.every(p => p === -1)) {
        throw new Error("Could not find [tool.poetry] or [project] section in pyproject.toml");
    }

    const sectionStart = sectionPositions.find(p => p !== -1)

    const versionLineStart = sectionStart + content.substring(sectionStart).indexOf("version = ");
    if (versionLineStart === -1) {
        throw new Error("Could not find version key in pyproject.toml");
    }

    const versionValueStart = versionLineStart + content.substring(versionLineStart).indexOf('"');
    const lineEndRelativePos = content.substring(versionLineStart).indexOf('\n');
    let versionLineEnd = versionLineStart + lineEndRelativePos;
    // handle the case where the `version = x.x` line is the last line without a final newline
    if (lineEndRelativePos === -1) {
        versionLineEnd = content.length;
    }
    const newContent = content.substring(0, versionValueStart) + '"' + newVersion + '"' + content.substring(versionLineEnd);
    return newContent;
}

module.exports = {
    replaceTomlProjectVersion
};
