app.controller('produto', function($scope, $rootScope, $mdDialog, $localStorage, $state, $filter) {
    //Load tabela
    $rootScope.promise_table()

    //SOCKETS
    var table = "produto"
    var socket = $rootScope.socket
    $scope.text = $rootScope.i18n
    $scope.selected = [];
    $scope.desserts = {}
    $scope.desserts = $localStorage.tb_produto
    function apply(){
        $rootScope.promise_table()
        $scope.$apply()
    }    


    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };
    $scope.popupEditar = function(ev, id){
    	var arr = $filter('filter')($localStorage.tb_produto, id)[0]
        if (arr.dados.validate) {arr.dados.validate = new Date(arr.dados.validate)}
        console.log(arr)
    	$scope.data = {'dados': arr.dados, '_id': arr._id}
    	$scope.panel = true
    }

    $scope.popupAdicionar = function(){
        $scope.data = {
            "dados": {
                "qntd": 0,
                "pricesell": 0
            }
        }
        $scope.panel = true
    }

    $scope.popupExcluir = function(ev, id_row) {
        var confirm = $mdDialog.confirm()
            .title($scope.text.products.delet.confirm)
            .content($scope.text.products.delet.text)
            .ariaLabel('Excluir produto')
            .targetEvent(ev)
            .ok($scope.text.basic.confirm)
            .cancel($scope.text.basic.cancel);
            $mdDialog.show(confirm).then(function() {
            $rootScope.socket.emit("table_mgmt", 'produto', 'delete', $rootScope.aut, {"_id": id_row})
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
    socket.on("data_table_mgmt_"+table, function(act, data) {
        switch (act) {
            case 'fetch':
                $scope.desserts = data,
                $localStorage.tb_produto = $scope.desserts
                break;
            case 'add':
                $localStorage.tb_produto.push(data)
                $scope.panel = false
                $scope.prodForm.$setPristine()
                apply()
                break;
            case 'update':            
                //Procura e altera a linha do cliente
                $localStorage.tb_produto.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_produto[v].dados = data.dados
                    };
                })
                $scope.panel = false
                $scope.prodForm.$setPristine()
                apply()
                break;
            case 'delete':
                $localStorage.tb_produto.forEach(function(k, v) {
                    console.log(data)
                        if (data._id == k._id) {
                            $localStorage.tb_produto.splice(v,1)
                        };
                    })
                apply()
                break;
        }
    })
})