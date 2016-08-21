//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>
///<reference path="Scripts/typings/cheerio/cheerio.d.ts"/>
///<reference path="Scripts/typings/node/node.d.ts"/>
"use strict"

//declare var require;
//const esprima = require('esprima');
import cheerio = require('cheerio');
require('reflect-metadata/Reflect');
import path = require('path');
import fs = require('fs');
const process = require('process');
//const filePath = './Tests/FlagIcon';
const filePath = process.argv[2];
import bt = require('./bt');

//import flagIcon = require(filePath);
//import flagIcon = require('./Tests/FlagIcon');

//var flagIcon = require(filePath);

function processFACETSFileTemplate(filePath: string){
    const facetsFile = require(filePath);
    const fileName = path.basename(filePath);
    const templateName = fileName + "Template"; 
    const templateFnString = facetsFile[templateName].toString();
    const astForView = bt.generateTemplateAbstractSyntaxTree(templateFnString);
    performHTMLTransformToPolymerFormat(astForView);
    const test2 = astForView.html(); 
    console.log(test2);

    const result = bt.processFACETSFileClass(fileName, facetsFile);

}
const outputS = processFACETSFileTemplate(filePath);


const resolvedFilePath = path.resolve(filePath);
const outputFilePath = resolvedFilePath + '.html';

fs.writeFileSync(outputFilePath, outputS, {encoding: 'utf8'});

function performHTMLTransformToPolymerFormat(astForView:  Cheerio){
    const rootTemplate = astForView.children('xsl\\:template');
    const matchParam = rootTemplate.attr('match');
    const valueOfs = rootTemplate.find('xsl\\:value-of');
    
    const outputTemplate = `
    <dom id='${matchParam}'>
    <template>
    </template>
    </dom>
    `;
    console.log(outputTemplate);
    //const 
    //debugger;
    //console.log('match = ' + match);
    //const outPut = 
}












