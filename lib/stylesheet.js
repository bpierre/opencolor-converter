'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stylsheetImporter = undefined;

var _gonzalesPe = require('gonzales-pe');

var _gonzalesPe2 = _interopRequireDefault(_gonzalesPe);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _opencolor = require('opencolor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stylsheetImporter = exports.stylsheetImporter = function stylsheetImporter(input, options, syntax) {
  return new Promise(function (resolve, reject) {
    var ocoPalette = new _opencolor.Entry();

    var parseTree = _gonzalesPe2.default.parse(input, { syntax: syntax });

    var selectorPropertyGlue = ' - ';
    if (options.groupBySelector) {
      selectorPropertyGlue = '.';
    }

    function addEntryWithSelectors(selectors, name, entry) {
      if (!options.useOnlyTheFirstSelector) {
        selectors.forEach(function (group) {
          var path = group.join(' ') + selectorPropertyGlue + name;
          ocoPalette.set(path, entry.clone());
        });
      } else {
        var path = selectors[0].join(' ') + selectorPropertyGlue + name;
        ocoPalette.set(path, entry);
      }
    }

    // console.log(parseTree.toJson())
    // less variables definitions one root level
    parseTree.traverseByTypes(['atrule'], function (node, index, parent) {
      if (node.contains('color')) {
        var variableName = node.first('atkeyword').first('ident').content;
        var colorValue = (0, _color2.default)('#' + node.first('color').content);
        var colorEntry = new _opencolor.Entry(variableName, [_opencolor.ColorValue.fromColorValue(colorValue.hexString())]);
        ocoPalette.set(variableName, colorEntry);
      }
    });

    // scss variables definitions one root level
    parseTree.traverseByTypes(['declaration'], function (node, index, parent) {
      if (node.contains('property') && node.first('property').contains('variable')) {
        var variableName = node.first('property').first('variable').first('ident').content;

        if (node.contains('value') && node.first('value').contains('color')) {
          var colorValue = (0, _color2.default)('#' + node.first('value').first('color').content);
          var colorEntry = new _opencolor.Entry(variableName, [_opencolor.ColorValue.fromColorValue(colorValue.hexString())]);
          ocoPalette.set(variableName, colorEntry);
        } else if (node.contains('value') && node.first('value').contains('variable')) {
          var path = node.first('value').first('variable').first('ident').content;
          var refrenceEntry = new _opencolor.Reference(variableName, path);
          ocoPalette.set(variableName, refrenceEntry);
        }
      }
    });
    /*
    // less variable assignments one root level
    parseTree.traverseByTypes(['declaration'], (node, index, parent) => {
      if (node.contains('value') && node.first('value').contains('variable')) {
        var variableName = node.first('property').first('ident').content
        var path = node.first('value').first('variable').first('ident').content
        var refrenceEntry = new Reference(variableName, path)
        ocoPalette.set(variableName, refrenceEntry)
      }
    })
    */
    parseTree.traverseByTypes(['ruleset'], function (node, index, parent) {
      var selectors = [];
      // class, id, typeSelector
      node.traverseByTypes(['selector'], function (node, index, parent) {
        var selectorParts = [];
        node.traverseByTypes(options.selectors, function (node, index, parent) {
          node.traverseByTypes(['ident'], function (node, index, parent) {
            selectorParts.push(node.content);
          });
        });
        selectors.push(selectorParts);
        selectorParts = [];
      });
      node.traverseByTypes(['declaration'], function (node, index, parent) {
        var cssProperty = '';
        node.traverseByTypes(['property'], function (node, index, parent) {
          node.traverseByTypes(['ident'], function (node, index, parent) {
            cssProperty = node.content;
          });
        });
        node.traverseByTypes(['value'], function (node, index, parent) {
          node.traverseByTypes(['color'], function (node, index, parent) {
            var colorValue = (0, _color2.default)('#' + node.content);
            var colorEntry = new _opencolor.Entry(cssProperty, [_opencolor.ColorValue.fromColorValue(colorValue.hexString())]);
            addEntryWithSelectors(selectors, cssProperty, colorEntry);
          });
          node.traverseByTypes(['variable'], function (node, index, parent) {
            var refrenceEntry = new _opencolor.Reference(cssProperty, node.first('ident').content);
            addEntryWithSelectors(selectors, cssProperty, refrenceEntry);
          });
        });
      });
      selectors = [];
    });

    resolve(ocoPalette);
  });
};