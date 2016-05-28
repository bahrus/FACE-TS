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

As indicated in the updateRendering method comment, there is little to no opinion in the custom element specs regarding how you should design your component as far as rendering and interacting with the user.  While it does have more support for DOM solutions (vs. canvas, or WebGL), beyond that the sky is limited.  Should you make use of dependency-free raw platform api's, or JQuery, or D3, or React like JSX, or WebAssembly, 


