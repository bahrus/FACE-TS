//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>
"use strict"

declare var require;
//const esprima = require('esprima');
import cheerio = require('cheerio');
require('reflect-metadata/Reflect');
const path = require('path');
const filePath = './Tests/FlagIcon';
import rt = require('./@rt');

//import flagIcon = require(filePath);
//import flagIcon = require('./Tests/FlagIcon');

export interface IPair{
    lhs: string;
    rhs: string;
}

//var flagIcon = require(filePath);
processFACETSFileTemplate(filePath);


function processFACETSFileTemplate(filePath: string){
    const facetsFile = require(filePath);
    const fileName = path.basename(filePath);
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
    
    const domID  = toSnakeCase(fileName); //TODO
    tokensEvaluated = `
    <dom id="${domID}">
        ${tokensEvaluated}
    </dom>`;
    //console.log(tokensEvaluated);
    processFACETSFileClass(fileName, facetsFile);
    
}
interface INameValuePair{
    name: string;
    value: string;
}

interface IPropertyInfo {
    name: string;
    propertyDescriptor: PropertyDescriptor;
    //metadata: {[key: string]: string};
    metadata: INameValuePair[];
    type?: any;
}

function processFACETSFileClass(className: string, facetsFile: any){
    
    const classDef = facetsFile[className];
    console.log(classDef);
    const classProto = classDef.prototype;
    const propNames = Object.getOwnPropertyNames(classProto);
    console.log(Object.keys(classProto));
    console.log(propNames);
    const properties : IPropertyInfo[]  = [];
    const methods : {[key: string] : PropertyDescriptor}  = {};
    for(let i = 0, ii = propNames.length; i < ii; i++){
        const propName = propNames[i];
        //console.log(propName);
        const propDescriptor = Object.getOwnPropertyDescriptor(classProto, propName);
        if(propDescriptor.get){
                const propertyInfo : IPropertyInfo = {
                    propertyDescriptor: propDescriptor,
                    metadata:[],
                    name:propName,
                };
                const keys = Reflect.getMetadataKeys(classProto, propName) as string[];
                const typeInfo = Reflect.getMetadata('design:type', classProto, propName);
                if(typeInfo){
                    const typeSig = typeInfo.toString();
                    const typeSigWOFn = typeSig.substr('function '.length);
                    const iPosOfParent = typeSigWOFn.indexOf('(');
                    const typeSigWOParenthesis = typeSigWOFn.substr(0, iPosOfParent);
                    propertyInfo.type = typeSigWOParenthesis;
                }
                const webComponentProps = Reflect.getMetadata( rt.WebComponentProps, classProto, propName) as rt.IPropertyProps;
                if(webComponentProps){
                    for(var key in webComponentProps){
                        const polymerPref = 'polymer_'
                        if(!key.startsWith(polymerPref)) continue;
                        const actualKey = key.substr(polymerPref.length);
                        const metaPair : INameValuePair = {
                            name: actualKey,
                            value: webComponentProps[key],
                        };
                        propertyInfo.metadata.push(metaPair);
                    }
                    if(webComponentProps.defaultValue){
                        let defaultValue = webComponentProps.defaultValue;
                        if(propertyInfo.type === 'String'){
                            defaultValue = `'${defaultValue}'`;
                        }
                        const metaPair: INameValuePair = {
                            name: 'value',
                            value: defaultValue,
                        }
                        propertyInfo.metadata.push(metaPair);
                    }
                }
                const computedProp = Reflect.getMetadata(rt.ComputedRelationship, classProto, propName) as rt.IComputedPropInfo;
                if(computedProp){
                    const polymerArgList = computedProp.argList.map(s => s.replace('this.', ''));
                    const polymerArgString = polymerArgList.join();
                    const metaPair: INameValuePair = {
                        name: 'computed',
                        value: `${computedProp.computedMethodName}(${polymerArgString})`,
                    }
                    propertyInfo.metadata.push(metaPair);
                }
                properties.push(propertyInfo);
                //console.log(propDescriptor.get.toString());
        }else if(propDescriptor.value && typeof(propDescriptor.value) === 'function'){
            //debugger;
        }
        
    }
    const tagName = toSnakeCase(className);
    const polymerPrototypeString = `
    Polymer({
        is: '${tagName}',
        properties: {                           ${properties.map(property => `
            ${property.name}:{                      ${property.type? `
                type: ${property.type},`            : ''}
                                                    ${property.metadata.map(nvp=>`
                ${nvp.name}: ${nvp.value}`          )}
            }`                                  )}
        }
    });
    `;
    console.log(polymerPrototypeString);
}
function toSnakeCase(s: string){
	return s.replace(/([A-Z])/g, ($1, a, idx) => {
        const dash = idx === 0 ? '' : '-';
        return dash + $1.toLowerCase();
    });

}
// const parsed = esprima.parse(tokensEvaluated);

