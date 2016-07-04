//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>

const __rt = '__@rt';
export const WebComponentProps = 'WebComponentProps';
export const ComputedRelationship = 'ComputedRelationship';
const getter = function(ID: string, defaultValue?: any){
    return function(){
        const lu = this[__rt];
        if(!lu) return defaultValue;
        return lu[ID];
    }
}

const setter = function(ID: string){
	return function(val){
		let lu = this[__rt];
		if(!lu){
			lu = [];
			this[__rt] = lu;
		}
		lu[ID] = val;
	}
}

export interface IPropertyProps{
	defaultValue?: any;
	polymer_notify?: boolean;
	polymer_observer?: string; 
}

export interface IComputedPropInfo{
	computedMethodName: string;
	argList: string[];
}

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
