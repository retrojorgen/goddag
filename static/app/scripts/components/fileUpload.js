/**
 * Created by jorjacob on 22.10.2016.
 */
/**
 * Created by jorjacob on 20.10.2016.
 */


spilldb.component('fileupload', {
    template: '<input type="file" class="uploadFileInput" style="display: none" /><button class="upload-photo-button" ng-click="startUpload()"></button>',
    bindings: {
        uploadFile: "=",
        icon: "=",
        uploadText: "=",
        buttonclass: "=",
        reference: "="
    },
    controller: function ($scope, $element, $timeout) {

        var scope = this;

        var thisElement = angular.element($element).find(".uploadFileInput");

        console.log(angular.element($element));


        $scope.startUpload = function () {
            thisElement.trigger('click');

        }


        if(scope.uploadText) {
            $element.find(".upload-photo-button").text(scope.text).addClass('add-description-button').append($('<span>').addClass("glyphicon glyphicon-" + scope.icon));
        }




        thisElement.change(function () {
                var file = angular.element($element).find(".uploadFileInput")[0].files[0];
                var name = file.name;
                var type = file.type;
                var size = file.size;
                var sizeInMB = (size / (1024*1024)).toFixed(2);

                reader = new FileReader();
                reader.onload = function(evt) {
                    if(type != "image/jpeg" && parseFloat(sizeInMB) <= 5)
                        alert("Bilde må være jpg og være mindre enn 5 mb");
                    else
                        scope.uploadFile(evt.target.result, scope.reference);
                };


                reader.readAsDataURL(file);

        });

    }});