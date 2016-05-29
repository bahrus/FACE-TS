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

As indicated in the updateRendering method comment, there is very little indication in the custom element specs regarding *how* you should design your component, as far as rendering and interacting with the user.  While it does have more support for DOM solutions (vs. canvas, or WebGL), beyond that the sky is unlimited.  Should you make use of dependency-free raw platform api's? JQuery? D3? React/JSX? Elm? WebAssembly?  A template engine with two-way binding?  Some other solution not yet dreamt of? We already have seen different ergonomic layers arise, including Polymer, X-tags, Bosonic, and SkateJS, which adhere to different paradigms.  Aurealia might be considered another one, though Aurelia's scope is much broader.  Many more, no doubt, will surface.

The idea of different teams of developers choosing whatever ergonomic layer (+ other dependencies) they desire, and to be able to have all the components working together in perfect harmony, is a big draw for the web component technology. But it comes with a cost.  If each component on a page has its own ergonomic library, that's potentially a significant amount of code overhead to just account for those different ergonomic layers.  For many of those components, the developers may be ambivalent which ergonomic layer is the best, and just want to get the job done.  If one application tends to use primarily Polymer, it would be nice if the component could utilize it if is present.  If Aurelia, the same could leverage it.  

It is overly ambitious to try to come up with one grand unified markup / code definition that could account for every approach.  But of the many "ergonomic layers," one popular category will be those which rely on a template driven markup DSL. Examples are Polymer and Aurelia.  These template renderers will not necessarily share the same syntax.   Each may utilize its own rocket-science in terms of how to achieve the best performing results.  Wouldn't it be nice if the same component definition could be used for either?  That's what FACET is designed to help with.

Specifically, FACET is a file format meant to accomplish the following goals:

* The generic requirement:  Be as generic as possible, adhering to syntax that will survive for years to come.  Avoid rendering specifics or playing favorites with any of the template driven frameworks.
* Be flexible enough that as much of the unique feature set of each framework can be tapped into.
* Leverage TypeScript to allow compile-time checks and intellisense on the templates (so no need for IDE plug-ins or IDE favorites).
* 
* 



