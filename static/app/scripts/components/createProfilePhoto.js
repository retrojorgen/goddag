/**
 * Created by jorjacob on 22/12/16.
 */
spilldb.component('createprofilephoto', {
    templateUrl: '/static/app/scripts/views/createProfilePhoto.html',
    controller: function ($scope, $http, $timeout, $location, $rootScope, $log, $location, authService) {


        $scope.user = undefined;

        $scope.uploadProfilePicture = function (file) {
            authService.signedPost("/api/jwt/me/upload/profilephoto", {image: file})
                .then(function (data) {
                    $scope.user.profileImageId = data.data.imageId;
                    $rootScope.user.profileImageId = data.data.imageId;
                    $rootScope.$broadcast("user updated");
                });
        };


        $scope.$on("user logged in", function () {
            $scope.user = $rootScope.user;
        });

        $scope.setAvatar = function (key) {

            authService.signedPost("/api/jwt/me/set/profilephoto/" + key)
                .then(function () {
                    $scope.user.profileImageId = "avatar-" + key;
                    $rootScope.user.profileImageId = "avatar-" + key;
                    $rootScope.$broadcast("user updated");
                });
        };


        if($rootScope.user) {
            $scope.user = $rootScope.user;
        }
        $scope.$on('user logged in from form', function () {

        });
    }
});
