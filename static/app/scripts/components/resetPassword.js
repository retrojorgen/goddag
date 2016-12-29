/**
 * Created by jorjacob on 07/12/16.
 */
/**
 * Created by jorjacob on 20.10.2016.
 */

spilldb.component('resetpassword', {
    templateUrl: '/static/app/scripts/views/resetPassword.html',
    controller: function ($scope, $http, $timeout, $rootScope, $location) {

        if($rootScope.user) {
            $location.path("/");
        }

        $scope.$on("user logged in", function () {
            $location.path("/");
        });

        $scope.mailVerified = true;

        $scope.toggles = {
            email: "",
            code: "",
            newPassword: "",
            emailVerified: 0,
            codeVerified: 0,
            passwordReset: 0
        };

    }});