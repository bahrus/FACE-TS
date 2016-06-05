"use strict";
var esprima = require('esprima');
var cheerio = require('cheerio');
const filePath = './Tests/FlagIcon';
//import flagIcon = require(filePath);
var flagIcon = require('./Tests/FlagIcon');
//var flagIcon = require(filePath);
const templateFnString = flagIcon.FlagIconTemplate.toString();
const templateHTML = `
    <template>
    ${templateFnString}
    </template>
`;
const $ = cheerio.load(templateHTML);
parseNode($.root());
console.log($.html());
//const parsed = esprima.parse(templateFnString);
//console.log(esprima.parse);
function parseNode($node) {
    for (let i = 0, ii = $node.length; i < ii; i++) {
        const node = $node[i];
        parseNodeElement(node);
    }
}
function parseNodeElement(nodeElement) {
    const attribs = nodeElement.attribs;
    if (attribs) {
        for (let key in attribs) {
            let val = attribs[key];
            if (val.startsWith('${') && val.endsWith('}')) {
                val = val.substr(2, val.length - 3);
                const posOfDot = val.indexOf('.');
                if (posOfDot > -1) {
                    val = val.substr(posOfDot + 1);
                }
                let newKey;
                if (key.startsWith('on')) {
                    newKey = 'on-' + key.substr(2);
                }
                else {
                    newKey = key + '$';
                }
                attribs[newKey] = val;
                delete attribs[key];
            }
        }
    }
    const children = nodeElement.children;
    if (!children)
        return;
    for (let i = 0, ii = children.length; i < ii; i++) {
        const child = children[i];
        console.log(child.type);
        parseNodeElement(child);
    }
}
//# sourceMappingURL=facets2polymer.js.map