app.controller("pdv", function($scope, $rootScope, $localStorage, $state, $mdToast, $mdDialog) {

    $scope.text = $rootScope.i18n
    $scope.data = {}

    $scope.select_prod = function(item) {
        if (item) {
            $scope.selected_prod = item
            $scope.selected_prod.qntd = 1
        } else {
            delete $scope.selected_prod
        }
    }
    $scope.add_prod = function() {
        if (!$scope.data.produtos) {
            $scope.data.produtos = []
            $scope.subtotal_prod = 0
            $scope.data.total = 0
        }
        $scope.subtotal_prod += $scope.selected_prod.dados.pricesell * $scope.selected_prod.qntd
        $scope.data.total += $scope.selected_prod.dados.pricesell * $scope.selected_prod.qntd
        $scope.data.produtos.push({
            'nome': $scope.selected_prod.dados.nome,
            'qntd': $scope.selected_prod.qntd,
            '_id': $scope.selected_prod._id,
            'price': $scope.selected_prod.dados.pricesell
        })
    }
    $scope.remove_prod = function(i) {
        $scope.subtotal_prod -= $scope.data.produtos[i].price * $scope.data.produtos[i].qntd
        $scope.data.produtos.splice(i, 1);
    }
    $scope.parcs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    $scope.close = function() {
        var produtos = JSON.parse(angular.toJson($scope.data))
        $rootScope.socket.emit("pdv", produtos, $rootScope.aut, $scope.cliente)

    }

    $scope.clientes = $localStorage.tb_cliente
    $scope.add_client = function(i) {
        $scope.cliente = i
    }
    $scope.socket.removeListener("pdv")
    $scope.socket.on("pdv", function(res) {
        if ($scope.data_pdv.nota) {
            $scope.comprovante($scope.data)
        }
        $scope.reset()
        $mdToast.show($mdToast.simple().content("Venda realizada!").position('bottom right').hideDelay(2000));
    })
    $scope.reset = function(i) {
        $scope.data = {
            'dados': {
                'type_pay': 'vista'
            }
        }
        $scope.cliente = {}
        $scope.myValue = false
        delete $scope.subtotal_prod
        $scope.filter = ''
        $scope.filter_prod = ''
        if (i) {} else {
            $scope.$apply()
        }
    }
    $scope.comprovante = function(res) {
        $mdDialog.show({
            controller: atualizar,
            templateUrl: 'template/vpad/modal/comprovante_pdv.html?' + window.version,
            ariaLabel: 'Publicação',
            clickOutsideToClose: true
        })

        function atualizar($scope, $localStorage, $rootScope, $mdDialog) {
            $scope.text = $rootScope.i18n
            $scope.cancel = $rootScope.cancel
            $scope.data = res
            console.log(res)
        }
    }
    $scope.print = function() {
        print()
    }

    //Sockets tabela tabela
    var socket = $scope.socket
    var table = "produto"
    socket.emit("table_mgmt", table, "fetch", $rootScope.aut)
    socket.removeListener("data_table_mgmt_" + table);
    socket.on("data_table_mgmt_" + table, function(act, data) {
        switch (act) {
            case 'fetch':
                $localStorage.tb_produto = data
                $scope.produtos = $localStorage.tb_produto
                break;

            case 'add':
                $localStorage.tb_produto.push(data)
                $scope.$apply()
                break;
            case 'update':
                //Procura e altera a linha do cliente
                $localStorage.tb_produto.forEach(function(k, v) {
                        if (data._id == k._id) {
                            $localStorage.tb_produto[v].dados = data.dados
                            $scope.$apply()
                        };
                    })
                    //$scope.produtos = $localStorage.tb_produto
                break;
            case 'delete':
                $localStorage.tb_produto.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_produto.splice(v, 1)
                    };
                })
                break;
        }
    })
})