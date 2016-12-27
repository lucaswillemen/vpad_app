app.controller('fornecedor', function($scope, $rootScope, $mdDialog, $localStorage, $state, $filter) {
    //Load tabela
    $rootScope.promise_table()

    //SOCKETS
    var table = "fornecedor"
    var socket = $rootScope.socket
    $scope.text = $rootScope.i18n
    $scope.desserts = {}
    $scope.desserts = $localStorage.tb_vendor

    function apply() {
        $scope.desserts = $localStorage.tb_vendor
        $rootScope.promise_table()
        $scope.$apply()
    }


    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };
    $scope.popupAdicionar = function(){
        $scope.data = {}
        $scope.panel = true
    }
    $scope.popupEditar = function(ev, id) {
        var arr = $filter('filter')($localStorage.tb_vendor, id)[0]
        $scope.data = {
            'dados': arr.dados,
            '_id': arr._id
        }
        $scope.panel = true
    }

    $scope.popupExcluir = function(ev, id_row) {
        var confirm = $mdDialog.confirm()
            .title($scope.text.vendors.delet.confirm)
            .content($scope.text.vendors.delet.text)
            .ariaLabel('Excluir fornecedor')
            .targetEvent(ev)
            .ok($scope.text.basic.confirm)
            .cancel($scope.text.basic.cancel);
        $mdDialog.show(confirm).then(function() {
            $rootScope.socket.emit("table_mgmt", table, 'delete', $rootScope.aut, {
                "_id": id_row
            })


        })
    }

    $scope.cadastrar = function() {
            console.log($scope.data.dados)
            if ($scope.data._id) {
                socket.emit("table_mgmt", table, 'update', $rootScope.aut, $scope.data)
            } else {
                socket.emit("table_mgmt", table, 'create', $rootScope.aut, $scope.data.dados)
            }
        }
        //Sockets tabela tabela
    socket.emit("table_mgmt", table, "fetch", $rootScope.aut)
    socket.removeListener("data_table_mgmt_"+table);
    socket.on("data_table_mgmt_"+table, function(act, data, tb) {
        switch (act) {
            case 'fetch':
                $localStorage.tb_vendor = $scope.desserts
                break;
           
            case 'add':
                $localStorage.tb_vendor.push(data)
                $localStorage.tb_vendor.count++
                $scope.panel = false
                $scope.vendorForm.$setPristine()
                apply()
                break;
            case 'update':

                //Procura e altera a linha do cliente
                $localStorage.tb_vendor.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_vendor[v].dados = data.dados
                        console.log($localStorage.tb_vendor[v].dados)
                    };
                })
                $scope.panel = false
                $scope.vendorForm.$setPristine()
                apply()
                break;
            
            case 'delete':
                $localStorage.tb_vendor.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_vendor.splice(v, 1)
                    };
                })
                apply()
                break;
        }
    })
})