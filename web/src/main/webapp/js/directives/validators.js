'use strict';

managedWifi.directive('validSubnet', function($http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            function isValidSubnet(value) {
                if (_.isUndefined(value) || _.isNull(value)) return true;
                if (!_.isString(value)) return false;
                value = value.replace(/\s/g, '');

                if (value === '') return true;
                if (value.indexOf('/') === -1) return false;

                var split = value.split('/');

                if (split.length !== 2) return false;
                if (split[1].match(/^[0-9]+$/g) === null) return false;
                if (value.indexOf('.') <= 0) return false;

                var ip = split[0].split('.');
                if (ip.length !== 4) return false;

                return _.all(ip, function(p) {
                    return p.match(/^[0-9]+$/g) !== null && parseInt(p) < 256;
                });
            }

            function validate(value) {
                ngModel.$setValidity('subnet', isValidSubnet(value));
            }

            scope.$watch(function() {
                return ngModel.$viewValue;
            }, validate);

            function stripWhitespace(value) {
                if (!value) return value;

                var trimmed = value.replace(/\s/g, '');
                if(trimmed !== value) {
                    ngModel.$setViewValue(trimmed);
                    ngModel.$render();
                }

                return trimmed;
            }

            ngModel.$parsers.push(stripWhitespace);
            stripWhitespace(scope[attrs.ngModel]);
        }
    };
});

managedWifi.directive('validIp', function($http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            function isValidIp(value) {
                if (_.isUndefined(value) || _.isNull(value)) return true;
                if (!_.isString(value)) return false;
                value = value.replace(/\s/g, '');

                if (value === '') return true;
                if (value.indexOf('.') <= 0) return false;

                var ip = value.split('.');
                if (ip.length !== 4) return false;

                return _.all(ip, function(p) {
                    return p.match(/^[0-9]+$/g) !== null && parseInt(p) < 256;
                });
            }

            function validate(value) {
                ngModel.$setValidity('ip', isValidIp(value));
            }

            scope.$watch(function() {
                return ngModel.$viewValue;
            }, validate);

            function stripWhitespace(value) {
                if (!value) return value;

                var trimmed = value.replace(/\s/g, '');
                if(trimmed !== value) {
                    ngModel.$setViewValue(trimmed);
                    ngModel.$render();
                }

                return trimmed;
            }

            ngModel.$parsers.push(stripWhitespace);
            stripWhitespace(scope[attrs.ngModel]);
        }
    };
});

managedWifi.directive('capitalizeFirst', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            var capitalize = function(value) {
                if (!value) return value;

                var capitalized = value.charAt(0).toUpperCase() + value.substring(1);
                if(capitalized !== value) {
                    ngModel.$setViewValue(capitalized);
                    ngModel.$render();
                }
                return capitalized;
            }
            ngModel.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
});

managedWifi.directive('capitalizeState', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            var capitalize = function(value) {
                if (!value) return value;

                var capitalized;

                if (value.length === 2) {
                    capitalized = value.toUpperCase();
                } else {
                    capitalized = value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
                }

                if(capitalized !== value) {
                    ngModel.$setViewValue(capitalized);
                    ngModel.$render();
                }
                return capitalized;
            }
            ngModel.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
});