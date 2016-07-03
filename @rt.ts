//<reference path="node_modules/reflect-metadata/reflect-metadata.d.ts"/>

const __rt = '__@rt';

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

export function toProp(props?: IPropertyProps){
	return (classPrototype: any, fieldName: string) =>{
		
		//from http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-ii
		if (!this[fieldName]) {
			// Create new property with getter and setter
			Object.defineProperty(classPrototype, fieldName, {
				get: getter(fieldName, props.defaultValue),
				set: setter(fieldName),
				enumerable: true,
				configurable: true,
				
			});
			Reflect.defineMetadata('WebComponentProps', props, classPrototype, fieldName);
		}
	}
}
