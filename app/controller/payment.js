app.controller("payment", function($scope, $localStorage, $rootScope, $filter, $httpParamSerializerJQLike, $state, $mdToast) {
    //$scope.user_dados = $localStorage.user.dados
    $scope.data = {}
    $scope.card_d = null
    $scope.data.email = $localStorage.perfil.dados.email
    $scope.data.cpf = $localStorage.perfil.dados.cpfcnpj
    $scope.data.titular = $localStorage.perfil.dados.nome
    $scope.user_dados = $localStorage.perfil.dados

    $scope.step = 'info'
    $scope.today = new Date()


    $scope.data.card = 4235647728025682
    Mercadopago.setPublishableKey("TEST-b135d529-8498-4fe3-b3e3-d7fc43ce5ce4");
    Mercadopago.clearSession();

    $rootScope.socket.emit("abrir_fatura", $rootScope.aut)
    $rootScope.socket.removeListener("fatura")
    $rootScope.socket.on("fatura", function(res, desc) {
        setTimeout(function() {
            $scope.data.valor = desc.value
            $scope.data.desc = desc.desc
            $scope.data.vencimento = desc.vencimento
            $scope.start = true
            $scope.$apply()
        }, 2000);
    })


    $scope.test_card = function() {
    $scope.load_card_prog=true
        var c = $filter('limitTo')($scope.data.card, 6)
        Mercadopago.getInstallments({
            bin: c,
            amount: $scope.data.valor
        }, function(r, s) {
            $scope.load_card_prog=false
            if (r === 400) {
                $scope.data.card = ''
                $mdToast.show($mdToast.simple().content("Cartão inválido").position('bottom right').hideDelay(2000));
                $scope.$apply()  
            }else{
                $scope.card_d = s
                $scope.data.parc = s[0].payer_costs[0].installment_amount
                $scope.$apply()                
            }
        })
    }
    $scope.pay = function() {
        $scope.load_card_prog2=true
        var element = document.getElementById('formPayment');
        Mercadopago.createToken(element, function(e, r) {
            if (r.error) {} else {
                $scope.send_pay = {
                    "val": $scope.data.valor,
                    "installments": $scope.data.parc,
                    "token": r.id,
                    "desc": $scope.data.desc,
                    "payment_method_id": $scope.card_d[0].payment_method_id,
                    "payer": {
                        "email": $scope.data.email
                    }
                }
                $scope.step = 'confirm'
                $scope.response_mp = r
                $scope.$apply()
            }
        })
    }
    $scope.submit_pay = function() {
            $rootScope.socket.emit("pay", $scope.send_pay, $rootScope.aut)
            $rootScope.socket.removeListener("confirm_pay")
            $rootScope.socket.on("confirm_pay", function(r) {
                if (r.error != 'refused') {
                    swal({
                        title: "Compra aprovada!",
                        text: "Parabéns, seu pagamento foi aprovado, obrigado por utilizar o nosso sistema.",
                        type: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Fechar',
                        confirmButtonClass: 'md-button md-raised md-primary',
                        buttonsStyling: false,
                        allowOutsideClick: false
                    }).then(
                        function() {
                            $rootScope.betaVersion = false
                            $rootScope.proxima_fatura_dias = false
                            $rootScope.proxima_fatura_hoje = false
                            $rootScope.vencida_fatura_dias = false
                            $rootScope.block = false
                            $scope.$apply()
                            $state.go("vpad.invoice")
                        }
                    )
                } else {
                    swal({
                        title: "Compra reprovada!",
                        text: "Ops, alguma coisa deu errado, tente novamente efetuar seu pagamento.",
                        type: 'error',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Fechar',
                        confirmButtonClass: 'md-button md-raised md-primary',
                        buttonsStyling: false,
                        allowOutsideClick: false
                    }).then(
                        function() {
                            $state.reload();
                        }
                    )
                }

                $scope.load_show = false
                $scope.$apply()
            })
        }
        //
})