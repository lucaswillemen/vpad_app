app.controller("monitoring", function($scope, $rootScope, $localStorage, $state, $mdToast, $stateParams){

    $scope.socket = $rootScope.socket
    $scope.socket.emit("monit_os", $stateParams.id)
    $scope.socket.removeListener("monit_os")
    $scope.socket.on("monit_os", function(data){
        console.log(data)
        $scope.data = data
        $scope.$apply()
    })
   
})