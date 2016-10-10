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
dependency-free raw platform api's? JQuery? D3? React/JSX? Elm? WebAssembly?  A template engine with two-way binding?  Some other solution not yet dreamt of? 

We already have seen different ergonomic layers arise, whose purpose falls into a number of categories:

1)  Help reduce boilerplate code -- for example, binding initial attribute values into object properties.
2)  Compile (during build time or runtime) intuitive UI definitions into "rocket-science" code that is optimized for rapid updates.
3)  Provide support and a testbed for future web standards.  For example, Polymer supports theming a custom element via [css mixins] https://www.chromestatus.com/features/5753701012602880.  But mixins are still very much in flux as far as standardization.

Current ergonomic layers for buildiing web components include Polymer, X-tags, Bosonic, and SkateJS, which adhere to quite different paradigms.  Aurelia might be considered another one, though Aurelia's scope is much broader.  Many more, no doubt, will surface.  The specifications each of these ergonomic layers provide for definining a custom element tends to deviate quite a bit from core definition for custom elements mentioned above.  In some cases, such as SkateJS, it is explicitly suggested that the definitions they provide could be [compile targets] https://github.com/skatejs/skatejs#incremental-dom, from a less tightly coupled abstraction layer.

In addition to libraries that support defining W3C compliant custom elements, there are additional
libraries that support their own proprietary way of defining components, which continue to see increasing popularity.  Users of these libraries may only want to leverage reusable components when the needs warrant, but for the most part are happy leveraging their own way of doing things, not bound by the slow moving standards process. Examples are angular 2,
aurelia, ember, vue.js, react, and many more.

Sticking to the realm of custom element ergonomic layers, the idea of different teams of component developers choosing whatever ergonomic layer (+ other dependencies) they desire, and to be able to have all the components working together in perfect harmony, is a big draw for the web component technology. But it comes with a cost.  If each component on a page has its own ergonomic library (or its own proprietary rich framework behind it), that's potentially a significant amount of code overhead just from those different ergonomic layers.  For many of those components, the developers may be ambivalent which ergonomic layer is the best, and just want to get the job done.  
 
Wouldn't it be nice to develop components that can leverage whatever framework preferences the "consumer" prefers?

If one application tends to use primarily Polymer, the component could utilize it if is present.  If Aurelia, the same component could leverage it. Some web component ergonomic layers, like SkateJS, explicitly suggest they can be a "compilation" target, especially when defining the visual template representation.

This is the goal of FACETS.

## Goals

Specifically, FACETS is a file format meant to accomplish the following:

* **The generic requirement**:  Be as generic as possible, adhering to syntax that will 
survive for years to come.  Avoid fancy rendering specifics or playing favorites with any 
of the template driven frameworks.  "Spare me the details," in other words.
*  **Minimally functional** The file format can optionally serve as a minimally functioning custom element definition on its own right, without the benefit of any helping ergonomic layer, view optimizer, or framework. Essentially, the component definition can be "progressively enhanced" by leveraging said helpers. 
* Be **as flexible as possible**, allowing helpful hooks that can be integrated with as many frameworks as possible.
tapped into as possible.
* Leverage TypeScript to allow **compile-time checks and intellisense on the templates**
 (no need for IDE plug-ins to understand proprietary attributes).
 *  Add **zero runtime dependencies** to any existing helper libraries, after running through the transformation.

The file format.  Here is an example of a proposed FACETS component definition, for a base component which doesn't extend any other component:

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


    private updateRendering(){
        this.innerHTML = FlagIconTemplate(this);
    }

    

}
```

## FACETS Core

The core of the FACET processor is the "bt" library, which stands for build time.  It has two key methods:

* bt.generateTemplateAbstractSyntaxTree, which takes the template string generator definition, such as FlagIconTemplate above, and turns it into an XSLT-like representation of the template.  From this common definition, one can create framework / library specific implementations.  The process imposes some restrictions on what kind of expressions can be found in the template generator, to ensure that only declarative defitions are allowed.
* bt.reflectClassPrototype.  It takes a class prototype definition, and generates a generic object that represents the class.  The structure of this object is modelled loosely by the structure of the .net reflection api.  The reflection object includes all the information needed to transform the original class into some other class, including the method body implementation.  The reflector is ES decorator aware, and provides some recognized settings applicable to different helper libraries.  An example would be:

```typescript
    @bt.toProp({
        polymer_observer: country_change_handler,
        defaultValue: 'us',
        polymer_readOnly: true,
    })
    public country: string = 'us';
```

One can then develop "translators" that take these two abstract definitions -- a) the class associated with the component,and b)  the component's markup template -- and generates a native representation in a specific framework /library.  

For example, facets2polymer1.ts does this for Polymer1, facets2polymer2.ts does this for Polymer 2 [TODO], facets2vue2.ts does this for Vue 2 [TODO]. And the list can continue to grow to support the newest component helper library of the hour. 

Sharing the **same** FACET definition file, which can then be transformed into different framework definitions, using  different translators, is certainly ideal -- code once, deploy everwhere.  This is most feasible between different versions of the same library, like Polymer 1 and Polymer 2, or even between different libraries that share common paradigms, like Polymer vs vue.js.  But it may not always be feasible, if the basic building blocks / modeling of the component is very different in nature.  For example, using the using the same FACET file definition for a SkateJS target vs a Vue, may involve too much adapter code for each target.  Meaning in some cases, parallel definitions would need to be maintained.

The FACET processor has a number of libraries it targets. For each library, a keyword
is used to distinguish HTML or JavaScript properties that are specific to that library.
Examples of these keywrds are "polymer" and "aurelia."

To maximizing the number of frameworks a single FACET file can target, some approaches the translator can adopt are listed below.

There are some attributes in the template string HTML view definition, that we may want to enable from a particular library.  These can be "namespaced" by adding a prefix for the particular library.  If the processor encounters other library attributes that don't match the particular library in question, it removes them.  If it finds a match,  it keeps
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

Likewise with properties / methods of a class.  If a method called polymer_doSomething and another method aurelia_doSomething is defined, both the polymer and aurelia target transpiled will have one implementation of a method called doSomething.  The transpiler will also erase any plaeholder method called doSomething, which would be there in order for generic, implementationless references.

For example, suppose some code needs to find an element defined within the component's template.  The api needed to accomplish this differs from one library to the next.

<table>
<thead>
<tr><th>Library</th><th>Find element inside component by ID</th><th>Find element inside component by css selector</th></tr>
</thead>
<tbody>
<tr>
<td>Polymer 1</td><td>this.$.myId</td><td>this.$$('myCssSelector')</td>
</tr>
<tr>
<td>Vue</td><td>this.$el.querySelector('#myId')</td><td>this.$el.querySelector('myCssSelector')</td>
</tr>
<tr>
<td>SkateJS</td><td><a href=https://github.com/skatejs/skatejs#ref" target="_blank">Use ref, maybe?</a></td><td>?</td>
</tr>
<tr>
<td>Angular</td><td colspan="2"><a href="https://angular.io/docs/ts/latest/api/core/index/ElementRef-class.html" target="_blank">Heavily discouraged, but use constructor injection.</a>  </td>
</tr>
</tbody>
</table>



