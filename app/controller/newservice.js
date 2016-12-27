app.controller('newservice', function($scope, $rootScope, $mdDialog, $localStorage, $state, $log, $q, $timeout) {

    //Load tabela
    $rootScope.promise_table()
    $scope.data_service = {}
    $scope.popupaddNovo = $rootScope.popupaddNovoCliente

    $scope.hidecoments = function() {
        $scope.filter = ""
    }

    //SOCKETS
    $scope.data_service.dataregistro = new Date()
    $scope.data_service.entrega = new Date()
    $scope.data_service.prazo = new Date()
    var table = "cliente"
    var socket = $rootScope.socket
    $scope.text = $rootScope.i18n
    $scope.clientes = {}
    $scope.clientes = $localStorage.tb_cliente
    $scope.produtos = $localStorage.tb_produto
    $scope.services = $localStorage.tb_service

    // list of `state` value/display objects
    $scope.clientes = $localStorage.tb_cliente
    $scope.send_item = function(item) {
        $scope.data_service.cliente = item
    }

    $scope.remove_prod = function(i) {
        $scope.subtotal_prod -= $scope.data_service.produtos[i].price * $scope.data_service.produtos[i].qntd
        $scope.data_service.produtos.splice(i, 1);
    }

    $scope.select_prod = function(item) {
        $scope.selected_prod = item
        $scope.selected_prod.qntd = 1
    }
    $scope.add_prod = function() {
        if (!$scope.data_service.produtos) {
            $scope.data_service.produtos = []
            $scope.subtotal_prod = 0
        }
        $scope.subtotal_prod += $scope.selected_prod.dados.pricesell * $scope.selected_prod.qntd
        $scope.data_service.produtos.push({
            'nome': $scope.selected_prod.dados.nome,
            'qntd': $scope.selected_prod.qntd,
            '_id': $scope.selected_prod._id,
            'price': $scope.selected_prod.dados.pricesell
        })
    }


    $scope.remove_serv = function(i) {
        $scope.subtotal_prod -= $scope.data_service.services[i].price * $scope.data_service.services[i].qntd
        $scope.data_service.services.splice(i, 1);
    }

    $scope.select_serv = function(item) {
        console.log(item)
        $scope.selected_serv = item
        $scope.selected_serv.qntd = 1
    }
    $scope.add_serv = function() {
        if (!$scope.data_service.services) {
            $scope.data_service.services = []
            $scope.subtotal_serv = 0
        }
        $scope.subtotal_serv += $scope.selected_serv.dados.price * $scope.selected_serv.qntd
        $scope.data_service.services.push({
            'nome': $scope.selected_serv.dados.nome,
            'qntd': $scope.selected_serv.qntd,
            '_id': $scope.selected_serv._id,
            'price': $scope.selected_serv.dados.price
        })
    }

    $scope.save = function() {
        if ($scope.data_service.produtos) {
            $scope.data_service.produtos = JSON.parse(angular.toJson($scope.data_service.produtos))
        }
        if ($scope.data_service.services) {
            $scope.data_service.services = JSON.parse(angular.toJson($scope.data_service.services))
        }
        $rootScope.socket.emit("create_os", $scope.data_service, $rootScope.aut)
        console.log($scope.data_service)
    }

    socket.removeListener("create_os");
    socket.on("create_os", function(data) {
        console.log(data)
    })


    socket.removeListener("data_table_mgmt");
    socket.on("data_table_mgmt", function(act, data) {
        $localStorage.tb_cliente.push(data)
        $scope.clientes.push(data)
        $rootScope.cancel()
        $scope.filter = data.dados.nome
        $scope.send_item(data)
        apply()
    })
})