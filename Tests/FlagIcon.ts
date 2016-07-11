///<reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts"/>

"use strict"
declare var require;
import om = require('../om');

const country_change_handler = 'country_change_handler';

const test = 'test';
export const FlagIconTemplate = (flag_icon: FlagIcon) => `
    <div>
        <img src="${flag_icon.countryCodeImgUrl}" 
        onclick="${flag_icon.countryClickHandler()}">
    </div>
    <div>NickNames:</div>
    <ul>
                                                        ${flag_icon.nickNames.map(nickName =>`
        <li>NickName: ${nickName}</li>
                                                        `).join('')}                                                                        
    </ul>
`;
class HTMLElement{
    setAttribute(name: string, val: string){}
}
export class FlagIcon extends HTMLElement {

    
    nickNames: string[];
    
    

    private _countryCodeToImgUrlLookup: {[key: string] : string};
    constructor() {
        super();
    }

    computeCountryCodeImgUrl(countryCode){
        return this._countryCodeToImgUrlLookup[countryCode];
    }
    
    @om.toProp()
    get countryCodeImgUrl() : string{
        return this.computeCountryCodeImgUrl(this.country)
    }

    

    static get observedAttributes() { return ["country"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        // name will always be "country" due to observedAttributes
    }
    connectedCallback() {
        //connectedCallback
    }

    @om.toProp({
        polymer_observer: country_change_handler,
        defaultValue: 'us',
        polymer_readOnly: true,
    })
    public country: string = 'us';
    

    [country_change_handler](newVal: string, oldVal: string){
        //country change handler
    }

    countryClickHandler(){
        //on click handler
    }

}