function trimOutside(s: string, start: string, end?: string) : string {
    if(!end) end = start;
    const iPosOfStart = s.indexOf(start);
    const iPosOfEnd = s.lastIndexOf(end);
    if(iPosOfEnd === -1) return s.substr(iPosOfStart + start.length);
    return s.substring(iPosOfStart + start.length, iPosOfEnd);
}
function parseNodeElement(nodeElement:  CheerioElement, templateTokenPair: IPair, parent: CheerioElement, $: CheerioStatic){
    if(!nodeElement) return;
    if(nodeElement.type==='text'){
        populateTextNode(nodeElement, templateTokenPair, parent, $);
    }else{
        populateAttributes(nodeElement, templateTokenPair);
    }
    const children = nodeElement.children;
    if(!children) return;
    for(let i = 0, ii = children.length; i < ii; i++){
        const child = children[i];
        parseNodeElement(child, templateTokenPair, nodeElement, $);
    }
}

function parseNode($node:  Cheerio, $: CheerioStatic){
    const templateTokenPair: IPair = {
        lhs: '${',
        rhs: '}'
    };
    for(let i = 0, ii = $node.length; i< ii; i++){
        const node = $node[i];
        parseNodeElement(node, templateTokenPair, null, $);       
    }
    
    
}

function splitPairs(text: string, pair: IPair): string[]{
    const returnObj: string[] = [];
    let region: string[] = [];
    const lhsFirstChr = pair.lhs.substr(0, 1);
    const rhsFirstChr = pair.rhs.substr(0, 1);
    const lhsLength = pair.lhs.length;
    const rhsLength = pair.rhs.length;
    for(let i = 0, ii = text.length; i < ii; i++){
        const chr = text[i];
        let foundLHSMatch: boolean;
        let foundRHSMatch: boolean;
        if(chr === lhsFirstChr){
            if(text.substr(i, lhsLength) === pair.lhs){
                foundLHSMatch = true;
            }
        }
        if(chr === rhsFirstChr){
            if(text.substr(i, rhsLength) === pair.rhs){
                foundRHSMatch = true;
            }
        }
        if(foundLHSMatch || foundRHSMatch){
            if(region.length > 0) {
                returnObj.push(region.join(''));
                region = [];
            }
            returnObj.push(foundLHSMatch ? pair.lhs : pair.rhs );
            
            i += (foundLHSMatch ? lhsLength: rhsLength) - 1;
        }else{
            region.push(chr);
        }
        

    }
    if(region.length > 0){
        returnObj.push(region.join(''));
    }
    return returnObj;
}

function populateAttributes(nodeElement:  CheerioElement, templateTokenPair: IPair){
    const attribs = nodeElement.attribs;
    if(attribs){
        for(let key in attribs){
            let val = attribs[key] as string;
            const splitPair = splitPairs(val, templateTokenPair);
            if(splitPair.length > 1){
                //const newValTokens = [];
                const isEventHandler = key.startsWith('on');
                for(let i = 0, ii = splitPair.length; i < ii; i++){
                    const token = splitPair[i];
                    if(token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs){
                        splitPair[i] = isEventHandler ? '' : '{{';
                        let val2 = splitPair[i + 1];
                        const posOfDot = val2.indexOf('.');
                        if(posOfDot > -1){
                            val2 = val2.substr(posOfDot + 1);
                            splitPair[i + 1] = val2;
                        }
                        splitPair[i + 2] = isEventHandler ? '' : '}}';
                    }    
                }
                let newKey: string;
                if(isEventHandler){
                    newKey = 'on-' + key.substr(2);
                }else{
                    newKey = key + '$';
                }
                attribs[newKey] = splitPair.join('');
                delete attribs[key];
            }
            
        }
    }

}

function populateTextNode(nodeElement:  CheerioElement, templateTokenPair: IPair, parent: CheerioElement, $: CheerioStatic){
    if(parent.children.length !== 1) {
        const text = nodeElement['data'] as string;
        const lines = text.split('\n');
        const $nodeElement = $(nodeElement);
        const $parent = $(parent);
        for(let i = 0, ii = lines.length; i < ii; i++){
            const line = lines[i].trim();
            if(line.startsWith('${')){
                const iPosOfMap = line.indexOf('.map(');
                let itemsPointer = line.substr(0, iPosOfMap).substr(2);
                const iPosOfDot = itemsPointer.indexOf('.');
                if(iPosOfDot > -1){
                    itemsPointer = itemsPointer.substr(iPosOfDot + 1);
                }
                //const $newElement = $nodeElement.after();
                //debugger;
                //const $newElement = $(parent).append(`<template is="dom-repeat" items="{{${itemsPointer}}}"></template>`);
                
                const nextElements: CheerioElement[] = [];
                let nextElement = nodeElement.next;
                while(nextElement){
                    if(nextElement.type === 'text' && nextElement['data'].indexOf("`).join('')}") > -1){
                        $(nextElement).remove();
                        nextElement = null;
                        
                    }else{
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
                for(let j = 0, jj = nextElements.length; j < jj; j++){
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
    if(splitPair.length > 1){
        for(let i=0, ii = splitPair.length; i < ii; i++){
            const token = splitPair[i];
            if(token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs){
                splitPair[i] = '{{';
                let val = splitPair[i + 1];
                const posOfDot = val.indexOf('.');
                if(posOfDot > -1){
                    val = val.substr(posOfDot + 1);
                    splitPair[i + 1] = val;
                }
                splitPair[i + 2] = '}}';
            }
        }
        $parent.text(splitPair.join(''));
        
    }
    
}








