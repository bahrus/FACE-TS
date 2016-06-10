"use strict"

declare var require;
var esprima = require('esprima');
import cheerio = require('cheerio');
const filePath = './Tests/FlagIcon';


//import flagIcon = require(filePath);
import flagIcon = require('./Tests/FlagIcon');

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

function parseNode($node:  Cheerio){
    const templateTokenPair: IPair = {
        lhs: '${',
        rhs: '}'
    };
    for(let i = 0, ii = $node.length; i< ii; i++){
        const node = $node[i];
        parseNodeElement(node, templateTokenPair);
        
    }
    
    
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

function populateTextNode(nodeElement:  CheerioElement, templateTokenPair: IPair){
    const parent = nodeElement.parent;
    if(parent.children.length !== 1) return;
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
}

function parseNodeElement(nodeElement:  CheerioElement, templateTokenPair: IPair){
    if(nodeElement.type==='text'){
        populateTextNode(nodeElement, templateTokenPair);
    }else{
        populateAttributes(nodeElement, templateTokenPair);
    }
    const children = nodeElement.children;
    if(!children) return;
    for(let i = 0, ii = children.length; i < ii; i++){
        const child = children[i];
        console.log(child.type);
        
        parseNodeElement(child, templateTokenPair);
    }
}

export interface IPair{
    lhs: string;
    rhs: string;
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
            
            i += (foundLHSMatch ? lhsLength: rhsLength);
        }else{
            region.push(chr);
        }
        

    }
    if(region.length > 0){
        returnObj.push(region.join(''));
    }
    return returnObj;
}

