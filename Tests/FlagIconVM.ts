///<reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts"/>


"use strict"
declare var require;
import bt = require('../bt');
import rt = require('../rt');

const country_change_handler = 'country_change_handler';
const test = Symbol();

//const test = 'test';
export const FlagIconVMTemplate = (flag_icon: FlagIconVM) => `
    <div>
        <img src="${flag_icon.countryCodeImgUrl}" 
        onclick="${flag_icon.countryClickHandler()}">
    </div>
    <span>Hello ${flag_icon.countryCodeImgUrl}</span>
    <div>NickNames:</div>
    <ul>
                                                        ${flag_icon.nickNames.map(nickName =>`
        <li style="background-color:red">NickName: ${nickName}</li>
                                                        `).join('')}                                                                        
    </ul>
`;
class HTMLElement{
    setAttribute(name: string, val: string){}
}

export class Designer{
    
    constructor(public firstName: string, public lastName: string){

    }
    
}


export class FlagIconVM extends HTMLElement {

    
    nickNames: string[];
    
    designer: Designer;
    

    private _countryCodeToImgUrlLookup: {[key: string] : string};
    constructor() {
        super();
    }

    computeCountryCodeImgUrl(countryCode){
        return this._countryCodeToImgUrlLookup[countryCode];
    }
    
    @bt.toProp()
    get countryCodeImgUrl() : string{
        return this.computeCountryCodeImgUrl(this.country)
    }

    

    static get observedAttributes() { return ["country"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        // name will always be "country" due to observedAttributes
    }
    connectedCallback() {
        //connectedCallback
        this.designer = new Designer("Jon", "Snow");
    }

    @bt.toProp({
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
        this.designer.lastName = 'Stark';
    }

}


