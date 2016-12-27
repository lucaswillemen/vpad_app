app.controller('cliente', function($scope, $rootScope, $mdDialog, $localStorage, $state) {

    //Load tabela
    $rootScope.promise_table()

    //SOCKETS
    var table = "cliente"
    var socket = $rootScope.socket
    $scope.text = $rootScope.i18n
    $scope.selected = [];
    $scope.desserts = {}
    $scope.desserts = $localStorage.tb_cliente

    function apply() {
        $scope.desserts = $localStorage.tb_cliente
        $rootScope.promise_table()
        $scope.$apply()
    }


    //Sockets tabela tabela
    socket.emit("table_mgmt", table, "fetch", $rootScope.aut)
    socket.removeListener("data_table_mgmt_"+table);
    socket.on("data_table_mgmt_"+table, function(act, data) {
        switch (act) {
            case 'fetch':
                $scope.desserts = data,
                $scope.desserts.count = data.length
                $localStorage.tb_cliente = $scope.desserts
                $localStorage.tb_cliente.count = $scope.desserts.count
                break;
            case 'search':
                if (res.act == 'yes') {
                    $scope.dbid = data._id
                    $scope.cadastro2 = true
                    $scope.data = data
                    $scope.$apply()
                } else {
                    $scope.cadastro3 = true
                    $scope.$apply()
                }
                break;
            case 'add':
                $localStorage.tb_cliente.push(data)
                $localStorage.tb_cliente.count++
                    $rootScope.cancel()
                apply()
                break;
            case 'update':

                //Procura e altera a linha do cliente
                $localStorage.tb_cliente.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_cliente[v].dados = data.dados
                    };
                })
                $rootScope.cancel()
                apply()
                break;
            case 'create':
                break;
            case 'delete':
                $localStorage.tb_cliente.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_cliente.splice(v, 1)
                    };
                })
                apply()
                break;

        }
    })




    //DATA TABLE CORE
    $scope.options = {
        autoSelect: false,
        boundaryLinks: true,
        largeEditDialog: false,
        pageSelector: false,
        rowSelection: true
    };
    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    $scope.removeFilter = function() {
        $scope.filter.show = false;
        $scope.filter.search = '';
    };
    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };




    $scope.popupExcluir = function(ev, id_row) {
            var confirm = $mdDialog.confirm()
                .title($scope.text.customers.delet.confirm)
                .content($scope.text.customers.delet.text)
                .ariaLabel('Excluir cliente')
                .targetEvent(ev)
                .ok($scope.text.basic.confirm)
                .cancel($scope.text.basic.cancel);
            $mdDialog.show(confirm).then(function() {
                $rootScope.socket.emit("table_mgmt", 'cliente', 'delete', $rootScope.aut, {
                    "_id": id_row
                })


            })
        }
        //Carregar POPUP

    $scope.popupaddNovo = $rootScope.popupaddNovoCliente


    $scope.popupEditar = function(ev, id_row) {
        $mdDialog.show({
            controller: atualizar,
            templateUrl: 'template/vpad/modal/cliente.html?' + window.version,
            targetEvent: ev,
            ariaLabel: 'Publicação',
            clickOutsideToClose: true
        })

        function atualizar($scope, $localStorage, $rootScope, $mdDialog, $http) {
            $scope.cep = function() {
                $http.get('https://viacep.com.br/ws/' + $scope.form.data.dados.cep + '/json/ ')
                    .then(function(res) {
                        $scope.form.data.dados.cidade = res.data.localidade
                        $scope.form.data.dados.estado = res.data.uf
                        $scope.form.data.dados.logradouro = res.data.logradouro
                        $scope.form.data.dados.bairro = res.data.bairro

                    });
            }
            $scope.text = $rootScope.i18n
            $scope.cancel = $rootScope.cancel
            $scope.form = {};
            $localStorage.tb_cliente.forEach(function(k, v) {
                if (id_row == k._id) {
                    //variavel com os dados da data
                    var datanascimento = new Date(k.dados.nascimento)
                        //Se a data for válida...
                    if (isNaN(datanascimento.getTime())) {
                    } else {
                        k.dados.nascimento = datanascimento
                    }

                    $scope.form.data = {
                        "dados": k.dados,
                        "_id": k._id
                    }
                };
            })
            $scope.AtualizarCliente = function() {
                $rootScope.socket.emit("table_mgmt", 'cliente', 'update', $rootScope.aut, $scope.form.data)
            }
        }
    }
})