///<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>
///<reference path="Scripts/typings/cheerio/cheerio.d.ts"/>
///<reference path="Scripts/typings/node/node.d.ts"/>
"use strict"

declare var require;
//const esprima = require('esprima');
import cheerio = require('cheerio');
require('reflect-metadata/Reflect');
import path = require('path');
import fs = require('fs');
const process = require('process');
//const filePath = './Tests/FlagIcon';
const filePath = process.argv[2];
import rt = require('./bt');

function processFACETSFileTemplate(filePath: string){
    const facetsFile = require(filePath);
    const fileName = path.basename(filePath);
    const templateName = fileName + "Template"; 
    const templateFnString = facetsFile[templateName].toString();
    const templateHTML = `<template>
        ${templateFnString}
    </template>`;
    const $ = cheerio.load(templateHTML);
    // parseNode($.root(), $);
    // let tokensEvaluated = $.root().html();
    // //debugger;
    // tokensEvaluated = tokensEvaluated.substr('<template>'.length);
    // tokensEvaluated = tokensEvaluated.substr(0, tokensEvaluated.length - '</template>'.length);
    // const arrowFunction = /=&gt;/g;
    // tokensEvaluated = tokensEvaluated.replace(arrowFunction, '=>');
    // const joinAposApos = /&apos;&apos;/g;
    // tokensEvaluated = tokensEvaluated.replace(joinAposApos, "''");
    // tokensEvaluated = trimOutside(tokensEvaluated, '`');
    
    // const domID  = toSnakeCase(fileName); //TODO
    // tokensEvaluated = `
    // <link rel="import" href="bower_components/polymer/polymer.html"/>
    // <dom id="${domID}">
    //     <template>
    //     ${tokensEvaluated}
    //     </template>
    //     <script>
    //         ${processFACETSFileClass(fileName, facetsFile)}
    //     </script>
    // </dom>`;
    // return tokensEvaluated;
}

