/**
 * Created by jorjacob on 21.10.2016.
 */
spilldb.component('logout', {
    templateUrl: '/static/app/scripts/views/logout.html',
    controller: function ($scope, $http, $location, $window, $rootScope, authService) {
        console.log('logging out');

        authService.logout(function () {
            $window.location = "/";
        });
    }
});
