/*
 * test.amd.js - Unit Tests of Asynchronous Module Definition define()
 *
 * Author: Eric Bréchemier <legalbox@eric.brechemier.name>
 * Copyright: Legal-Box (c) 2010-2011, All Rights Reserved
 * License:   BSD License - http://creativecommons.org/licenses/BSD/
 * Version:   2011-07-06
 *
 * Based on Test Runner from bezen.org JavaScript library
 * CC-BY: Eric Bréchemier - http://bezen.org/javascript/
 */

/*jslint white:false, onevar:false, plusplus:false */
/*global define, window */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.array",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "amd/define"
  ],
  function(
    assert,
    array,
    object,
    testrunner,
    amdDefine
  ) {

    // Define alias
    var copy = array.copy;

    function testDefine(){
      assert.isTrue( object.exists(amdDefine),
                                   "amd/define was not found in dependencies");
      var ut = amdDefine;

      var capturedArgs,
          returnValue;
      function factory(){
        capturedArgs = copy(arguments);
        return returnValue;
      }

      var module1 = {},
          module2 = function(){},
          module3 = 'abc',
          module4 = null,
          module5 = false,
          module6 = undefined,
          module7 = '';

      // define(id,dependencies,factory)
      capturedArgs = null;
      returnValue = module1;
      ut('module1',[],factory);
      assert.arrayEquals(capturedArgs, [],
                             "factory expected to be called with no argument "+
                                                "for id + empty dependencies");

      capturedArgs = null;
      returnValue = module2;
      ut('module2',['module1'],factory);
      assert.arrayEquals(capturedArgs, [module1],
                                        "module1 expected in args of module2");

      capturedArgs = null;
      returnValue = module3;
      ut('module3',['module2','module1'],factory);
      assert.arrayEquals(capturedArgs, [module2,module1],
                           "module2 and module1 expected in args of module3");

      capturedArgs = null;
      returnValue = module4;
      ut('module4',['module3'],factory);
      assert.arrayEquals(capturedArgs, [module3],
                                      "module3 expected in args of module4");

      capturedArgs = null;
      returnValue = module5;
      ut('module5',[],factory);
      assert.arrayEquals(capturedArgs,[],
                               "no argument expected for empty dependencies");

      capturedArgs = null;
      returnValue = module7;
      ut('module6',[],factory);

      capturedArgs = null;
      returnValue = module6;
      ut('module7',['module','require','exports'],factory);
      assert.equals( capturedArgs.length, 3,
                            "3 arguments expected: module,require,exports");
      var module = capturedArgs[0]
          require = capturedArgs[1],
          exports = capturedArgs[2];
      assert.equals( typeof module, 'object',    "object expected for module");
      assert.equals( typeof require, 'function',
                                              "function expected for require");
      assert.equals( typeof exports, 'object',  "object expected for exports");

      assert.equals( module.id, 'module7',
                                    "module.id must match given id 'module6'");

      assert.objectEquals(
        [
          require('module1'), require('module2'), require('module3'),
          require('module4'), require('module5'), require('module6')
        ],
        [
          module1, module2, module3,
          {}, {}, {}
        ],                 "require arg expected to return 6 cached modules");

      exports.testModule7 = 'ok';

      // define(dependencies,factory)
      capturedArgs = null;
      var dependencies = [
        'module1','module2','module3',          // truthy
        'module4','module5','module6',          // falsy
        'module7'                               // falsy + exports
      ];
      ut(dependencies,factory);
      assert.objectEquals(
        capturedArgs,
        [
          module1, module2, module3,          // truthy
          {}, {}, {},                         // falsy: defaults to exports
          {testModule7:'ok'}                  // falsy + exports
        ],   "7 dependencies expected, with empty objects for falsy exports");

      dependencies = ["other"];
      try {
        ut(dependencies,factory);
        assert.fail("Error expected when a dependency is missing");
      } catch(e1) {
        // expected error
      }

      // define(factory)
      capturedArgs = [];
      ut(factory);
      assert.equals( capturedArgs.length, 3,
                                            "3 arguments expected by default");
      require = capturedArgs[0],
      exports = capturedArgs[1],
      module = capturedArgs[2];
      assert.equals( typeof require, 'function',  "require function expected");
      assert.equals( typeof exports, 'object',      "exports object expected");
      assert.equals( typeof module, 'object',        "module object expected");

      assert.isTrue( module.hasOwnProperty('id'),
                                             "id property expected in module");
      assert.equals( module.id, undefined,      "module.id must be undefined");

      assert.objectEquals(
        [
          require('module1'), require('module2'), require('module3'),
          require('module4'), require('module5'), require('module6'),
          require('module7')
        ],
        [
          module1, module2, module3,
          {}, {}, {},
          {testModule7: 'ok'}
        ],                "require arg expected to return 7 cached modules");
    }

    var tests = {
      testDefine: testDefine
    };

    testrunner.define(tests, "amd/define");
    return tests;
  }
);
