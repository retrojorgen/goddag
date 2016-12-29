/**
 * Created by jorjacob on 20.10.2016.
 */


spilldb.component('hamburger', {
    templateUrl: '/static/app/scripts/views/hamburger.html',
    controller: function ($scope, $rootScope) {
        $scope.selected = false;
        $scope.loggedIn = false;
        $scope.mobileToggle = false;

        $scope.$on("user logged in", function () {
            $scope.selected = true;
            $scope.loggedIn = true;
        });

        $scope.$on("mobile close user bar", function () {
            $scope.mobileToggle = true;
            console.log("closing");
        });


        $scope.toggleUserBar = function() {
            if($scope.mobileToggle) {
                $scope.mobileToggle = false;
                $rootScope.$broadcast('open user bar mobile');
            } else {
                $rootScope.visible = !$rootScope.visible;
                $scope.selected = !$scope.selected;
            }


            if(!$rootScope.selected) {
                $scope.mobileToggle = false;
            }
        }

    }});