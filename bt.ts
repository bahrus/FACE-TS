//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>
import cheerio = require('cheerio');


const __bt = '__@bt';
export const WebComponentProps = 'WebComponentProps';
export const ComputedRelationship = 'ComputedRelationship';
const getter = function(ID: string, defaultValue?: any){
    return function(){
        const lu = this[__bt];
        if(!lu) return defaultValue;
        return lu[ID];
    }
}

const setter = function(ID: string){
	return function(val){
		let lu = this[__bt];
		if(!lu){
			lu = [];
			this[__bt] = lu;
		}
		lu[ID] = val;
	}
}

export interface IPropertyProps{
	/**
	 * Default value for the property. If value is a function, the function is invoked and the return value is used as the default value of the property. If the default value should be an array or object unique to the instance, create the array or object inside a function. See Configuring default property values for more information.
	 */
	defaultValue?: any;
	/**
	 * If true, the property is available for two-way data binding. In addition, an event, property-name-changed is fired whenever the property changes. See Property change notification events (notify) for more information.
	 */
	polymer_notify?: boolean;
	/**
	 * The value is interpreted as a method name to be invoked when the property value changes. Note that unlike in 0.5, property change handlers must be registered explicitly. The propertyNameChanged method will not be invoked automatically. See Property change callbacks (observers) for more information.
	 */
	polymer_observer?: string; 

	/**
	 * If true, the property can't be set directly by assignment or data binding.
	 */
	polymer_readOnly?: boolean;

	/**
	 * Set to true to cause the corresponding attribute to be set on the host node when the property value changes. If the property value is Boolean, the attribute is created as a standard HTML boolean attribute (set if true, not set if false). For other property types, the attribute value is a string representation of the property value. Equivalent to reflect in Polymer 0.5. See Reflecting properties to attributes for more information.
	 */
	polymer_reflectToAttribute?: boolean;
}

export interface IComputedPropInfo{
	computedMethodName: string;
	argList: string[];
}

//#region
export interface IPair{
    lhs: string;
    rhs: string;
}

export interface INameValuePair{
    name: string;
    value: string;
}

export interface IPropertyInfo {
    name: string;
    propertyDescriptor: PropertyDescriptor;
    //metadata: {[key: string]: string};
    metadata: INameValuePair[];
    type?: any;
}

export interface IMethodInfo{
    name: string;
    value: any;
    functionStr: string;
}
//#endregion

export function toProp(props?: IPropertyProps){
	return (classPrototype: any, fieldName: string) =>{
		
		//from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
		if (!this[fieldName]) {
			// Create new property with getter and setter
			const propDescriptor = Object.getOwnPropertyDescriptor(classPrototype, fieldName);
			if(propDescriptor){
				const getter = propDescriptor.get;
				const setter = propDescriptor.set;
				if(getter && !setter){
					const getterString = getter.toString();
					const splitReturn = getterString.split('return');
					if(splitReturn.length === 2){
						const beforeBrace = splitReturn[1].split('}');
						if(beforeBrace.length === 2){
							const splitParent = beforeBrace[0].split('(');
							if(splitParent.length === 2){
								const splitFunctionThis = splitParent[0].split('this.');
								const splitArgsParenthis = splitParent[1].split(')');
								if(splitFunctionThis.length === 2 && splitArgsParenthis.length === 2){
									const computeFunctionName = splitFunctionThis[1].trim();
									const args = splitArgsParenthis[0];
									const splitArgs = args.split(',');
									//const argList = splitArgs.map(s => s.replace('this.', '')).join();
									const computedPropInfo : IComputedPropInfo = {
										argList : splitArgs,
										computedMethodName: computeFunctionName,
									};
									Reflect.defineMetadata(ComputedRelationship, computedPropInfo, classPrototype, fieldName);
								}
							}
							
						}
					}
					//const re = /?function/;
					//const test = getterString.split(re);
				}
			}else{
				Object.defineProperty(classPrototype, fieldName, {
					get: getter(fieldName, props? props.defaultValue : null),
					set: setter(fieldName),
					enumerable: true,
					configurable: true,
					
				});			
			}
			
			Reflect.defineMetadata(WebComponentProps, props, classPrototype, fieldName);
		}
	}
}

