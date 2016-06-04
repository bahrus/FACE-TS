var esprima = require('esprima');
const filePath = './Tests/FlagIcon';
//import flagIcon = require(filePath);
var flagIcon = require('./Tests/FlagIcon');
//var flagIcon = require(filePath);
const templateFnString = flagIcon.FlagIconTemplate.toString();
console.log(templateFnString);
const parsed = esprima.parse(templateFnString);
console.log(esprima.parse);
//# sourceMappingURL=facets2polymer.js.map