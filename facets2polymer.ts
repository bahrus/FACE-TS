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
    const classReflection = bt.processFACETSFileClass(fileName, facetsFile);
    const classDef = generatePolymerClassDefition(classReflection);
    const templateString = performHTMLTransformToPolymerFormat(astForView, classDef);
    // const test2 = astForView.html(); 
    // console.log(test2);

    
    

}
const outputS = processFACETSFileTemplate(filePath);


const resolvedFilePath = path.resolve(filePath);
const outputFilePath = resolvedFilePath + '.html';

fs.writeFileSync(outputFilePath, outputS, {encoding: 'utf8'});

function performHTMLTransformToPolymerFormat($: CheerioStatic, classDef: string){
    const astForView = $.root();
    const rootTemplate = astForView.children('xsl\\:template');
    const matchParam = rootTemplate.attr('match').replace('_', '-');
    const valueOfs = rootTemplate.find('xsl\\:value-of');
    valueOfs.each((idx, valueOf) =>{
        const $valueOf = $(valueOf);
        const select = $valueOf.attr('select');
        $valueOf.replaceWith('{{' + select + '}}');
    });
    const forEachs = rootTemplate.find('xsl\\:for-each');
    forEachs.each((idx, forEach) =>{
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
function StringBuilder(){
	var strings = [];

	this.append = function (string)
	{
		string = verify(string);
		if (string.length > 0) strings[strings.length] = string;
	};

	this.appendLine = function (string)
	{
		string = verify(string);
		if (this.isEmpty())
		{
			if (string.length > 0) strings[strings.length] = string;
			else return;
		}
		else strings[strings.length] = string.length > 0 ? "\r\n" + string : "\r\n";
	};

	this.clear = function () { strings = []; };

	this.isEmpty = function () { return strings.length == 0; };

	this.toString = function () { return strings.join(""); };

	var verify = function (string)
	{
		if (!defined(string)) return "";
		if (getType(string) != getType(new String())) return String(string);
		return string;
	};

	var defined = function (el)
	{
		// Changed per Ryan O'Hara's comment:
		return el != null && typeof(el) != "undefined";
	};

	var getType = function (instance)
	{
		if (!defined(instance.constructor)) throw Error("Unexpected object type");
		var type = String(instance.constructor).match(/function\s+(\w+)/);

		return defined(type) ? type[1] : "undefined";
	};
};

function generatePolymerClassDefition(classReflection: bt.IType){
    let result = new StringBuilder();
    result.appendLine(`
        properties: {`)
    let counter = 0;
    let propLen = classReflection.properties.length;
    classReflection.properties.forEach(property =>{
        result.appendLine('\t\t' + property.name + ':{');
            if(property.metadata){
                let type = property.metadata['design:type'].toString();
                if(type){
                    const splitFunction = type.split(' ');
                    type = splitFunction[1].replace('(', '').replace(')', '');
                    result.appendLine('\t\t\ttype: ' + type);
                }
                const wcp = property.metadata['WebComponentProps'] as bt.IPropertyProps;
                if(wcp){
                    if(typeof(wcp.defaultValue) !== 'undefined'){
                        let defaultValue;
                        switch(typeof(wcp.defaultValue)){
                            case 'string':
                                defaultValue = "'" + wcp.defaultValue + "'";
                                break;
                            default:
                                defaultValue = wcp.defaultValue;
                        }
                        result.appendLine('\t\t\tvalue: ' + defaultValue);
                    }
                }
                
            }
        counter++;
        if(counter < propLen){
            result.appendLine('\t\t},');
        }else{
            result.appendLine('\t\t}');
        }
        //result.appendLine('');
    })
    result.appendLine('\t\t}');
    // let result = `
    //     properties:{
    //         ${JSON.stringify(polymerProperties)}
    //     }
    // `;
    
    return result.toString();
}











