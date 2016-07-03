///<reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts"/>

"use strict"
declare var require;
require('reflect-metadata/Reflect');
import rt = require('../@rt');

const country_change_handler = 'country_change_handler';
export const FlagIconTemplate = (flag_icon: FlagIcon) => `
    <div>
        <img src="${flag_icon.countryCodeImgUrl}" 
        onclick="${flag_icon.CountryClickHandler}">
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
    
    
    private _countryCode: string;

    private _countryCodeToImgUrlLookup: {[key: string] : string};
    constructor() {
        super();
        this._countryCode = null;
    }

    get countryCodeImgUrl() : string{
        return this._countryCodeToImgUrlLookup[this._countryCode]
    }

    static get observedAttributes() { return ["country"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        // name will always be "country" due to observedAttributes
        this._countryCode = newValue;
    }
    connectedCallback() {
        
    }

    //@Reflect.metadata('polymer-notify', true)
    @rt.toProp({
        polymer_observer: country_change_handler,
    })
    public country: string = null;
    // get country() : string{
    //     return this._countryCode;
    // }
    // set country(v: string) {
    //     this.setAttribute("country", v);
    // }

    [country_change_handler](newVal: string, oldVal: string){

    }

    get CountryClickHandler(){
        return function(e){

        }
    }

}