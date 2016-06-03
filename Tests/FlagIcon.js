"use strict";
exports.FlagIconTemplate = (flag_icon) => `
    <div>
        <img src="${flag_icon.countryCodeImgUrl}" 
        onclick="${flag_icon.CountryClickHandler}">
    </div>
    <div>NickNames:</div>
    <ul>
                                                        ${flag_icon.nickNames.map(nickName => `
        <li>${nickName}</li>
                                                        `).join('')}                                                                        
    </ul>
`;
class HTMLElement {
    setAttribute(name, val) { }
}
class FlagIcon extends HTMLElement {
    constructor() {
        super();
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
    get country() {
        return this._countryCode;
    }
    set country(v) {
        this.setAttribute("country", v);
    }
    get CountryClickHandler() {
        return function (e) {
        };
    }
}
exports.FlagIcon = FlagIcon;
//# sourceMappingURL=FlagIcon.js.map