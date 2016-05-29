# FACETS

## What does FACETS stand for?

1)  Framework Agnostic Custom Element Templates
2)  Faces in Typescript

[The v1 Custom Element specs](https://www.w3.org/TR/custom-elements/#custom-elements-autonomous-example) provides a rudimentary example of how to create a custom element:

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

As indicated in the updateRendering method comment, there is little to no preference in the custom element specs regarding *how* you should design your component as far as rendering and interacting with the user.  While it does have more support for DOM solutions (vs. canvas, or WebGL), beyond that the sky is limited.  Should you make use of dependency-free raw platform api's? JQuery? D3? React/JSX? Elm? WebAssembly?  A template engine with two-way binding?  Some other solution not yet dreamt of? We already have seen a different ergonomic layers arise, include Polymer, X-tags, bosonic and Aurelia (among other features), and SkateJS.  Many more, no doubt, will surface.

While the idea of different teams of developers choosing whatever ergonomic layer (+ other dependencies) they desire, and to be able to have all the components working together in perfect harmony, is a big draw for the web component technology, it comes with a cost.

Of the many "ergonomic layers," one of the main category of such layers will likely be those which rely on a template driven approach, Examples are Polymer and Aurelia.  These template libraries will not necessarily share the same syntax, and will each utilize its own rocket-science in terms of how to achieve the best results.

FACET is a file format meant to accomplish the following goals:

* The Generic requirement:  Be as generic as possible, keeping to syntax that will survive for years to come.  Avoid rendering specifics or playing favorites with any of the template driven frameworks.
* Be flexible enough that as much of the unique feature set of each framework can be tapped into.
* Leverage TypeScript to allow compile-time checks and intellisense on the templates (so no need for IDE plug-ins or IDE favorites.
* 
* 



