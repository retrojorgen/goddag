spilldb.component('userbar', {
	templateUrl: '/static/app/scripts/views/userbar.html',
  	controller: function ($scope, $http, $timeout, $routeParams, $filter, _, $window, $rootScope, $location, authService) {

      $scope.collections = {};
      $scope.user = undefined;

      $scope.path = $location.path();

      $scope.currentCollection = undefined;
      $scope.expanded = false;

      $(document).on('click', function (e) {
          var container = $("#user-bar");

          if (!container.is(e.target) // if the target of the click isn't the container...
              && container.has(e.target).length === 0) // ... nor a descendant of the container
          {
              $timeout(function() {
                  // anything you want can go here and will safely be run on the next digest.
                  $scope.expanded = false;
              })

          }
      });

        $(document).on('keydown', function (e) {
            $scope.$apply(function () {
                if($scope.expanded)  {
                    if(e.which == 27) {
                        $scope.toggleExpanded();
                    }
                }
            });

        });


      $scope.$on("update collections", function () {
        updateCollection();
      });

      $scope.$on("user logged in", function () {
        $scope.user = $rootScope.user;
        updateCollection();
      });

      var updateCollection = function () {
          authService.signedGet("/api/jwt/me/collections")
              .then(function (data) {
                  $scope.collections = {
                      'collections': [],
                      'goals': [],
                      'sales': []
                  };
                  _.each(data.data, function (collection) {
                      if(collection.type)
                          $scope.collections[collection.type].push(collection);
                  });

                  if($routeParams.collectionId)
                      setSelected($routeParams.collectionId);

                  $rootScope.collections = $scope.collections.collections;
              });


      };

      var setSelected = function (selectedId) {
          $scope.currentCollection = _.find($scope.collections.collections, function (collection) {
            return collection._id == selectedId;
          });
      };

      $scope.addCollection = function (type) {
        authService.signedPost("/api/jwt/me/create/collection", {type: type})
        .then(function (collection) {
          $scope.collections[type].push(collection);
        });
      };

      $scope.toggleExpanded = function () {
          $scope.expanded = !$scope.expanded;
      };

      $scope.$on('$routeChangeStart', function(next, current) {
          setSelected(current.pathParams.collectionId ? current.pathParams.collectionId : 0);
      });

      authService.authReady
          .then(function () {
              updateCollection();
          });
  }});