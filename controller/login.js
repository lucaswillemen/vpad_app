app.controller('login', function($scope, $timeout, $rootScope, $localStorage, $mdSidenav, $mdToast, $mdDialog, $state, $window) {
setTimeout(function() {
$window.document.getElementById('email').focus()
}, 100);
    var socket = $rootScope.socket
    $scope.data_login = {}

    $scope.login = function() {
        console.log("tentou logar")
        $scope.load = true
        socket.emit("fazer_login", $scope.data_login);
    }

    socket.removeListener("confirma_login");
    socket.on("confirma_login", function(res) {
        if (!res.error) {
            $localStorage.perfil = res
            $scope.pload = true
            localStorage.uid = res._id
            localStorage.nome = res.dados.nome
            $scope.empresas = res.empresas
            $scope.$apply()
        } else {
            switch(res.error){
                case 'email':
                    $mdToast.show($mdToast.simple().content("Email incorreto").position('bottom right').hideDelay(3000));
                break;
                case 'senha':
                    $mdToast.show($mdToast.simple().content("Senha incorreta").position('bottom right').hideDelay(3000));
                break;
                case 'facebook':
                    $mdToast.show($mdToast.simple().content("Facebook não vinculado").position('bottom right').hideDelay(3000));
                break;
            }
            $scope.loginform.$setPristine();
            $scope.load = false
            $scope.$apply()
        };
    })
        //login facebook
    $scope.fboauth = function() {
        FB.login(function(r) {
                console.log(r)
            if (r.authResponse) {
                socket.emit("login_facebook", r.authResponse.accessToken, $rootScope.aut);
            }
        }, {
            scope: 'public_profile,email'
        });
    }

    $scope.autorizar = function(aut, empresa, cidade) {
        $scope.barload = true
        localStorage.eid = aut
        localStorage.empresa = empresa
        localStorage.cidade = cidade
        $rootScope.aut = {
            'empresa': localStorage.empresa,
            'cidade': localStorage.cidade,
            'eid': localStorage.eid,
            'uid': localStorage.uid,
            'nome': localStorage.nome
        }
        $state.go("vpad.cliente");
    }
    if ('eid' in localStorage) {
        $state.go('vpad.cliente');
    } else {
        angular.element(document).ready(function() {
            $rootScope.megabigload = true
            $scope.$apply()
        });
    }
})