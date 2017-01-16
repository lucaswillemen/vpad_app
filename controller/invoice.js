app.controller('invoice', function($scope, $rootScope, $mdDialog, $localStorage, $state, $filter) {
    //Load tabela
    $rootScope.promise_table()

    //SOCKETS
    var socket = $rootScope.socket
    //$scope.desserts = {}
    function apply(){
        $rootScope.promise_table()
        $scope.$apply()
    }    


    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };
    socket.emit("load_invoice", $rootScope.aut)
    socket.removeListener("load_invoice")
    socket.on("load_invoice", function(res){
        console.log(res)
        $scope.desserts = res.faturas
        $scope.$apply()
    })
})