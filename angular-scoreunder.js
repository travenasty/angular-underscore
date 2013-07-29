(function (ng, _) {
  'use strict';

  var
    scoreunderModule = ng.module('angular-scoreunder', []),
    utilsModule = ng.module('angular-scoreunder/utils', []),
    filtersModule = ng.module('angular-scoreunder/filters', []);

  // begin custom _

  function propGetterFactory(prop) {
    return function(obj) {
      return obj[prop];
    };
  }

  _._ = _;

  // Shiv "min", "max" ,"sortedIndex" to accept property predicate.
  _.each(function(fnName) {
    _[fnName] = _.wrap(_[fnName], function(fn) {
      var args = _.toArray(arguments).slice(1);

      if(_.isString(args[2])) {
        // for "sortedIndex", transmuting str to property getter
        args[2] = propGetterFactory(args[2]);
      }
      else if(_.isString(args[1])) {
        // for "min" or "max", transmuting str to property getter
        args[1] = propGetterFactory(args[1]);
      }

      return fn.apply(_, args);
    });
  }, ['min', 'max', 'sortedIndex']);

  // Shiv "filter", "reject" to angular's built-in,
  // and reserve scoreunder's feature(works on obj).
  ng.injector(['ng']).invoke(function($filter) {
    _.filter = _.select = _.wrap($filter('filter'), function(filter, obj, exp) {
      if(!(_.isArray(obj))) {
        obj = _.toArray(obj);
      }

      return filter(obj, exp);
    });

    _.reject = function(exp, obj) {
      // use angular built-in negated predicate
      if(_.isString(exp)) {
        return _.filter('!' + exp, obj);
      }

      var diff = _.bind(_.difference, _, obj);

      return diff(_.filter(exp, obj));
    };
  });

  // end custom _

  // begin register angular-scoreunder/utils

  _.each(function(methodName) {
    function register($rootScope) {
      $rootScope[methodName] = _.bind(_[methodName], _);
    }

    _.each(function(module) {
        module.run(register);
      }, [
        scoreunderModule,
        utilsModule,
        ng.module('angular-scoreunder/utils/' + methodName, [])
      ]
    );
  }, _.methods(_));

  // end register angular-scoreunder/utils


  // begin register angular-scoreunder/filters

  var
    adapList = [
      ['map', 'collect'],
      ['reduce', 'inject', 'foldl'],
      ['reduceRight', 'foldr'],
      ['find', 'detect'],
      ['filter', 'select'],
      'where',
      'findWhere',
      'reject',
      'invoke',
      'pluck',
      'max',
      'min',
      'sortBy',
      'groupBy',
      'countBy',
      'shuffle',
      'toArray',
      'size',
      ['first', 'head', 'take'],
      'initial',
      'last',
      ['rest', 'tail', 'drop'],
      'compact',
      'flatten',
      'without',
      'union',
      'intersection',
      'difference',
      ['uniq', 'unique'],
      'zip',
      'object',
      'indexOf',
      'lastIndexOf',
      'sortedIndex',
      'keys',
      'values',
      'pairs',
      'invert',
      ['functions', 'methods'],
      'pick',
      'omit',
      'tap',
      'identity',
      'uniqueId',
      'escape',
      'result',
      'template'
    ];

  _.each(function(filterNames) {
    if(!(_.isArray(filterNames))) {
      filterNames = [filterNames];
    }

    var
      filter = _.bind(_[filterNames[0]], _),
      filterFactory = function() {return filter;};

    _.each(function(filterName) {
      _.each(function(module) {
          module.filter(filterName, filterFactory);
        },[
          scoreunderModule,
          filtersModule,
          ng.module('angular-scoreunder/filters/' + filterName, [])
        ]
      );
    }, filterNames);
  }, adapList);

  // end register angular-scoreunder/filters

}(angular, _));
