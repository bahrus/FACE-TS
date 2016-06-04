declare var require;
var esprima = require('esprima');
const filePath = './Tests/FlagIcon';


//import flagIcon = require(filePath);
import flagIcon = require('./Tests/FlagIcon');

//var flagIcon = require(filePath);
const templateFnString = flagIcon.FlagIconTemplate.toString();
console.log(templateFnString);
const parsed = esprima.parse(templateFnString);
console.log(esprima.parse);

