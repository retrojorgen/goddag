spilldb.component('userlist', {
    templateUrl: '/static/app/scripts/views/userlist.html',
    controller: function ($scope, $http, $timeout, $routeParams, $filter, _, $window, $rootScope, appConst, dialogService, authService) {



        var collectionId = $routeParams.collectionId;

        $scope.collection = {};

        $scope.selectedGame = {};

        $scope.collections = [];

        $scope.toggles = {
            contextMenu: 0,
            editGames: [],
            sortOrder: "",
            filterPhrase : "",
            editTab: false,
            editable: false,
            mobileFlag: appConst.mobileThreshold,
            editStatus: false,
            editFlags : {
                collection: {
                    title: false,
                    description: false
                }
            },
            listLimit: 40,
            search: {
                game: {},
                key: "",
                visible: false,
                searchResults : []
            },
            bulkSettings: {
                action: "",
                collectionId: ""
            }
        };

        $scope.increaseListLimit = function () {
          $scope.toggles.listLimit += 40;
        };



        $scope.imageInfo = {
            image: {},
            imageFileName: {}
        };

        $scope.editCollection = {

        };

        $scope.uploadCollectionPhoto = function (file) {
            $rootScope.$broadcast("loading on", "Laster opp samling-bilde");
            authService.signedPost("/api/jwt/me/upload/collectionphoto", {image: file, collectionId: $scope.collection.collection._id})
                .then(function (data) {

                    $scope.collection.collection.collectionImageId = data.data.imageId;
                    $scope.editCollection.collectionImageId = data.data.imageId;
                    $rootScope.$broadcast("loading off");
                });
        };

        $scope.uploadProfilePicture= function (file) {


        };

        $scope.toggleEditStatus = function () {
            $scope.toggles.editStatus = !$scope.toggles.editStatus;
        };

        $http.post("/api/get/user/collection", {collectionId: collectionId})
            .success(function (collection) {
                $scope.collection = collection;
                $scope.editCollection = angular.copy(collection.collection);

                if(!$scope.collection.games.length) {
                    dialogService.openDialog("Velkommen til din første samling! Trykk på knappen nede til høyre for å legge til ditt første spill.", {okayOnly: true});
                }


                delete $scope.collection.settings._id;
                delete $scope.collection.settings.type;



            });

        $rootScope.$watch('user', function () {

            if($rootScope.user && $scope.collection.collection && $rootScope.user._id == $scope.collection.collection.userId)
            {
                $scope.toggles.editable = true;
                //$scope.toggles.editStatus = true;
            }
        });

        $scope.$watch('collection', function () {
            if($rootScope.user && $scope.collection.collection && $rootScope.user._id == $scope.collection.collection.userId)
            {
                $scope.toggles.editable = true;
                //$scope.toggles.editStatus = true;
            }
        });


        $($window).on('paste', function (e) {
            //e.preventDefault();
            //var data = e.originalEvent.clipboardData.getData('text/plain');
        });



        $scope.toggleSelectedGame = function (game, toggle) {
            if(toggle)
                $scope.selectedGame = game;
            else
                $scope.selectedGame = {};
        };

        $scope.removeGame = function (game) {
            var indexPosition = $scope.collection.games.indexOf(game);
            $scope.collection.games.splice(indexPosition, 1);
            $http.post("/api/remove/game", {gameId: game._id}, function () {

            });
        };

        $scope.updateGame = function (game) {
            if(game && game._id) {
                $http.post("/api/update/game", game);
            }
        };

        $scope.sortGamesBy = function (field) {
            var currentSort = $scope.toggles.sortOrder;

            if(!currentSort)
                currentSort.replace("-", "");

            if(currentSort == field) {
                if($scope.toggles.sortOrder.charAt(0) == "-") {
                    $scope.toggles.sortOrder = currentSort;
                } else {
                    $scope.toggles.sortOrder = "-" + currentSort;
                }
            } else {
                $scope.toggles.sortOrder = field;
            }
        };

        $scope.gameKeyHandler = function ($event,game, field) {
            if($event.keyCode == 46) {
                game[field] = "";
                $scope.updateGame(game, "", field);
            }
        };

        $scope.toggleGameToggle = function (gameId, toggleField) {
            if($scope.toggles[toggleField] == gameId) {
                $scope.toggles[toggleField] = 0;
            } else {
                $scope.toggles[toggleField] = gameId;
            }
        };

        $scope.toggleGameInEditList = function (game) {
            var isGame = $scope.toggles['editGames'].indexOf(game);
            if(isGame > -1) {
                $scope.toggles['editGames'].splice(isGame, 1);
            } else {
                $scope.toggles['editGames'].push(game);
            }
        };

        var updateCollection = function () {

            authService.signedPost("/api/jwt/me/update/collection", {collection: $scope.editCollection})
                .then(function (data) {
                    console.log('data hey', data);
                    $scope.collection.collection = data.data;
                    $rootScope.$broadcast("update collections");
                });

        };

        $scope.editField = function (toggleCase) {
            switch(toggleCase) {
            case 'collection title':
                $scope.toggles.editFlags.collection.title = true;
                $scope.editCollection.title = $scope.collection.collection.title;

                break;
            case 'collection description':
                $scope.toggles.editFlags.collection.description = true;
                $scope.editCollection.description = $scope.collection.collection.description;
                break;
            }
        };

        $scope.cancelField = function (toggleCase) {
            switch(toggleCase) {
            case 'collection title':
                $scope.toggles.editFlags.collection.title = false;
                $scope.editCollection.title = $scope.collection.collection.title;
                break;
            case 'collection description':
                $scope.toggles.editFlags.collection.description = false;
                $scope.editCollection.description = $scope.collection.collection.description;
                break;
            }
        };

        $scope.saveField = function (toggleCase) {
            switch(toggleCase) {
            case 'collection title':
                if($scope.editCollection.title.length < 2) {
                    alert("tittelen kan ikke være så kort");
                    $scope.cancelField("collection title");
                }
                $scope.collection.collection.title = $scope.editCollection.title;
                $scope.toggles.editFlags.collection.title = false;
                break;
            case 'collection description':

                $scope.collection.collection.description = $scope.editCollection.description;
                $scope.toggles.editFlags.collection.description = false;

                break;
            }

            updateCollection();
        };




        $scope.reportImage = function (image) {
            $rootScope.$broadcast("loading on", "Laster opp samling-bilde");
            authService.signedPost("/api/jwt/me/upload/image", {
                image: image
            })
                .then(function (image) {

                    $scope.editCollection.collectionImageId = image.image._id;
                    $rootScope.$broadcast("loading off");
                });
        };

        $scope.toggleEditTab = function () {
            $scope.toggles.editTab = !$scope.toggles.editTab;
        };

        $scope.runBulk = function (collection, command) {
            _.each($scope.toggles['editGames'], function (game) {
                if(command == 'deleteRows') {
                    $scope.removeGame(collection, game);
                }
            });
        };

        $scope.changeToBreak = function (content) {
            if(content) {
                content = content.replace(/\n/g, "<br />");
                return content;
            }
            return "";
        }

        $(document).on("keydown", function (e) {
            $scope.$apply(function () {
                if(e.keyCode == 27) {
                    if($scope.toggles.search.visible) {
                        $scope.toggles.search.visible = false;
                    }
                };
            });
        });

        $scope.reIndexColSearch = function (key, phrase) {
            if(key && phrase) {
                if(key == 'title' || key == 'publisher' || key == 'console') {
                    $http.get("/api/search/" + key + "/" + encodeURIComponent(phrase))
                        .then(function (data) {
                            $scope.toggles.search.searchResults = data.data;
                            $scope.toggles.search.visible = true;
                        });
                }
                if(key == 'region') {
                    $scope.toggles.search.searchResults = [{'region': 'NTSC'}, {'region': 'PAL'}, {'region': 'PAL-A'}, {'region': 'PAL-B'}, {'region': 'NTSC-J'}];
                    $scope.toggles.search.visible = true;
                }
                if(key == 'condition') {
                    $scope.toggles.search.searchResults = [{'condition': 'CIB'},{'condition': 'NIB'}, {'condition': 'Cart'}];
                    $scope.toggles.search.visible = true;
                }
            }

        };

        $scope.toggleSearch = function (game, settingKey, toggle) {
            if(toggle) {
                $scope.toggles.search.searchResults = [];
                $scope.toggles.search.game = game;
                $scope.toggles.search.key = settingKey;
                $scope.toggles.search.visible = true;
                $scope.reIndexColSearch(settingKey, game[settingKey]);
            }

        };

        $scope.setValueFromSearch = function (configObject, game) {
            delete configObject._id;
            angular.extend(game, configObject);
            $scope.toggles.search.visible = false;
            $scope.toggles.search.searchResults = [];
            $scope.updateGame(game);
        };

        $scope.getCollections = function () {
            authService.signedGet("/api/jwt/me/collections")
                .then(function (data) {
                    $scope.collections = data.data;
                });
        };

        $scope.$on('add to active collection',
            function (event, dbGame) {
                $scope.collection.games.push(dbGame);
            }
        );

        $scope.doBulk = function () {
          if($scope.toggles.bulkSettings.action) {

              if($scope.toggles.bulkSettings.action == "delete") {
                  dialogService.openDialog("Vil du virkelig slette " + $scope.toggles['editGames'].length + " spill fra " + $scope.collection.collection.title)
                    .then(function () {
                        authService.signedPost("/api/jwt/me/bulk/delete", $scope.toggles['editGames'])
                            .then(function (data) {
                                if(data.data.length) {
                                    _.each($scope.collection.games, function (collection, index) {


                                        if(data.data.indexOf(collection._id) > -1) {
                                            collection.hidden = true;
                                        }
                                    });
                                }
                                $scope.toggles['editGames'] = [];
                            });
                    });
              }

              if($scope.toggles.bulkSettings.action == 'move') {
                  if($scope.toggles.bulkSettings.collectionId) {
                      var collection = _.find($scope.collections, function (collection) {
                          return collection._id == $scope.toggles.bulkSettings.collectionId;
                      });

                      dialogService.openDialog("Vil du virkelig flytte " + $scope.toggles['editGames'].length + " spill til " + collection.title)
                          .then(function () {
                            authService.signedPost("/api/jwt/me/bulk/move", {
                                'collectionId': $scope.toggles.bulkSettings.collectionId,
                                'games': $scope.toggles['editGames']
                            })
                                  .then(function (data) {
                                      if(data.data.length) {
                                          _.each($scope.collection.games, function (collection, index) {
                                              console.log('looping collection', collection._id);

                                              if(data.data.indexOf(collection._id) > -1) {
                                                  collection.hidden = true;
                                              }
                                          });
                                      }
                                      $scope.toggles['editGames'] = [];
                                  });
                          });

                  }
              }

              if($scope.toggles.bulkSettings.action == 'copy') {
                  if($scope.toggles.bulkSettings.collectionId) {

                      var collection = _.find($scope.collections, function (collection) {
                          return collection._id == $scope.toggles.bulkSettings.collectionId;
                      });

                      dialogService.openDialog("Vil du kopiere " + $scope.toggles['editGames'].length + " spill til " + collection.title)
                          .then(function () {
                              authService.signedPost("/api/jwt/me/bulk/copy", {
                                  'collectionId': collection._id,
                                  'games': $scope.toggles['editGames']
                              })
                              .then(function (data) {
                                  $scope.toggles['editGames'] = [];
                              });
                          });

                  }
              }
          }
        };

        $scope.getCollections();
    }
});
	