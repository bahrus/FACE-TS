//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>
import cheerio = require('cheerio');


const __bt = '__@bt';
export const WebComponentProps = 'WebComponentProps';
export const ComputedRelationship = 'ComputedRelationship';
const designTypeMetaKey = 'design:type';
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

//#region class reflection
export interface IPair{
    lhs: string;
    rhs: string;
}

export interface INameValuePair{
    name: string;
    value: string;
}

export interface IPropertyInfo extends IReflectionEntity {
    //name?: string;
    propertyDescriptor?: PropertyDescriptor;
    //metadata: {[key: string]: string};
    //metadata: INameValuePair[];
    type?: any;
}

export class PropertyInfo implements IPropertyInfo{
    constructor(public name: string, public propertyTypeClassRef: Function){}
    private _propertyType;
    public get propertyType(){
        if(!this._propertyType){
            this._propertyType = reflectClassPrototype(this.propertyTypeClassRef.prototype, true);
        }
        return this._propertyType;
    }

}

export interface IMemberInfo extends IReflectionEntity{
    propertyDescriptor ?: any;
    isPublic?: boolean;
}

export interface IMethodArgument extends IReflectionEntity {
    argumentType?:  IType;
    argumentTypeClassRef?: any;
}

export class MethodArgument implements IMethodArgument{
    constructor(public name: string, public argumentTypeClassRef: Function){}
    private _argumentType : IType;
    public get argumentType(){
        if(!this._argumentType){
            this._argumentType = reflectClassPrototype(this.argumentTypeClassRef.prototype, true);
        }
        return this._argumentType;
    }
}

export interface IMethodInfo extends IMemberInfo{
    value?: any;
    functionStr?: string;
    returnType?: IType;
    returnTypeClassRef?: Function;
    args?: IMethodArgument[];
}

export class MethodInfo implements IMethodInfo{
    constructor(public name: string, public args: IMethodArgument[], public returnTypeClassRef?: Function){}
    private _returnType: IType;	
    public get returnType(){
        if(!this._returnType){
            this._returnType = reflectClassPrototype(this.returnTypeClassRef.prototype, true);
        }
        return this._returnType;
    }	
}

export interface IReflectionEntity{
    name?: string;
    metadata?: {[key: string] : any;};
}

export interface IType extends IReflectionEntity{
    properties?: IPropertyInfo[];
    methods?: IMethodInfo[];
    staticProperties?: IPropertyInfo[];
    staticMethods?: IMethodInfo[];
    
}

function reflectClassPrototype(classPrototype: any, recursive?: boolean) : IType{
    let name : string = classPrototype.constructor.toString().substring(9);
    const iPosOfOpenParen = name.indexOf('(');
    name = name.substr(0, iPosOfOpenParen);
    const returnType : IType = {
        name: name
    }
    addMemberInfo(returnType, classPrototype, true, recursive);
    return returnType;
}

export function processFACETSFileClass(className: string, facetsFile: any) : IType{
    const classDef = facetsFile[className];
    const classProto = classDef.prototype;
    return reflectClassPrototype(classProto, true);
}

function getPropertyDescriptor(classPrototype: any, memberKey: string){
    while(classPrototype){
        const propertyDescriptor = Object.getOwnPropertyDescriptor(classPrototype, memberKey);
        if(propertyDescriptor) return propertyDescriptor;
        classPrototype = classPrototype.__proto__;
    }
    return null;
    
}

export function createNew<InterfaceImplementorType, InterfaceType>(classRef: Function, obj: InterfaceType ){
    const implObj = new (<any>classRef)();
    Object.assign(implObj, obj);
    return <InterfaceImplementorType> implObj;
}
    
