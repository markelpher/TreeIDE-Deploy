const fs = require('fs');

function getLineIndent(line) {
    if (line.startsWith('...')) {
        let indent = 0;
        while (line.startsWith('...')) {
            indent++;
            line = line.slice(3);
        }
        return { indent, value: line };
    }

    const leadingWhitespace = line.match(/^[\t ]*/)[0];
    const tabs = (leadingWhitespace.match(/\t/g) || []).length;
    const spaces = (leadingWhitespace.match(/ /g) || []).length;

    return {
        indent: tabs + Math.floor(spaces / 4),
        value: line.slice(leadingWhitespace.length)
    };
}

function parseTreeContent(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    const root = {};
    const stack = [{ indent: -1, node: root }];

    for (let line of lines) {
        const parsedLine = getLineIndent(line);
        const indent = parsedLine.indent;
        line = parsedLine.value.trim();
        const node = {};

        while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
        const parent = stack[stack.length - 1].node;
        parent[line] = node;
        stack.push({ indent, node });
    }

    return root;
}

function parseTreeFile(filePath) {
    return parseTreeContent(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { parseTreeFile, parseTreeContent };
