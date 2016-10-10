//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>
///<reference path="Scripts/typings/cheerio/cheerio.d.ts"/>
///<reference path="Scripts/typings/node/node.d.ts"/>
"use strict";
require('reflect-metadata/Reflect');
const path = require('path');
const fs = require('fs');
const process = require('process');
//const filePath = './Tests/FlagIcon';
const filePath = process.argv[2];
const bt = require('./bt');
//import flagIcon = require(filePath);
//import flagIcon = require('./Tests/FlagIcon');
//var flagIcon = require(filePath);
function processFACETSFileTemplate(filePath) {
    const facetsFile = require(filePath);
    const fileName = path.basename(filePath);
    const templateName = fileName + "Template";
    const templateFnString = facetsFile[templateName].toString();
    const astForView = bt.generateTemplateAbstractSyntaxTree(templateFnString);
    const classReflection = bt.processFACETSFileClass(fileName, facetsFile);
    const classDef = generatePolymerClassDefition(classReflection);
    const templateString = performHTMLTransformToPolymerFormat(astForView, classDef);
    // const test2 = astForView.html(); 
    // console.log(test2);
}
const outputS = processFACETSFileTemplate(filePath);
const resolvedFilePath = path.resolve(filePath);
const outputFilePath = resolvedFilePath + '.html';
fs.writeFileSync(outputFilePath, outputS, { encoding: 'utf8' });
function performHTMLTransformToPolymerFormat($, classDef) {
    const astForView = $.root();
    const rootTemplate = astForView.children('xsl\\:template');
    const matchParam = rootTemplate.attr('match').replace('_', '-');
    const valueOfs = rootTemplate.find('xsl\\:value-of');
    valueOfs.each((idx, valueOf) => {
        const $valueOf = $(valueOf);
        const select = $valueOf.attr('select');
        $valueOf.replaceWith('{{' + select + '}}');
    });
    const forEachs = rootTemplate.find('xsl\\:for-each');
    forEachs.each((idx, forEach) => {
        const $forEach = $(forEach);
        const select = $forEach.attr('select');
        const $variableNameElement = $forEach.children('xsl\\:variable');
        const name = $variableNameElement.attr('name');
        //const $repeatingElement = $variableNameElement.next();
        //$repeatingElement.attr('is', '');
        $variableNameElement.remove();
        const innerHTML = $forEach.html();
        $forEach.replaceWith(`<template is="dom-repeat" items="{{${select}}}" as="${name}">
            ${innerHTML}
        </template>
        `);
    });
    const outputTemplate = `
<dom-module id='${matchParam}'>
    <template>
    ${rootTemplate.html()}
    </template>
    <script>
        Polymer({
            is: '${matchParam}',
            ${classDef}
        });
    </script>
</dom-module>
    `;
    console.log(outputTemplate);
    return outputTemplate;
}
//from http://blog.codeeffects.com/Article/String-Builder-In-Java-Script
function StringBuilder() {
    var strings = [];
    this.append = function (string) {
        string = verify(string);
        if (string.length > 0)
            strings[strings.length] = string;
    };
    this.appendLine = function (string) {
        string = verify(string);
        if (this.isEmpty()) {
            if (string.length > 0)
                strings[strings.length] = string;
            else
                return;
        }
        else
            strings[strings.length] = string.length > 0 ? "\r\n" + string : "\r\n";
    };
    this.clear = function () { strings = []; };
    this.isEmpty = function () { return strings.length == 0; };
    this.toString = function () { return strings.join(""); };
    var verify = function (string) {
        if (!defined(string))
            return "";
        if (getType(string) != getType(new String()))
            return String(string);
        return string;
    };
    var defined = function (el) {
        // Changed per Ryan O'Hara's comment:
        return el != null && typeof (el) != "undefined";
    };
    var getType = function (instance) {
        if (!defined(instance.constructor))
            throw Error("Unexpected object type");
        var type = String(instance.constructor).match(/function\s+(\w+)/);
        return defined(type) ? type[1] : "undefined";
    };
}
;
function toJSObject(val) {
    let JSVal;
    switch (typeof (val)) {
        case 'string':
            JSVal = "'" + val + "'";
            break;
        default:
            JSVal = val;
    }
    return JSVal;
}
function generatePolymerClassDefition(classReflection) {
    let result = new StringBuilder();
    result.appendLine(`properties: {`);
    //let counter = 0;
    let propLen = classReflection.properties.length;
    classReflection.properties.forEach((property, idx) => {
        result.appendLine(property.name + ':{');
        if (property.metadata) {
            let type = property.metadata['design:type'].toString();
            if (type) {
                const splitFunction = type.split(' ');
                type = splitFunction[1].replace('(', '').replace(')', '');
                result.appendLine('type: ' + type);
            }
            const wcp = property.metadata['WebComponentProps'];
            if (wcp) {
                if (typeof (wcp.defaultValue) !== 'undefined') {
                    result.appendLine('value: ' + toJSObject(wcp.defaultValue));
                }
                for (const key in wcp) {
                    if (key.startsWith('polymer_')) {
                        const polymerKey = key.substring(8);
                        result.appendLine(polymerKey + ':' + toJSObject(wcp[key]));
                    }
                }
            }
        }
        //counter++;
        if (idx < propLen - 1) {
            result.appendLine('},');
        }
        else {
            result.appendLine('}');
        }
        //result.appendLine('');
    });
    result.appendLine('}');
    if (classReflection.methods || classReflection.staticMethods) {
        result.append(',');
        if (classReflection.methods) {
            const methodLength = classReflection.methods.length;
            classReflection.methods.forEach((method, idx) => {
                const paramNames = method.args.map(arg => arg.name);
                result.appendLine(method.name + ': function(' + paramNames.join(',') + ')');
                result.append(method.methodBody);
                if (idx < methodLength - 1) {
                    result.append(',');
                }
            });
        }
    }
    return result.toString();
}
//# sourceMappingURL=facets2polymer.js.map