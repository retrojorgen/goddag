spilldb.component('auth', {
    templateUrl: '/static/app/scripts/views/auth.html',
    controller: function ($scope, $http, $timeout, $location, $rootScope, $log, authService) {
        console.log('hei:', authService);
        $scope.loggedIn = false;
        $scope.user = undefined;
        $scope.loginFormTab = 'login';
        $scope.showLoginForm = false;
        $scope.loginError = false;
        $scope.typingTimeouts = {};
        $rootScope.user = undefined;
        $scope.toggles = {
            showLogin: false
        };

        $scope.ready = false;

        $scope.expanded = false;

        $scope.toggleExpanded = function () {
            $scope.expanded = !$scope.expanded;
        };

        $scope.toggleLoginForm = function () {
            console.log('toggling');
            $scope.toggles.showLogin = !$scope.toggles.showLogin;
        };


        $scope.logOut = function () {
            $http.get('/api/logout')
                .success(function (data) {
                    $scope.loggedIn = false;
                    $scope.user = undefined;
                    $rootScope.visible = false;
                });
        };


        $scope.$on('$routeChangeStart', function(next, current) {
            $log.log($location.path());
        });

        console.log('auth:', authService);
        authService.authReady
            .then(function () {
                console.log('hey');
                $scope.loggedIn = true;
                $scope.user = authService.getLoggedInUser();
                $rootScope.user = authService.getLoggedInUser();
                $rootScope.$broadcast("user logged in");
                $rootScope.visible = true;
                console.log('user logged in', $rootScope.user);
            }, function () {
                console.log('user not logged in');
                $scope.loggedIn = false;
                $scope.user = undefined;
                $rootScope.user = undefined;
                $rootScope.visible = false;
                $scope.ready = true;
            });

        $scope.$on("user updated", function () {
            $scope.user == $rootScope.user;
        })
        $scope.$on('user logged in from form', function () {
            $scope.loggedIn = true;
            $scope.user = authService.getLoggedInUser();
            $rootScope.user = authService.getLoggedInUser();
            $rootScope.visible = true;
        });



    }
});
