spilldb.directive("contenteditable", function($rootScope) {
  return {
    restrict: "A",
    require: "ngModel",
    scope: {
      game: "=",
      gameRow: "=",
      noBreak: "="
    },
    link: function(scope, element, attrs, ngModel) {
      function read() {
        ngModel.$setViewValue(element.html());
      };

      scope.typingTimer = undefined;
      scope.doneTypingInterval = 500;

      element.bind('focus', function() {
        scope.$apply(function() {
          if(scope.game) {
            scope.game.selectedRow = scope.gameRow;
            scope.game.canSearch = true;
          }
        });
      });

      element.bind('blur', function() {
        scope.$apply(function() {
          if(scope.game) {
            scope.game.canSearch = false;
          }
        });
      });

      element.bind('keyup', function() {
        scope.$apply(function() {
          clearTimeout(scope.typingTimer);
          scope.typingTimer = setTimeout(scope.doneTyping, scope.doneTypingInterval);
        });
      });

      element.bind('paste', function() {
        scope.$apply(function() {
        });
      });

      scope.doneTyping = function () {
        scope.$apply(function () {
          console.log('done typing');
          scope.canSearch = true;
        });
      };

      ngModel.$render = function() {
        if(ngModel.$viewValue && !scope.noBreak) {
          ngModel.$viewValue = ngModel.$viewValue.replace(/<(?!br\s*\/?)[^>]+>/g, '');
        }

        if(ngModel.$viewValue && scope.noBreak) {
          ngModel.$viewValue = ngModel.$viewValue.replace(/<\/?[^>]+(>|$)/g, "");
        }
        if(ngModel.$viewValue == "<br>") {
          ngModel.$viewValue = "";
        }
        element.html(ngModel.$viewValue || "");

      };

      element.bind("blur keyup change focus", function() {
        scope.$apply(read);
        if(scope.game && scope.game.changeHandler)
          scope.game.changeHandler[scope.gameRow](scope.gameRow, scope.game[scope.gameRow]);
      });
    }
  };
});