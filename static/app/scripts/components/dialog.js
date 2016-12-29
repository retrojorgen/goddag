/**
 * Created by jorjacob on 29/11/16.
 */
spilldb.component('gamedialog', {
    templateUrl: '/static/app/scripts/views/dialog.html',
    controller: function ($scope, $rootScope) {

        $scope.dialog = {
            visible: false,
            message: "",
            small: true
        };



        $scope.toggles = {};

        $scope.click = function (state) {
            console.log('registering click');
            if(state) {
                $rootScope.$broadcast("yes dialog");
                $scope.dialog.visible = false;
            } else {
                $rootScope.$broadcast("no dialog");
                $scope.dialog.visible = false;
            }
        };
        $scope.$on('open dialog', function ($event, message, toggles) {
            $scope.dialog.visible = true;
            $scope.dialog.message = message;
            if(toggles) {

                $scope.toggles = toggles;
            }
            console.log(toggles);
            console.log($scope.toggles);
        });
    }
});