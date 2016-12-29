/**
 * Created by jorjacob on 17/12/16.
 */
spilldb.component('loading', {
    templateUrl: '/static/app/scripts/views/loading.html',
    controller: function ($scope, $http, $timeout, $routeParams, $filter, _, $window, $rootScope, $location, authService) {
        console.log('hest');
        $scope.toggles = {
            loading: false,
            loadingText : ""
        }

        $scope.$on("loading on", function (e, args) {
            if(args) {
                $scope.toggles.loadingText = args;
            }
            $scope.toggles.loading = true;
            console.log($scope.toggles.loadingText);
        });

        $scope.$on("loading off", function () {
            $scope.toggles.loading = false;
        });
    }});