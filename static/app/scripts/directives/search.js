spilldb.component('search', {
    templateUrl: '/static/app/scripts/views/search.html',
    bindings: {
        game: "=",
        gameRow: "="
    },
    controller: function ($scope, $http, appConst, $timeout) {
        var scope = this;

        $scope.game = scope.game;
        $scope.gameRow = scope.gameRow;



        if($scope.game) {

            if(!$scope.game.changeHandler) {
                $scope.game.changeHandler = {};
            }
            $scope.game.changeHandler[$scope.gameRow] = function (gameRow, word) {
                $scope.gameRow = gameRow;
                if($scope.game[gameRow]) {
                    $http.get("/api/search/" + gameRow + "/" + encodeURIComponent($scope.game[gameRow]))
                        .then(function (data) {
                            $scope.searchResults = data.data;
                            console.log($scope.game.selectedRow, $scope.gameRow);
                            $scope.showSearch = true;
                        });
                }
            };
        }
        $('body').on('')
        $scope.setValue = function (value) {
            $scope.game[$scope.gameRow] = value;
            console.log('setting value');
            $scope.showSearch = false;
        };
    }
});