/**
 * Created by jorjacob on 02/11/16.
 */
/**
 * Created by jorjacob on 22.10.2016.
 */
/**
 * Created by jorjacob on 20.10.2016.
 */


spilldb.component('imageGallery', {
    templateUrl: '/static/app/scripts/views/imageGallery.html',
    bindings: {
        galleryConfig: "="
    },
    controller: function ($scope, $element, $timeout) {

        var scope = this;

        $scope.galleryConfig = scope.galleryConfig;

        $scope.$watch('scope.galleryConfig', function () {
            console.log(scope.galleryConfig);
            if(scope.galleryConfig.on) {

            }
        });

        $(document).on('keydown', function (e) {
            $scope.$apply(function () {
                if($scope.galleryConfig.on)  {
                    if(e.which == 37) {
                        $scope.prevButton();
                    }
                    if(e.which == 39) {
                        $scope.nextButton();
                    }
                    if(e.which == 27) {
                        $scope.closeGallery();
                    }
                }
            });

        });

        $scope.closeGallery = function () {
            $scope.galleryConfig.on = false;
        };

        $scope.nextButton = function () {
            console.log('clicking next');
            var currentIndex = $scope.galleryConfig.imageGallery.indexOf($scope.galleryConfig.current);
            if($scope.galleryConfig.imageGallery[currentIndex+1]) {
                $scope.galleryConfig.current = $scope.galleryConfig.imageGallery[currentIndex+1];
            } else {
                $scope.galleryConfig.current = $scope.galleryConfig.imageGallery[0];
            }
        };

        $scope.prevButton = function () {
            console.log('clicking previous');
            var currentIndex = $scope.galleryConfig.imageGallery.indexOf($scope.galleryConfig.current);
            if($scope.galleryConfig.imageGallery[currentIndex-1]) {
                $scope.galleryConfig.current = $scope.galleryConfig.imageGallery[currentIndex-1];
            } else {
                $scope.galleryConfig.current = $scope.galleryConfig.imageGallery[$scope.galleryConfig.imageGallery.length-1];
            }
        };

    }});