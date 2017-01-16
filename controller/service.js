app.controller('service', function($scope, $rootScope, $mdDialog, $localStorage, $state, $filter) {
    //Load tabela
    $rootScope.promise_table()

    //SOCKETS
    var table = "service"
    var socket = $rootScope.socket
    $scope.text = $rootScope.i18n
    $scope.selected = [];
    $scope.desserts = {}
    $scope.desserts = $localStorage.tb_service
    function apply(){
        $scope.desserts = $localStorage.tb_service
        $rootScope.promise_table()
        $scope.$apply()
    }    

    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };

    $scope.popupAdicionar = function(){
        $scope.data = {
            "dados": {
                "price": 0
            }
        }
        $scope.panel = true
    }
    $scope.popupEditar = function(ev, id){
    	var arr = $filter('filter')($localStorage.tb_service, id)[0]
    	$scope.data = {'dados': arr.dados, '_id': arr._id}
    	$scope.panel = true
    }

    $scope.popupExcluir = function(ev, id_row) {
        var confirm = $mdDialog.confirm()
            .title($scope.text.services.delet.confirm)
            .content($scope.text.services.delet.text)
            .ariaLabel('Excluir serviço')
            .targetEvent(ev)
            .ok($scope.text.basic.confirm)
            .cancel($scope.text.basic.cancel);
            $mdDialog.show(confirm).then(function() {
            $rootScope.socket.emit("table_mgmt", table, 'delete', $rootScope.aut, {"_id": id_row})
        })
    }

    $scope.cadastrar = function() {
    	if ($scope.data._id) {
        	socket.emit("table_mgmt", table, 'update', $rootScope.aut, $scope.data)
    	}else{
    		socket.emit("table_mgmt", table, 'create', $rootScope.aut, $scope.data.dados)
    	}
    }
    //Sockets tabela tabela
    socket.emit("table_mgmt", table, "fetch", $rootScope.aut)
    socket.removeListener("data_table_mgmt_"+table);
    socket.on("data_table_mgmt_"+table, function(act, data, tb) {
        switch (act) {
            case 'fetch':
                $scope.desserts = data,
                $scope.desserts.count = data.length
                $localStorage.tb_service = $scope.desserts
                $localStorage.tb_service.count = $scope.desserts.count
                break;
            case 'add':
                $localStorage.tb_service.push(data)
                $localStorage.tb_service.count++
                $scope.panel = false
                $scope.servForm.$setPristine()
                apply()
                break;
            case 'update':            
                //Procura e altera a linha do cliente
                $localStorage.tb_service.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_service[v].dados = data.dados
                    };
                })
                $scope.panel = false
                $scope.servForm.$setPristine()
                apply()
                break;
            case 'delete':
                $localStorage.tb_service.forEach(function(k, v) {
                        if (data._id == k._id) {
                            $localStorage.tb_service.splice(v,1)
                        };
                    })
                apply()
                break;
        }
    })
})