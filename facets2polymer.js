"use strict";
const esprima = require('esprima');
var cheerio = require('cheerio');
const path = require('path');
const filePath = './Tests/FlagIcon';
//var flagIcon = require(filePath);
processFACETSFile(filePath);
function processFACETSFile(filePath) {
    const facetsFile = require(filePath);
    const fileName = path.basename(filePath);
    console.log(fileName);
    const templateName = fileName + "Template";
    const templateFnString = facetsFile[templateName].toString();
    const templateHTML = `<template>
        ${templateFnString}
    </template>`;
    const $ = cheerio.load(templateHTML);
    parseNode($.root(), $);
    let tokensEvaluated = $.root().html();
    //debugger;
    tokensEvaluated = tokensEvaluated.substr('<template>'.length);
    tokensEvaluated = tokensEvaluated.substr(0, tokensEvaluated.length - '</template>'.length);
    const arrowFunction = /=&gt;/g;
    tokensEvaluated = tokensEvaluated.replace(arrowFunction, '=>');
    const joinAposApos = /&apos;&apos;/g;
    tokensEvaluated = tokensEvaluated.replace(joinAposApos, "''");
    tokensEvaluated = trimOutside(tokensEvaluated, '`');
    console.log(tokensEvaluated);
}
// const parsed = esprima.parse(tokensEvaluated);
function trimOutside(s, start, end) {
    if (!end)
        end = start;
    const iPosOfStart = s.indexOf(start);
    const iPosOfEnd = s.lastIndexOf(end);
    if (iPosOfEnd === -1)
        return s.substr(iPosOfStart + start.length);
    return s.substring(iPosOfStart + start.length, iPosOfEnd);
}
function parseNodeElement(nodeElement, templateTokenPair, parent, $) {
    if (!nodeElement)
        return;
    if (nodeElement.type === 'text') {
        populateTextNode(nodeElement, templateTokenPair, parent, $);
    }
    else {
        populateAttributes(nodeElement, templateTokenPair);
    }
    const children = nodeElement.children;
    if (!children)
        return;
    for (let i = 0, ii = children.length; i < ii; i++) {
        const child = children[i];
        parseNodeElement(child, templateTokenPair, nodeElement, $);
    }
}
function parseNode($node, $) {
    const templateTokenPair = {
        lhs: '${',
        rhs: '}'
    };
    for (let i = 0, ii = $node.length; i < ii; i++) {
        const node = $node[i];
        parseNodeElement(node, templateTokenPair, null, $);
    }
}
function splitPairs(text, pair) {
    const returnObj = [];
    let region = [];
    const lhsFirstChr = pair.lhs.substr(0, 1);
    const rhsFirstChr = pair.rhs.substr(0, 1);
    const lhsLength = pair.lhs.length;
    const rhsLength = pair.rhs.length;
    for (let i = 0, ii = text.length; i < ii; i++) {
        const chr = text[i];
        let foundLHSMatch;
        let foundRHSMatch;
        if (chr === lhsFirstChr) {
            if (text.substr(i, lhsLength) === pair.lhs) {
                foundLHSMatch = true;
            }
        }
        if (chr === rhsFirstChr) {
            if (text.substr(i, rhsLength) === pair.rhs) {
                foundRHSMatch = true;
            }
        }
        if (foundLHSMatch || foundRHSMatch) {
            if (region.length > 0) {
                returnObj.push(region.join(''));
                region = [];
            }
            returnObj.push(foundLHSMatch ? pair.lhs : pair.rhs);
            i += (foundLHSMatch ? lhsLength : rhsLength) - 1;
        }
        else {
            region.push(chr);
        }
    }
    if (region.length > 0) {
        returnObj.push(region.join(''));
    }
    return returnObj;
}
function populateAttributes(nodeElement, templateTokenPair) {
    const attribs = nodeElement.attribs;
    if (attribs) {
        for (let key in attribs) {
            let val = attribs[key];
            const splitPair = splitPairs(val, templateTokenPair);
            if (splitPair.length > 1) {
                //const newValTokens = [];
                const isEventHandler = key.startsWith('on');
                for (let i = 0, ii = splitPair.length; i < ii; i++) {
                    const token = splitPair[i];
                    if (token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs) {
                        splitPair[i] = isEventHandler ? '' : '{{';
                        let val2 = splitPair[i + 1];
                        const posOfDot = val2.indexOf('.');
                        if (posOfDot > -1) {
                            val2 = val2.substr(posOfDot + 1);
                            splitPair[i + 1] = val2;
                        }
                        splitPair[i + 2] = isEventHandler ? '' : '}}';
                    }
                }
                let newKey;
                if (isEventHandler) {
                    newKey = 'on-' + key.substr(2);
                }
                else {
                    newKey = key + '$';
                }
                attribs[newKey] = splitPair.join('');
                delete attribs[key];
            }
        }
    }
}
function populateTextNode(nodeElement, templateTokenPair, parent, $) {
    if (parent.children.length !== 1) {
        const text = nodeElement['data'];
        const lines = text.split('\n');
        const $nodeElement = $(nodeElement);
        const $parent = $(parent);
        for (let i = 0, ii = lines.length; i < ii; i++) {
            const line = lines[i].trim();
            if (line.startsWith('${')) {
                const iPosOfMap = line.indexOf('.map(');
                let itemsPointer = line.substr(0, iPosOfMap).substr(2);
                const iPosOfDot = itemsPointer.indexOf('.');
                if (iPosOfDot > -1) {
                    itemsPointer = itemsPointer.substr(iPosOfDot + 1);
                }
                //const $newElement = $nodeElement.after();
                //debugger;
                //const $newElement = $(parent).append(`<template is="dom-repeat" items="{{${itemsPointer}}}"></template>`);
                const nextElements = [];
                let nextElement = nodeElement.next;
                while (nextElement) {
                    if (nextElement.type === 'text' && nextElement['data'].indexOf("`).join('')}") > -1) {
                        $(nextElement).remove();
                        nextElement = null;
                    }
                    else {
                        nextElements.push(nextElement);
                        nextElement = nextElement.next;
                    }
                }
                $nodeElement.before(`<template is="dom-repeat" items="{{${itemsPointer}}}"></template>`);
                //debugger;
                const $newElement = $(nodeElement.prev);
                $nodeElement.remove();
                // const itemsToRemove: Cheerio[] = [$nodeElement];
                //debugger;
                for (let j = 0, jj = nextElements.length; j < jj; j++) {
                    const $nextElement = $(nextElements[j]);
                    $newElement[0].children.push($nextElement[0]);
                    //$newElement.append($nextElement);
                    $nextElement.remove();
                }
            }
        }
        return;
    }
    //parent.children.length === 1 below -- check for string interpolation
    const $parent = $(parent);
    const innerText = $parent.text();
    const splitPair = splitPairs(innerText, templateTokenPair);
    if (splitPair.length > 1) {
        for (let i = 0, ii = splitPair.length; i < ii; i++) {
            const token = splitPair[i];
            if (token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs) {
                splitPair[i] = '{{';
                let val = splitPair[i + 1];
                const posOfDot = val.indexOf('.');
                if (posOfDot > -1) {
                    val = val.substr(posOfDot + 1);
                    splitPair[i + 1] = val;
                }
                splitPair[i + 2] = '}}';
            }
        }
        $parent.text(splitPair.join(''));
    }
}
//# sourceMappingURL=facets2polymer.js.map