export function generateTemplateAbstractSyntaxTree(templateFnString: string){
	const templateHTML = `<template>
        ${templateFnString}
    </template>`;
    
	const $ = cheerio.load(templateHTML);
	processRoot($.root(), $);
                                                                                                                                                                                                    return $.root();
}

function processRoot($node:  Cheerio, $: CheerioStatic){
    const templateTokenPair: IPair = {
        lhs: '${',
        rhs: '}'
    };
    $node.each((idx, node) =>{
        processNodeElement(node, templateTokenPair, null, $);
    })
    
}



function populateTextNode(nodeElement:  CheerioElement, templateTokenPair: IPair, parent: CheerioElement, $: CheerioStatic){
    
    
    //parent.children.length === 1 below -- check for string interpolation
    //const $parent = $(parent);
    //const innerText = $parent.text();
    const innerText = nodeElement['data'];
    const splitPair = splitPairs(innerText, templateTokenPair);
    if(splitPair.length > 1){
        for(let i=0, ii = splitPair.length; i < ii; i++){
            const token = splitPair[i];
            if(token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs){
                splitPair[i] = '<xsl:value-of select="';
                let val = splitPair[i + 1];
                const posOfDot = val.indexOf('.');
                if(posOfDot > -1){
                    val = val.substr(posOfDot + 1);
                    splitPair[i + 1] = val;
                }
                splitPair[i + 2] = '"/>';
            }
        }
        //$parent.text(splitPair.join(''));
        const $parent = $(parent);
        $parent.html(splitPair.join(''));
        //nodeElement['data'] = splitPair.join('');
    }
    
}

function processNodeElement(nodeElement:  CheerioElement, templateTokenPair: IPair, parent: CheerioElement, $: CheerioStatic){
    if(!nodeElement) return;
    if(nodeElement.type==='text'){
        populateTextNode(nodeElement, templateTokenPair, parent, $);
    }else{
        processAttributes(nodeElement, templateTokenPair);
    }
    const children = nodeElement.children;
    if(!children) return;
    const processChildrenFn = () =>{
        children.forEach(child => {
            processNodeElement(child, templateTokenPair, nodeElement, $);
        });
    }
    if(children.length !== 3) return processChildrenFn();
    const lastChild = children[2];
    if(lastChild.type !== 'text') return processChildrenFn();

    const lastChildText = lastChild['data'] as string;
    const lastChildTextTrim = lastChildText.trim();
    if(!lastChildTextTrim || lastChildTextTrim !== "`).join('')}") return processChildrenFn()
    const firstChild = children[0];
    if(firstChild.type !== 'text') return processChildrenFn();
    const firstChildText = firstChild['data'] as string;
    const firstChildTextTrim = firstChildText.trim();
    const splitMap = firstChildTextTrim.split('.map(');
    if(splitMap.length !== 2) return processChildrenFn(); //TODO: deal with other cases
    const listPath0 = splitMap[0];
    const splitPath0 = listPath0.split('${');
    if(splitPath0.length !== 2) return processChildrenFn();

    //firstChild['data'] = '<hello>';
    //lastChild['data'] = '</hello>';
    const $nodeElement = $(nodeElement);
    const middleChild = children[1];
    processNodeElement(middleChild, templateTokenPair, nodeElement, $);
    $nodeElement.html(`<xsl:for-each select="${splitPath0[1]}">` + $(middleChild).html() + '</xsl:for-each>');
    
}

function processAttributes(nodeElement:  CheerioElement, templateTokenPair: IPair){
    const attribs = nodeElement.attribs;
	if(!attribs) return;
	for(let key in attribs){
		let val = attribs[key] as string;
		const splitPair = splitPairs(val, templateTokenPair);
		if(splitPair.length > 1){
			const isEventHandler = key.startsWith('on');
			const ii = splitPair.length;
			splitPair.forEach((token, i) =>{
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
			});
			let newKey: string;
			let newVal = splitPair.join('');
			if(isEventHandler){
				newVal = newVal.replace('()', '');
				newKey = 'on-' + key.substr(2);
			}else{
				newKey = key + '$';

			}
			attribs[newKey] = newVal;
			delete attribs[key];
		}
		
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
