/**
 * Created by jorjacob on 17/12/16.
 */
spilldb.component('createcollection', {
    templateUrl: '/static/app/scripts/views/createCollection.html',
    controller: function ($scope, $http, $timeout, $location, $rootScope, $log, $location, authService) {

        $scope.toggles = {
            gameTitle: "",
            newUser : false
        };

        $scope.user = undefined;

        if($location.path() == "/wizard/collection") {
            $scope.toggles.newUser = true;
        };

        $scope.createCollection = function () {
            authService.signedPost("/api/jwt/me/create/collection", {
                "title": $scope.toggles.gameTitle,
                "type": "collections"
            })
                .then(function (data) {
                    $location.path("/user/" + $scope.user.slug + "/c/" + data.data._id);
                    $rootScope.$broadcast('update collections');
                });
        };


        $scope.$on("user logged in", function () {
            $scope.user = $rootScope.user;
        });


        if($rootScope.user) {
            $scope.user = $rootScope.user;
        }
        $scope.$on('user logged in from form', function () {

        });
    }
});
