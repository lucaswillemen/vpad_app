app.controller('usuario', function($scope, $rootScope, $mdDialog, $localStorage, $state) {

    //Load tabela
    $rootScope.promise_table()

    //SOCKETS
    var table = "usuario"
    var socket = $rootScope.socket
    $scope.desserts = {}
    $scope.desserts = $localStorage.tb_usuario

    function apply() {
        $scope.desserts = $localStorage.tb_usuario
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
                $localStorage.tb_usuario = $scope.desserts
                $localStorage.tb_usuario.count = $scope.desserts.count
                break;
            case 'find':
                if (data) {
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
                $localStorage.tb_usuario.push(data)
                $localStorage.tb_usuario.count++
                $scope.panel = false
                $scope.cadastro2 = false
                $scope.formPop2.$setPristine()
                $scope.formPop.$setPristine()
                $scope.addload = false
                $scope.cadastro3 = false
                apply()
                break;
            case 'update':
                //Procura e altera a linha do usuario
                $localStorage.tb_usuario.forEach(function(k, v) {
                    if (data._id == k._id) {
                        $localStorage.tb_usuario[v].dados = data.dados
                        console.log($localStorage.tb_usuario[v].dados)
                    };
                })
                $rootScope.cancel()
                apply()
                break;
            case 'delete':
                $localStorage.tb_usuario.forEach(function(k, v) {
                    console.log(data)
                    if (data._id == k._id) {
                        $localStorage.tb_usuario.splice(v, 1)
                    };
                })
                apply()
                break;

        }
    })




    //DATA TABLE CORE
    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };




    $scope.popupExcluir = function(ev, id_row) {
        var confirm = $mdDialog.confirm()
            .title($rootScope.i18n.customers.delet.confirm)
            .content($rootScope.i18n.customers.delet.text)
            .ariaLabel('Excluir usuario')
            .targetEvent(ev)
            .ok($rootScope.i18n.basic.confirm)
            .cancel($rootScope.i18n.basic.cancel);
        $mdDialog.show(confirm).then(function() {
            $rootScope.socket.emit("table_mgmt", 'usuario', 'delete', $rootScope.aut, {
                "_id": id_row
            })
        })
    }

    //Carregar POPUP
    $scope.popupAdicionar = function() {
        $scope.panel = true
    }

    $scope.verifica = function() {
        socket.emit('table_mgmt', table, 'find', $rootScope.aut, $scope.data.dados)
        $localStorage.tb_usuario.forEach(function(k, v) {
            if ($scope.data.dados.email == k.dados.email) {
                $scope.jaexiste = true
            };
        })
    }

    $scope.addUsuario = function() {
        socket.emit('table_mgmt', table, 'add', $rootScope.aut, $scope.dbid)
        $scope.addload = true
    }

    //usuario não cadastrado, criar um novo
    $scope.novoUsuario = function() {
        socket.emit("table_mgmt", table, 'create', $rootScope.aut, $scope.data.dados)
    }


    $scope.popupEditar = function(ev, id_row) {
        $mdDialog.show({
            controller: atualizar,
            templateUrl: 'template/vpad/modal/usuario.html?' + window.version,
            targetEvent: ev,
            ariaLabel: 'Publicação',
            clickOutsideToClose: true
        })

        function atualizar($scope, $localStorage, $rootScope, $mdDialog, $http) {
            $scope.text = $rootScope.i18n
            $scope.cancel = $rootScope.cancel
            $scope.form = {};
            $scope.cep = function() {
                $http.get('https://viacep.com.br/ws/' + $scope.form.data.dados.cep + '/json/ ')
                    .then(function(res) {
                        $scope.form.data.dados.cidade = res.data.localidade
                        $scope.form.data.dados.estado = res.data.uf
                        $scope.form.data.dados.logradouro = res.data.logradouro
                        $scope.form.data.dados.bairro = res.data.bairro

                    });
            }
            $localStorage.tb_usuario.forEach(function(k, v) {
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
            $scope.AtualizarUsuario = function() {
                $rootScope.socket.emit("table_mgmt", 'usuario', 'update', $rootScope.aut, $scope.form.data)
            }
        }
    }
})