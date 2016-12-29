spilldb.component('user', {
	templateUrl: '/static/app/scripts/views/user.html',
  	controller: function ($scope, $http, $timeout, $routeParams, $filter, _, $window, $rootScope, authService, eventService) {
      $scope.toggles = {
        editable: false,
        editTab: false,
        usermenu: {
          'overview': true,
          'photos': false,
          'collections': false,
          'goals': false,
          'sales': false
        },
        editFlags: {
            description: false
        }
      };

      $scope.user = {};
        $scope.loggedInUser = $rootScope.user;


      $scope.collections = {
        'collections': [],
        'goals': [],
        'sales': []
      };


      $scope.imageGalleryConfig = {
        imageGallery : [],
          on: false,
          current: undefined
      };

      $scope.openGallery = function (imageId, images) {
        $scope.imageGalleryConfig.imageGallery = images;
        $scope.imageGalleryConfig.current = imageId;
        $scope.imageGalleryConfig.on = true;
      };


        $scope.funks = ["item 1", "item 2"];
        $scope.carouselInitializer = function() {
            $(".about-carousel").owlCarousel({
                items: 3,
                navigation: true,
                pagination: false,
                navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
            });
        };


      $scope.$on('user logged in', function(next, current) { 
        $scope.loggedInUser = $rootScope.user;
        if($rootScope.user && $scope.user && $rootScope.user._id == $scope.user._id) {
            $scope.toggles.editable = true;
        } else {
            $scope.toggles.editable = false;
        }
        setPriveleges();
      });

        $scope.uploadProfilePicture= function (file) {
            console.log('yo')
            authService.signedPost("/api/jwt/me/upload/profilephoto", {image: file})
                .then(function (data) {
                    $scope.user.profileImageId = data.data.imageId;
                    $rootScope.user.profileImageId = data.data.imageId;
                    $rootScope.$broadcast("user updated");
                });
        };

      var setPriveleges = function () {
        console.log($routeParams);
        if($routeParams.nickSlug && $scope.user && $scope.user.slug == $routeParams.nickSlug) {
          $scope.toggles.editable = true;
        }
      }

      var getCompleteData = function () {
        $http.post("/api/get/user/complete", { nickSlug: $routeParams.nickSlug })
        .success(function (data) {
          _.each(data.collections, function (collection) {
              if(collection.type) {
                  $scope.collections[collection.type].push(collection);
              }
          });

          $scope.user = data.user;
          $scope.editUser = angular.copy(data.user);

            if($rootScope.user && $scope.user && $rootScope.user._id == $scope.user._id) {
                $scope.toggles.editable = true;
            } else {
                $scope.toggles.editable = false;
            }

        });
      };

      $scope.removeImage = function (imageId) {
        authService.signedPost("/api/jwt/me/remove/userphoto", {imageId: imageId})
            .then(function (data) {
                console.log($scope.user.collectionImages, data);
                var imageIndex = $scope.user.collectionImages.indexOf(imageId);
                console.log('image index ',imageIndex);
                $scope.user.collectionImages.splice(imageIndex, 1);
            });
      };

      $scope.toggleEditTab = function () {
        $scope.toggles.editTab = !$scope.toggles.editTab;
      };

      $scope.toggleUserTab = function (tabName) {
        _.each($scope.toggles.usermenu, function (menuValue, key) {
          if(key == tabName)
            $scope.toggles.usermenu[key] = true;
          else
            $scope.toggles.usermenu[key] = false;
        });
      };

        updateUserDescription = function () {



            authService.signedPost("/api/jwt/me/update/description", {description: $scope.editUser.description})
                .then(function (data) {
                });
        };

        $scope.editField = function (toggleCase) {
            switch(toggleCase) {
                case 'user description':
                    $scope.toggles.editFlags.description = true;
                    if($scope.user.description)
                        $scope.editUser.description = $scope.user.description;
                    else
                        $scope.editUser.description = "";
                    break;
            }
        };

        $scope.cancelField = function (toggleCase) {
            switch(toggleCase) {
                case 'collection description':
                    $scope.toggles.editFlags.description = false;
                    if($scope.user.description)
                        $scope.editUser.description = $scope.user.description;
                    else
                        $scope.editUser.description = "";
                    break;
            }
        };

        $scope.saveField = function (toggleCase) {
            switch(toggleCase) {
                case 'user description':
                    $scope.user.description = $scope.editUser.description;
                    $scope.toggles.editFlags.description = false;

                    break;
            }

            updateUserDescription();
        };

        $scope.uploadUserPhoto = function (file) {
            $rootScope.$broadcast("loading on", "Laster opp bilde");


            authService.signedPost("/api/jwt/me/upload/userphoto", {image: file})
                .then(function (data) {
                    if(data.data.imageId) {
                        if($scope.user.collectionImages) {
                            $scope.user.collectionImages.push(data.data.imageId);
                        } else {
                            $scope.user.collectionImages = [data.data.imageId];
                        }
                    }
                    $rootScope.$broadcast("loading off");
                    eventService.postEvent({
                        type: "new user photo",
                        referenceId: data.data.imageId
                    });
                });
        };
      getCompleteData();
      setPriveleges();
      if($routeParams.space)
        $scope.toggleUserTab($routeParams.space);
      else
        $scope.toggleUserTab('overview');
    }
});
	