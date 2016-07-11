//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>

const __om = '__@om';
export const WebComponentProps = 'WebComponentProps';
export const ComputedRelationship = 'ComputedRelationship';
const getter = function(ID: string, defaultValue?: any){
    return function(){
        const lu = this[__om];
        if(!lu) return defaultValue;
        return lu[ID];
    }
}

const setter = function(ID: string){
	return function(val){
		let lu = this[__om];
		if(!lu){
			lu = [];
			this[__om] = lu;
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
