app.controller('os', function($scope, $timeout, $rootScope, $localStorage, $mdSidenav, $mdToast, $mdDialog, $state) {
    $scope.socket = $rootScope.socket
    $scope.socket.emit("os", $rootScope.aut)
    $scope.socket.removeListener("os")
    $scope.socket.on("os", function(data){
        console.log(data)
        $scope.data = data
        $scope.$apply()
    })
    $scope.calculate = function(prod, serv, coust){
        var total = 0
        if (prod) {
            prod.forEach(function(v, k){
                total += v.price*v.qntd
            })
        }
        if (serv) {
            serv.forEach(function(v, k){
                total += v.price*v.qntd
            })
            //console.log(serv)
        }
        if (coust) {
            console.log(coust)
            total += coust.fr + coust.op + coust.ds
        }
        return total
    }
})