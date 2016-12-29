spilldb.component('game', {
    templateUrl: '/static/app/scripts/views/game.html',
    controller: function ($scope, $http, $timeout, $routeParams, $filter, _, $window, $rootScope, appConst, authService) {

        $scope.game = {};
        $scope.editGame = {};
        $scope.collection = {};
        $scope.settings = {};
        $scope.user = {};
        $scope.loggedInUser = {};

        $scope.toggles = {
            editable: false,
            editView: false,
            mobileFlag: appConst.mobileThreshold,
            showDetails: false,
            search: {}
        };

        $scope.collections = {
            selectedCollection: {},
            collections : []
        };

        $scope.setSelectedCollection = function (collection) {
            $scope.collections.selectedCollection = collection;
            $scope.editGame.collectionId = collection._id;
        };

        $scope.indexSearch = function (key, phrase) {
            if(key && phrase) {
                if(key == 'title' || key == 'publisher' || key == 'console') {
                    $http.get("/api/search/" + key + "/" + encodeURIComponent(phrase))
                        .then(function (data) {
                            $scope.toggles.search[key]= data.data;
                        });
                }
                if(key == 'region') {
                    $scope.toggles.search[key] = [{'region': 'NTSC'}, {'region': 'PAL'}, {'region': 'PAL-A'}, {'region': 'PAL-B'}, {'region': 'NTSC-J'}];
                }
                if(key == 'condition') {
                    $scope.toggles.search[key] = [{'condition': 'CIB'},{'condition': 'NIB'}, {'condition': 'Cart'}];

                }
            }

        };


        $scope.uploadGamePhoto = function (file) {
            authService.signedPost("/api/jwt/me/upload/photo", {image: file})
                .then(function (data) {
                    $scope.editGame.images.push(data.data.imageId);
                });
        };

        $scope.removeImage = function (image) {
            var imageIndex = $scope.editGame.images.indexOf(image);
            if(imageIndex > -1) {
                $scope.editGame.images.splice(imageIndex, 1);
            }
        };

        $scope.setValueFromSearch = function (key, game) {
            console.log(game);
            _.each(game, function (field, key) {
                _.each($scope.editGame, function (newgameTitle, newGameKey) {
                    if(newGameKey == key && newGameKey != '_id' && newGameKey != '__v') {
                        $scope.editGame[newGameKey] = field;
                    }
                });
            });
            $scope.toggles.search[key] = undefined;
        };

        $scope.updateGame = function () {
            $http.post("/api/update/game", $scope.editGame)
                .success(function (dbGame) {
                    $scope.toggles.editView = false;
                    $scope.game = angular.copy(dbGame);
                    $scope.editGame = angular.copy(dbGame);
                });
        };


        $rootScope.$watch('user', function () {
            if ($rootScope.user) {
                $scope.user = $rootScope.user;
                $scope.toggles.editable = true;
                $scope.toggles.editStatus = true;
            }
        });



        $scope.$on("user logged in", function () {
            $scope.loggedInUser = $rootScope.user;
            checkUser();
            getCollections();

        });

        $scope.toggleEditGameView = function () {
            $scope.toggles.editView = !$scope.toggles.editView;
        };

        var getCollections = function () {
            authService.signedGet('/api/jwt/me/collections')
                .then(function (data) {
                    $scope.collections.collections = data.data;
                    if($routeParams.collectionId) {
                        $scope.collections.selectedCollection = _.find($scope.collections.collections, function (collection) {
                            return collection._id == $routeParams.collectionId;
                        });
                    }
                });

        };

        var checkUser = function () {
            console.log('checking user: ', $scope.loggedInUser, $scope.user);
            if($scope.loggedInUser && $scope.loggedInUser['_id'] && $scope.user && $scope.user['_id'] && $scope.loggedInUser._id == $scope.user._id) {
                $scope.toggles.editable = true;
                return true;

            } else {
                return false;

            }

        }

        $http.get("/api/get/user/game/" + $routeParams.gameId)
            .success(function (data) {
                console.log(data);
                $scope.game = data.game;
                $scope.editGame = angular.copy(data.game);
                $scope.user = data.user;

                $scope.collection = data.collection.collection;
                $scope.settings = data.collection.settings;
                console.log($scope.settings);
                checkUser();
            });

        if($rootScope.user) {
            $scope.user;
            getCollections();
        }

        $(document).on('keydown', function (e) {
            $scope.$apply(function () {
                if(e.which == 27) {
                    if($scope.toggles.editView) {
                        $scope.toggleEditGameView();
                    }
                }
            });
        });
    }
});