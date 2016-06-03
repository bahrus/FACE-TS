"use strict"
export const FlagIconTemplate = (flag_icon: FlagIcon) => `
    <div>
        <img src="${flag_icon.countryCodeImgUrl}" 
        onclick="${flag_icon.CountryClickHandler}">
    </div>
    <div>NickNames:</div>
    <ul>
                                                        ${flag_icon.nickNames.map(nickName =>`
        <li>${nickName}</li>
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

    get countryCodeImgUrl(){
        return this._countryCodeToImgUrlLookup[this._countryCode]
    }

    static get observedAttributes() { return ["country"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        // name will always be "country" due to observedAttributes
        this._countryCode = newValue;
    }
    connectedCallback() {
        
    }

    get country() {
        return this._countryCode;
    }
    set country(v) {
        this.setAttribute("country", v);
    }

    get CountryClickHandler(){
        return function(e){

        }
    }

}