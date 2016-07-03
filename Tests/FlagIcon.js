///<reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts"/>
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require('reflect-metadata/Reflect');
var rt = require('../@rt');
const country_change_handler = 'country_change_handler';
exports.FlagIconTemplate = (flag_icon) => `
    <div>
        <img src="${flag_icon.countryCodeImgUrl}" 
        onclick="${flag_icon.CountryClickHandler}">
    </div>
    <div>NickNames:</div>
    <ul>
                                                        ${flag_icon.nickNames.map(nickName => `
        <li>NickName: ${nickName}</li>
                                                        `).join('')}                                                                        
    </ul>
`;
class HTMLElement {
    setAttribute(name, val) { }
}
class FlagIcon extends HTMLElement {
    constructor() {
        super();
        //@Reflect.metadata('polymer-notify', true)
        this.country = null;
        this._countryCode = null;
    }
    get countryCodeImgUrl() {
        return this._countryCodeToImgUrlLookup[this._countryCode];
    }
    static get observedAttributes() { return ["country"]; }
    attributeChangedCallback(name, oldValue, newValue) {
        // name will always be "country" due to observedAttributes
        this._countryCode = newValue;
    }
    connectedCallback() {
    }
    // get country() : string{
    //     return this._countryCode;
    // }
    // set country(v: string) {
    //     this.setAttribute("country", v);
    // }
    [country_change_handler](newVal, oldVal) {
    }
    get CountryClickHandler() {
        return function (e) {
        };
    }
}
__decorate([
    rt.toProp({
        polymer_observer: country_change_handler,
    }), 
    __metadata('design:type', String)
], FlagIcon.prototype, "country", void 0);
exports.FlagIcon = FlagIcon;
//# sourceMappingURL=FlagIcon.js.map