/**
 * Created by jorjacob on 02/12/16.
 */
spilldb.component('addgame', {
    templateUrl: '/static/app/scripts/views/addGame.html',
    controller: function ($scope, $routeParams, _, $rootScope, $http, $timeout, authService, eventService) {

        $scope.game = {};



        $scope.main =
            [
                {'key': 'title', 'title': 'Spill-tittel', 'description': ''},

            ]
        ;

        $scope.details =
            [
                {
                    'key': 'console',
                    'title': 'Konsoll',
                    'description': ''
                },
                {
                    'key': 'publisher',
                    'title': 'Utgiver',
                    'description': ''
                },
                {
                    'key': 'front',
                    'title': 'Kode foran',
                    'description': ''
                },
                {
                    'key': 'back',
                    'title': 'Kode bak',
                    'description': ''
                },
                {
                    'key': 'region',
                    'title': 'Region',
                    'description': ''
                },
                {
                    'key': 'condition',
                    'title': 'Spillets tilstand',
                    'description': ''
                }
            ];

        $scope.collections = {
            selectedCollection : undefined,
            collections : []
        };

        $scope.settings = {};

        $scope.toggles = {};



        $scope.viewReset = function (callback) {
            var collectionId = $scope.game.collectionId ? $scope.game.collectionId : undefined;
            $scope.game = {
                title: '',
                collectionId: collectionId,
                userId: $scope.user._id,
                console: '',
                publisher: '',
                front: '',
                back: '',
                region: '',
                condition: '',
                status: '',
                notePublic: '',
                notePrivat: '',
                gameAdded: new Date(),
                images: []
            };
            $scope.toggles = {
                collectionSelector: false,
                search: {},
                showDialog: false,
                showDetails: false,
                currentInput: undefined
            };
            if(callback)
                callback();
        };


        var getCollections = function (callback) {
            authService.signedGet('/api/jwt/me/collections')
                .then(function (data) {
                    $scope.collections.collections = data.data;
                    if ($routeParams.collectionId) {
                        $scope.collections.selectedCollection = _.find($scope.collections.collections, function (collection) {
                            return collection._id == $routeParams.collectionId;
                        });
                        $scope.game.collectionId = $scope.collections.selectedCollection._id;
                    }
                    if(callback) {
                        callback();
                    }
                });
        };

        var setSelectedCollectionFromRouteParams = function () {
            $scope.collections.selectedCollection = _.find($scope.collections.collections, function (collection) {
                return collection._id == $routeParams.collectionId;
            });
        }

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

        $scope.setValueFromSearch = function (key, game) {
            _.each(game, function (field, key) {
                _.each($scope.game, function (newgameTitle, newGameKey) {
                    if(newGameKey == key && newGameKey != '_id' && newGameKey != '__v') {
                        $scope.game[newGameKey] = field;
                    }
                });
            });
            $scope.toggles.search[key] = undefined;
        };

        $scope.wipeSearch = function (key) {
            $scope.toggles.search[key] = undefined;
            $scope.toggles.currentInput = undefined;
        };

        $scope.addGame = function () {
            console.log('legger til spill');
            $http.post("/api/add/game", $scope.game)
                .success(function (dbGame) {
                    $scope.toggles.showDialog = false;
                    $rootScope.$broadcast('add to active collection', dbGame);
                    dbGame.collection = $scope.collections.selectedCollection;
                    eventService.postEvent({
                        type: "new game",
                        referenceId: dbGame._id,
                        referenceObject: dbGame
                    });
                });
        }

        $scope.setSelectedCollection = function (collection) {
            $scope.collections.selectedCollection = collection;
            $scope.game.collectionId = collection._id;
        };

        $scope.$on("update collections", function () {
            getCollections();
        });

        $scope.$on("user logged in", function () {
            $scope.user = $rootScope.user;
            $scope.game.userId = $scope.user._id;
            getCollections();
        });


        $scope.uploadGamePhoto = function (file) {
            $rootScope.$broadcast("loading on", "Laster opp bilde");
            authService.signedPost("/api/jwt/me/upload/photo", {image: file})
                .then(function (data) {

                    $scope.game.images.push(data.data.imageId);
                    $rootScope.$broadcast("loading off");
                });
        };




        $scope.removeImage = function (image) {
            var imageIndex = $scope.game.images.indexOf(image);
            if(imageIndex > -1) {
                $scope.game.images.splice(imageIndex, 1);
            }
        };

        $scope.$on('$routeChangeStart', function(next, current) {
            if($routeParams.collectionId) {
                setSelectedCollectionFromRouteParams();
            }
        });

        $scope.toggleAddGameDialog = function () {
            if(!$scope.toggles.showDialog) {
                $rootScope.$broadcast("loading on");
                $scope.viewReset(function () {
                    getCollections(function () {
                        $rootScope.$broadcast("loading off");
                        $scope.toggles.showDialog = true;
                    });
                });
            } else {
                $scope.toggles.showDialog = false;
                $scope.viewReset();
            }
        };

        if($rootScope.user) {
            $scope.user = $rootScope.user;
            $scope.game.userId = $scope.user._id;
        }

        $(document).on('keydown', function (e) {
            $scope.$apply(function () {
                    if(e.which == 27) {
                        if($scope.toggles.currentInput) {
                            $scope.wipeSearch($scope.toggles.currentInput);
                        }
                        if($scope.toggles.showDialog) {
                            $scope.toggleAddGameDialog();
                        }
                    }
                });
            });
    }});