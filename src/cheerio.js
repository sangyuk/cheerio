/*
  Module dependencies
*/
var path = require('path'),
    soupselect = require('cheerio-soupselect'),
    _ = require('underscore'),
    parse = require('./parse');
    
var cheerio = (function() {
  var cheerio = function(selector, context, root) {
    return new cheerio.fn.init(selector, context, root);
  };
  
  // A simple way to check for HTML strings or ID strings
  // Prioritize #id over <tag>
  var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
  
  cheerio.fn = cheerio.prototype = {
    cheerio : '0.4.2',
    constructor : cheerio,
    init : function(selector, context, root) {
      // Handle $(''), $(null), and $(undefined)
      if(!selector) return this;
      
      // Handle the root
      if(root) {
        cheerio.extend({ 'root' : root });
        if(typeof context === 'string') 
          selector = context + ' ' + selector;
        context = root;
      }
      
      // Handle strings
      if(typeof selector === 'string') {
        var match = null;
        
        // Handle HTML strings
        if (selector.charAt(0) === "<" 
            && selector.charAt(selector.length - 1) === ">"
            && selector.length >= 3) {
          match = [null, selector, null];
        } else {
          match = quickExpr.exec(selector);
        }
        
        if (match && (match[1] || !context)) {
          if (match[1]) {
            // HTML String
            root = parse(selector);
            return cheerio.merge(this, root.children);
          } else if (context) {
            // Classes, IDs, just defer to soupselect
            var elems = soupselect.select(context, selector);
            this.selector = selector;
            return cheerio.merge(this, elems);
          }
        }
        
        if(!context || context.cheerio) {
          // HANDLE : $(expr, $(...))
          return this.constructor(context || root).find(selector);
        }
        else {
          // HANDLE : $(expr, context)
          if(typeof context === 'string') {
            context = parse(context);
          }

          return this.constructor(context).find(selector);
        }
      }
      
      return cheerio.makeArray(selector, this);
    },
    selector : '',
    sort : [].splice,
    length : 0
  };
  
  cheerio.fn.init.prototype = cheerio.fn;
  
  // Use underscores extend
  cheerio.extend = cheerio.fn.extend = function (obj) {
    return _.extend(this, obj);
  };

  return cheerio;
  
})();

module.exports = cheerio;

/*
  Plug in the API
*/
var api = 'core utils attributes traversing manipulation';
api.split(' ').forEach(function(plugin) {
  require('./api/' + plugin);
});