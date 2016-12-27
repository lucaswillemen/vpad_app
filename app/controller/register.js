app.controller("register", function($scope, $rootScope, $localStorage, $http, $mdToast, $state) {

    $rootScope.megabigload = true
    $scope.src = 'start'
    $scope.step = function(src) {
        $scope.src = null
        setTimeout(function() {
            $scope.src = src
            $scope.$apply()

        }, 450);

    }
    $scope.cep = function() {
        $http.get('https://viacep.com.br/ws/' + $scope.empresa.cep + '/json/ ')
            .then(function(res) {
                console.log(res.data);
                $scope.empresa.localidade = res.data.localidade
                $scope.empresa.uf = res.data.uf
                $scope.empresa.logradouro = res.data.logradouro
                $scope.empresa.bairro = res.data.bairro

            });
    }
    $scope.cadastrar = function() {
        var socket = $rootScope.socket
        socket.emit("register_email_test", $scope.user.email)
        socket.removeListener("register_email_test")
        socket.on("register_email_test", function(r) {
            if (r.error) {
                console.log("email já existe")
                $mdToast.show($mdToast.simple().content("Esse email já está cadastrado").position('bottom right').hideDelay(2000));
            } else {
                socket.emit("registrar_empresa", $scope.empresa)
                socket.on("confirma_empresa", function(eid) {
                    $scope.user.nivel = "adm"
                    socket.emit("registrar_empresa_adm", $scope.user, eid, $scope.empresa.nome, $scope.empresa.localidade)
                    socket.on("confirma_adm", function(data, reg) {
                        $state.go('login')
                    })
                })
            }
        })
    }
})