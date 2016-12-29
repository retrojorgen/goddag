/**
 * Created by jorjacob on 25/12/16.
 */
/**
 * Created by jorjacob on 17/12/16.
 */
spilldb.component('flush', {
    templateUrl: '/static/app/scripts/views/flush.html',
    controller: function ($scope,$http, $rootScope) {
        console.log('hest');

        $scope.responses = {
            games: [],
            consoles: [],
            publishers: [],
            settings: []
        }

        $rootScope.$broadcast("loading on", 'Gjør oppdateringer');

        $http.get("/api/add/games")
            .then(function (response) {
                $scope.responses.games = response.data.ops;
                $http.get("/api/add/consoles")
                    .then(function (response) {
                        $scope.responses.consoles = response.data;
                        $http.get("/api/add/publishers")
                            .then(function (response) {

                                $scope.responses.publishers = response.data;
                                console.log(response.data);
                                $http.get("/api/add/settings")
                                    .then(function (response) {
                                        $scope.responses.settings = response.data;
                                        $rootScope.$broadcast("loading off");
                                    });
                            });
                    });
            });




    }
});