function addMemberInfo(returnType: IType, classRefOrClassPrototype: any, isPrototype: boolean, recursive?: boolean){
    const memberNames = Object.getOwnPropertyNames(classRefOrClassPrototype);
    for(const memberKey of memberNames){
        const propertyDescriptor = getPropertyDescriptor(classRefOrClassPrototype, memberKey);
        if(propertyDescriptor){
            const memberInfo : IMemberInfo = {
                name: memberKey,
                propertyDescriptor : propertyDescriptor,
            };
            const metaDataKeys = Reflect.getMetadataKeys(classRefOrClassPrototype, memberKey);
            for(let i = 0, n = metaDataKeys.length; i < n; i++){
                const metaKey = metaDataKeys[i];
                if(!memberInfo.metadata) memberInfo.metadata = {};
                //debugger;
                memberInfo.metadata[metaKey] = Reflect.getMetadata(metaKey, classRefOrClassPrototype, memberKey);
            }
            if(propertyDescriptor.value){
                //#region method
                //const methodInfo = <IMethodInfo> memberInfo;
                const methodInfo = createNew<MethodInfo, IMemberInfo>(MethodInfo, memberInfo);
                const methodSignature = propertyDescriptor.value.toString();
                const signatureInsideParenthesis = substring_between(methodSignature, '(', ')');
                if(!signatureInsideParenthesis){
                    console.log('TODO: handle this scenario');
                    continue;
                }
                const paramNames = signatureInsideParenthesis.split(',');
                if(memberInfo.metadata){
                    const paramTypes = memberInfo.metadata['design:paramtypes'];
                    if(paramTypes.length > 0){
                        if(paramNames.length !== paramTypes.length){
                        throw `Discrepency found in method parameters for method:  ${memberKey}`;
                        }
                        methodInfo.args = [];
                        methodInfo.returnTypeClassRef = memberInfo.metadata['design:returntype'];
                        for(let i = 0, n = paramTypes.length; i < n; i++){
                            const paramInfo = new MethodArgument(paramNames[i].trim(), paramTypes[i]);
                            
                            methodInfo.args.push(paramInfo);
                        }
                    }
                }
                
                
            
                if(isPrototype){
                    if(!returnType.methods) returnType.methods = [];
                    returnType.methods.push(methodInfo);
                }else{
                    if(!returnType.staticMethods) returnType.staticMethods = [];
                    returnType.staticMethods.push(methodInfo);
                }
                
                //#endregion
            }else if(propertyDescriptor.get || propertyDescriptor.set){
                //#region property
                const propInfo = createNew<PropertyInfo, IMemberInfo>(PropertyInfo, memberInfo); 
                
                if(isPrototype){
                    if(!returnType.properties) returnType.properties = [];
                    returnType.properties.push(propInfo);
                }else{
                    if(!returnType.staticProperties) returnType.staticProperties = [];
                    returnType.staticProperties.push(propInfo);
                }
                    if(recursive){
                    const propertyType = Reflect.getMetadata(designTypeMetaKey, classRefOrClassPrototype, memberKey);
                    propInfo.propertyTypeClassRef = propertyType;
                // 	if(propertyType){
                // 		propInfo.propertyType = reflectPrototype(propertyType.prototype, recursive);
                // 	}
                }
                
                //#endregion
            }
        }
        
    }
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
    const splitArrow = templateFnString.split('=>');
    const parameterSide = splitArrow.shift();
    const parameterSideWithoutParenthesis = parameterSide.replace('(', '').replace(')', '');
    const parameterSideWithoutType = parameterSideWithoutParenthesis.split(':')[0].trim();
    const functionBodySide = splitArrow.join('=>').trim().substr(1);
	const templateHTML = `<xsl:template match="${parameterSideWithoutType}">
        ${functionBodySide}
    </xsl:template>`;
    
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
    const innerText = nodeElement['data'];
    const splitPair = splitPairs(innerText, templateTokenPair);
    if(splitPair.length > 1){
        for(let i=0, ii = splitPair.length; i < ii; i++){
            const token = splitPair[i];
            if(token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs){
                splitPair[i] = '<xsl:value-of select="';
                const val = splitPair[i + 1];
                const valWithoutHeadToken = removeHeadToken(val, '.');
                const newVal = replaceAll( valWithoutHeadToken, '.', '/') 
                splitPair[i + 1] = newVal;
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
    };
    //const $nodeElement = $(nodeElement);
    
    if(children.length !== 3) return processChildrenFn();
    const lastChild = children[2];
    if(lastChild.type !== 'text') return processChildrenFn();

    const lastChildText = lastChild['data'] as string;
    const lastChildTextTrim = lastChildText.trim();
    if(!lastChildTextTrim || lastChildTextTrim !== "`).join('')}") return processChildrenFn()
    const firstChild = children[0];
    if(firstChild.type !== 'text') return processChildrenFn();
    const firstChildText = firstChild['data'] as string;
    console.log(firstChildText);
    const firstChildTextTrim = firstChildText.trim();
    const splitMap = firstChildTextTrim.split('.map(');
    console.log(splitMap.length);
    if(splitMap.length !== 2) return processChildrenFn(); //TODO: deal with other cases
    const listPath0 = splitMap[0];
    const splitPath0 = listPath0.split('${');
    
    if(splitPath0.length !== 2) return processChildrenFn();
    const pathWithoutHeadToken = removeHeadToken(splitPath0[1], '.');
    const loopPath = replaceAll( pathWithoutHeadToken, '.', '/');
    const loopSignaure = splitMap[1].trim();
    const loopVariable = loopSignaure.split('=>')[0].trim();
    //firstChild['data'] = '<hello>';
    //lastChild['data'] = '</hello>';
    const $nodeElement = $(nodeElement);
    const middleChild = children[1];
    processNodeElement(middleChild, templateTokenPair, nodeElement, $);
    $nodeElement.html(`<xsl:for-each select="${loopPath}"><xsl:variable name='${loopVariable}' select='.'/>` + $(middleChild).html() + '</xsl:for-each>');
    
}

function processAttributes(nodeElement:  CheerioElement, templateTokenPair: IPair){
    const attribs = nodeElement.attribs;
	if(!attribs) return;
	for(let key in attribs){
		let val = attribs[key] as string;
		const splitPair = splitPairs(val, templateTokenPair);
		if(splitPair.length > 1){
			//const isEventHandler = key.startsWith('on');
			const ii = splitPair.length;
			splitPair.forEach((token, i) =>{
				if(token === templateTokenPair.lhs && i < ii - 2 && splitPair[i + 2] == templateTokenPair.rhs){
					//splitPair[i] = isEventHandler ? '' : '{{';
                    splitPair[i] = '{';
					let val2 = splitPair[i + 1];
					const posOfDot = val2.indexOf('.');
					if(posOfDot > -1){
						val2 = val2.substr(posOfDot + 1);
						splitPair[i + 1] = val2;
					}
					//splitPair[i + 2] = isEventHandler ? '' : '}}';
                    splitPair[i + 2] = '}';
				}
			});
			let newKey: string;
			let newVal = splitPair.join('');
			// if(isEventHandler){
			// 	newVal = newVal.replace('()', '');
			// 	newKey = 'on-' + key.substr(2);
			// }else{
			// 	newKey = key + '$';

			// }
            newKey = key;
			attribs[newKey] = newVal;
			//delete attribs[key];
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

function replaceAll(text: string, oldVal: string, newVal: string){
    return text.split(oldVal).join(newVal);
}

function removeHeadToken(text: string, search: string){
    const iPos = text.indexOf(search);
    if(iPos == 1) return text;
    return text.substr(iPos + 1);
}

function substring_between(value: string, LHDelim: string, RHDelim: string){
    const iPosOfLHDelim = value.indexOf(LHDelim);
    if(iPosOfLHDelim === -1) return null;
    const iPosOfRHDelim = value.indexOf(RHDelim);
    if(iPosOfRHDelim === -1) return value.substring(iPosOfLHDelim + LHDelim.length);
    return value.substring(iPosOfLHDelim + LHDelim.length, iPosOfRHDelim);
}
