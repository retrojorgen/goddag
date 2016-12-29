/**
 * Created by jorjacob on 19/12/16.
 */
spilldb.component('front', {
    templateUrl: '/static/app/scripts/views/feed.html',
    controller: function ($scope, $http, $timeout, $location, $rootScope, $log, $location, authService, _) {



        $scope.feed = [];

        $scope.user = undefined;



        $scope.getFeed = function () {
            $http.get("/api/events/get")
                .then(function (data) {
                    $scope.feed = data.data;
                    _.each($scope.feed, function (feedItem) {
                        if(feedItem.created) {
                            feedItem.created = new Date(feedItem.created);
                        }

                    });
                });
        };

        if($rootScope.user) {
            $scope.user = $rootScope.user;
            $scope.getFeed();
        }


        $scope.$on("user logged in", function () {
            $scope.user = $rootScope.user;
            $scope.getFeed();
        });
    }
});
