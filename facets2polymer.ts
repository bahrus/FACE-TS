declare var require;
const filePath = './Tests/FlagIcon';


//import flagIcon = require(filePath);
import flagIcon = require('./Tests/FlagIcon');
//var flagIcon = require(filePath);
const templateFnString = flagIcon.FlagIconTemplate.toString();
console.log(templateFnString);

