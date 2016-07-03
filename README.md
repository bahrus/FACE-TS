# FACETS

## What does FACETS stand for?

1)  **F**ramework **A**gnostic **C**ustom **E**lement **T**emplates
2)  **F**aces in **T**ypescript

[The v1 Custom Element specs](https://www.w3.org/TR/custom-elements/#custom-elements-autonomous-example) 
provides a rudimentary example of how to create a custom element:

```javascript
class FlagIcon extends HTMLElement {
  constructor() {
    super();
    this._countryCode = null;
  }

  static get observedAttributes() { return ["country"]; }

  attributeChangedCallback(name, oldValue, newValue) {
    // name will always be "country" due to observedAttributes
    this._countryCode = newValue;
    this._updateRendering();
  }
  connectedCallback() {
    this._updateRendering();
  }

  get country() {
    return this._countryCode;
  }
  set country(v) {
    this.setAttribute("country", v);
  }

  _updateRendering() {
    // Left as an exercise for the reader. But, you'll probably want to
    // check this.ownerDocument.defaultView to see if we've been
    // inserted into a document with a browsing context, and avoid
    // doing any work if not.
  }
}
```

As indicated in the updateRendering method comment, there is very little indication 
in the custom element specs regarding *how* you should design your component, 
as far as rendering and interacting with the user.  Should you make use of 
dependency-free raw platform api's? JQuery? D3? React/JSX? Elm? WebAssembly?  
A template engine with two-way binding?  Some other solution not yet dreamt of? 
We already have seen different ergonomic layers arise, including Polymer, X-tags, 
Bosonic, and SkateJS, which adhere to different paradigms.  Aurelia might be considered 
another one, though Aurelia's scope is much broader.  Many more, no doubt, will surface.

In addition to libraries that support defining W3C compliant custom elements, there are additional
libraries that support their own proprietary way of defining components.  Examples are angular 2,
aurelia, ember, vue.js, react, and many more.

The idea of different teams of component developers choosing whatever ergonomic layer
 (+ other dependencies) they desire, and to be able to have all the components working 
 together in perfect harmony, is a big draw for the web component technology. But it 
 comes with a cost.  If each component on a page has its own ergonomic library (or its own proprietary
 rich framework behind it), that's 
 potentially a significant amount of code overhead just from those 
 different ergonomic layers.  For many of those components, the developers may be 
 ambivalent which ergonomic layer is the best, and just want to get the job done.  
 If one application tends to use primarily Polymer, it would be nice if the component 
 could utilize it if is present.  If Aurelia, the same component could leverage it. Some web component 
 ergonomic layers, like SkateJS, explicitly suggest they can be a "compilation" target, especially 
 when defining the visual template representation. 

Each of these component ergonomic layer and/or component framework utilizes its own rocket-science 
in terms of how to achieve the best performing results.  Wouldn't it be nice if the same component definition 
could be used for either?  That's what FACETS is designed to help with.

Specifically, FACETS is a file format meant to accomplish the following goals:

* The generic requirement:  Be as generic as possible, adhering to syntax that will 
survive for years to come.  Avoid rendering specifics or playing favorites with any 
of the template driven frameworks.
* Be flexible enough that as much of the unique feature set of each framework can be 
tapped into as possible.
* Leverage TypeScript to allow compile-time checks and intellisense on the templates
 (no need for IDE plug-ins to understand proprietary attributes).

The file format.  Here is an example of a FACETS component definition:
```typescript
const FlagIconTemplate = (flag_icon: FlagIcon) => `
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

class FlagIcon extends HTMLElement {

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
        this._updateRendering();
    }
    connectedCallback() {
        this._updateRendering();
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
```

The FACET processor has a number of libraries it targets. For each library, a keyword
is used to distinguish HTML or JavaScript properties that are specific to that library.
Examples of these keywrds are "polymer" and "aurelia."

There are some attributes in the template string HTML view definition, that we may want 
to enable from a particular library.  These can be "namespaced" by adding 
a prefix for the particular 
library.  If the processor encounters other library attributes that don't 
match the particular library in question, it removes them.  If it finds a match,  it keeps
them.

For example, if we apply a polymer processor to:

```html
<div polymer-some-property = "hello" aurelia-some-other-property="goodbye"></div>
```

The polymer processor would output:

```html
<div some-property = "hello"></div>
```

And likewise the aurelia processor would output:

```html
<div some-other-property="goodbye"></div>
```

Likewise with properties / methods of a class.  If a method called polymer_doSomething 
and another method aurelia_doSomething is defined, both the polymer and aurelia target
transpiled will have one implementation of a method called doSomething.  The transpiler
will also erase any plaeholder method called doSomething, which would be there in order for
references to be made, ina 



