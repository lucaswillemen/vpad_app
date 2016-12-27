app.controller('vpad', function($scope, $timeout, $rootScope, $filter, $http, $localStorage, $mdSidenav, $mdToast, $mdDialog, $state, $anchorScroll) {
    
    var socket = $rootScope.socket
    $rootScope.atualizar_texto = function() {
        $scope.person_text = {
            "nome": $localStorage.perfil.dados.nome,
            "email": $localStorage.perfil.dados.email,
            "foto": $localStorage.perfil.dados.foto
        }
        $scope.dados_user = $localStorage.perfil
    }
    $scope.aut_uid = localStorage.uid
    $scope.dados = $localStorage.perfil
    $scope.dados_user = $localStorage.perfil

    //Sidebars
    $scope.buildToggler = function(navID) {
        $mdSidenav(navID).toggle()
    }
    $rootScope.$on('$viewContentLoading', function(){
        $mdSidenav('painelprincipal').close()
    })

    //Confirma autorização pelo server
    socket.removeListener("confirma_aut");
    socket.on("confirma_aut", function(data) {
        $rootScope.validaEmpresa(data)
        $rootScope.megabigload = true
        $scope.$apply()
        socket.emit("read_last_msg", $rootScope.aut)
    })

    $rootScope.validaEmpresa = function(data){
        if (!data.dados.ativado) {
            $rootScope.betaVersion = true
            var date1 = new Date(data.dataregistro);
            var date2 = new Date();
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            $rootScope.remaning = 10 - diffDays;
            if ($rootScope.remaning < 0) {
                $rootScope.block = true
                $state.go("vpad.payment")
            }
        }else{
            var date1 = new Date(data.dados.proxima_fatura)
            date1.setHours(23,59,0,0)
            var date2 = new Date();
            var timeDiff = date2.getTime() - date1.getTime();
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));  
            //Aviso de fatura que ainda vai vencer     
            if (diffDays > -7 && diffDays <= 0) {
                $rootScope.proxima_fatura_dias = diffDays
                $rootScope.proxima_fatura_data = date1
            }       
            //Se a fatura vencer hoje
            if (diffDays == -0) {
                $rootScope.proxima_fatura_hoje = "Hoje"

            }
            //Aviso de fatura já vencida
            if (diffDays > 0) {
                if (diffDays >= 7) {
                    $rootScope.block = true
                    $state.go("vpad.payment")
                }else{
                    $rootScope.aviso_block = 7 - diffDays
                }
                $rootScope.vencida_fatura_dias = diffDays
                $rootScope.vencida_fatura_data = date1
            }   
        }
    }

    //Quando o usuário se conectar enviar notificação
    socket.removeListener("usuario_logou");
    socket.on('usuario_logou', function(bus, nome) {
        var i = 0
        angular.forEach(bus, function(v) {
            i++
        })
        $scope.user_online = bus
        $scope.user_online_count = i
        $scope.$apply()
        if (nome != undefined) {
            $mdToast.show($mdToast.simple().content(nome + " está online!").position('bottom right').hideDelay(2000));
        };
    })

    //Quando o cliente se conectar enviar notificação
    socket.removeListener("cliente_logou");
    socket.on('cliente_logou', function(client_room, nome) {
        var i = 0
        angular.forEach(client_room, function(v) {
            i++
        })
        $scope.client_online = client_room
        $scope.client_online_count = i
        $scope.$apply()
        if (nome != undefined) {
            $mdToast.show($mdToast.simple().content("Cliente " + nome + " está online!").position('bottom right').hideDelay(2000));
        };
    })



    //REVER ESSA BUDEGA
    //Quando receber uma nova atividade
    socket.removeListener("atividade");
    $rootScope.socket.on("atividade", function(act, data) {
        //Dados recebidos 

        //Verifica se o retorno foi de só 1 resposta
        if (act == 'new') {
            //Se foi único, insere no scope.
            if (!$scope.atividade) {
                $scope.atividade = []
            }
            $scope.atividade.push(data[0])
            $scope.atividade.count++
        } else {
            //Se não veririca toda a array
            //Verifica se existe o cache pra varrer
            if ('atividade' in $localStorage) {
                var lastday = $localStorage.atividade[$localStorage.atividade.length - 1].dataregistro
                var i = 0
                angular.forEach(data, function(v, k) {
                    if (v.dataregistro > lastday) {
                        i++
                    };
                })
            } else {
                i = data.length
            }
            $scope.atividade = data
            $scope.atividade.count = i
        }
        $scope.getlasthighlighatividade++
            $scope.$apply()
    })

    //Gravar atividade em cache
    $scope.leratividade = function() {
        $localStorage.atividade = $scope.atividade
        $scope.getlasthighlighatividade = $scope.atividade.count
        $scope.atividade.count = 0
    }


    //login facebook
    $scope.fblogin = function() {
        FB.login(function(r) {
            if (r.authResponse) {
                socket.emit("vincular_facebook", r.authResponse.accessToken, $rootScope.aut);
            }
        }, {
            scope: 'public_profile,email'
        });
    }

    socket.removeListener("vincular_facebook");
    socket.on("vincular_facebook", function(data) {
        $localStorage.perfil = data
        $rootScope.atualizar_texto()
        $scope.$apply()
    })
    



    $scope.data = {
        'msg': ""
    }


    $scope.vclient_send = function() {
        if ($scope.data.msg != "") {
            $scope.sending_msg = true
            $scope.msg_to_send = {
                "msg": $scope.data.msg,
                "nome": $rootScope.aut.nome,
                "type": "txt"
            }
            socket.emit("send_msg", $scope.msg._id, $scope.msg_to_send);

            socket.emit("mark_last_view", $rootScope.aut, $scope.msg._id)
            $scope.data.msg = ""
        };
        //socket.emit("vclient_client", "first", $scope.data.dados);
    }

    $scope.completeUpload = function(file, resp) {
        $scope.msg_to_send = {
            "msg": "http://api.vectorgray.com.br/chat/uploads/" + angular.fromJson(resp).name,
            "nome": $rootScope.aut.nome,
            "type": "img"
        }
        socket.emit("send_msg", $scope.msg._id, $scope.msg_to_send, localStorage.cid);
        $scope.sending_msg = true
    }



    $scope.message_join = function(id) {
        socket.emit("join_msg", $rootScope.aut, id)
    }

    $scope.message_open = function(id) {
        socket.emit("fetch_msg", $rootScope.aut, id)
        $scope.buildToggler("conversa")
        $scope.msg = ""
        socket.emit("mark_last_view", $rootScope.aut, id)
    }

    socket.removeListener("fetched_msg");
    socket.on("fetched_msg", function(result) {
        $scope.msg = result
        $scope.$apply();

    })

    socket.removeListener("joing_msg");
    socket.on("joing_msg", function(result) {
        //$scope.buildToggler('conversa')
        angular.forEach($scope.conversas, function(v, k) {
            if (v._id == result._id) {
                $scope.conversas[k] = result
                $scope.$apply()
            };
        })
    })

    socket.removeListener("response_msg");
    socket.on("response_msg", function(msg, result) {
        if ($scope.msg) {
            if ('_id' in $scope.msg) {
                if (result._id == $scope.msg._id) {
                    $scope.msg.msg.push(msg)
                    $scope.sending_msg = false
                }
            }
        }
        var a = false
        angular.forEach($scope.conversas, function(v, k) {
            if (v._id == result._id) {
                a = true
                $scope.conversas[k].msg.push(msg)
                $scope.conversas[k].last_update = new Date().toISOString()
                $scope.$apply()
            };
        });
        if (a == false) {
            $scope.conversas.push(result)
            $scope.$apply()
        };
    })
    socket.removeListener("response_last_view")
    socket.on("response_last_view", function(result) {
        angular.forEach($scope.conversas, function(v, k) {
            if (v._id == result._id) {
                if (!$scope.conversas[k].last_views) {
                    $scope.conversas[k].last_views = {}
                    $scope.conversas[k].last_views[localStorage.uid] = new Date().toISOString()
                } else {
                    $scope.conversas[k].last_views[localStorage.uid] = new Date().toISOString()
                }
            }
        })
    })
    $scope.conversas_counter = 0
    $scope.counter_msg = function() {
        //$scope.conversas_counter++
        return true
    }


    $rootScope.popupaddNovoCliente = function() {
        $mdDialog.show({
            controller: add,
            templateUrl: 'template/vpad/modal/add_cliente.html?' + window.version,
            ariaLabel: 'Publicação',
            clickOutsideToClose: true
        })

        function add($scope, $rootScope, $mdDialog, $localStorage) {

            //Socket CORE            
            var socket = $rootScope.socket
            $scope.text = $rootScope.i18n
            $scope.cancel = $rootScope.cancel

            //Verifica se existe o cliente
            $scope.verifica = function() {
                    socket.emit('table_mgmt', 'cliente', 'search', $rootScope.aut, $scope.data.dados)
                    $localStorage.tb_cliente.forEach(function(k, v) {
                        if ($scope.data.dados.email == k.dados.email) {
                            $scope.jaexiste = true
                        };
                    })
                }
                //Se o cliente existir, adicionar?
            $scope.addCliente = function() {
                    socket.emit('table_mgmt', 'cliente', 'add', $rootScope.aut, $scope.dbid)
                    $scope.addload = true
                        //$mdDialog.cancel()
                }
                //Cliente não cadastrado, criar um novo
            $scope.novoCliente = function() {
                socket.emit("table_mgmt", 'cliente', 'create', $rootScope.aut, $scope.data.dados)
            }

            //Recebe a pesquisa do clientte
            socket.removeListener("confirma_pesquisa_cliente");
            socket.on('confirma_pesquisa_cliente', function(res, data) {
                if (res.act == 'yes') {
                    $scope.dbid = data._id
                    $scope.cadastro2 = true
                    $scope.data = data
                    $scope.$apply()
                } else {
                    $scope.cadastro3 = true
                    $scope.$apply()
                }
            })
        }
    }




    if ('eid' in localStorage) {
        socket.emit("join", $rootScope.aut)
        $rootScope.atualizar_texto()
    } else {
        //$rootScope.megabigload = true
        $state.go("login")
    };


    $scope.btn_perfil = function(ev) {
        $mdDialog.show({
            templateUrl: 'template/vpad/modal/perfil.html?' + window.version,
            targetEvent: ev,
            ariaLabel: 'Publicação',
            clickOutsideToClose: true,
            controller: function($scope, $localStorage, $rootScope, $mdDialog) {

                $scope.text = $rootScope.i18n
                var socket = $rootScope.socket
                $scope.data_perfil = $localStorage.perfil
                $scope.cancel = $rootScope.cancel
                $scope.completeUpload = function(file, resp) {
                    $scope.data_perfil.dados.foto = "http://api.vectorgray.com.br/chat/uploads/" + angular.fromJson(resp).name
                }

                $scope.cep = function() {
                    $http.get('https://viacep.com.br/ws/' + $scope.data_perfil.dados.cep + '/json/ ')
                        .then(function(res) {
                            $scope.data_perfil.dados.cidade = res.data.localidade
                            $scope.data_perfil.dados.estado = res.data.uf
                            $scope.data_perfil.dados.logradouro = res.data.logradouro
                            $scope.data_perfil.dados.bairro = res.data.bairro

                        });
                }

                var datanascimento = new Date($scope.data_perfil.dados.nascimento)
                    //Se a data for válida...
                if (isNaN(datanascimento.getTime())) {
                } else {
                    $scope.data_perfil.dados.nascimento = datanascimento
                }

                $scope.AtualizarPerfil = function() {
                    $rootScope.socket.emit("update_profile", $rootScope.aut, $scope.data_perfil)
                }
                socket.on("updated_profile", function() {
                    $rootScope.cancel()
                    $rootScope.atualizar_texto()
                })
            }
        })
    }

    function translate_menu() {
        $scope.menu = {}
        $scope.menu.dashboard = [{
                nome: $rootScope.i18n.menu.dashboard.users,
                link: "vpad.usuario"
            }, {
                nome: $rootScope.i18n.menu.dashboard.fatura,
                link: "vpad.invoice"
            }
            /*, {
                nome: $rootScope.i18n.menu.registers.carrier,
                ico: "swap_calls",
                link: "transportadora"
            }*/
        ]
        $scope.menu.cadastro = [{
                nome: $rootScope.i18n.menu.registers.customer,
                ico: "group",
                link: "vpad.cliente"
            }, {
                nome: $rootScope.i18n.menu.registers.product,
                ico: "desktop_windows",
                link: "vpad.produto"
            }, {
                nome: $rootScope.i18n.menu.registers.service,
                ico: "work",
                link: "vpad.service"
            }, {
                nome: $rootScope.i18n.menu.registers.vendor,
                ico: "languages",
                link: "vpad.vendor"
            }
            /*, {
                nome: $rootScope.i18n.menu.registers.carrier,
                ico: "swap_calls",
                link: "transportadora"
            }*/
        ]
        $scope.menu.cadastro.nome = $rootScope.i18n.menu.registers.name
        $scope.menu.operacional = [/*{
            nome: $rootScope.i18n.menu.operational.purchases,
            ico: "shopping_basket",
            link: "compra"
        }, {
            nome: $rootScope.i18n.menu.operational.os,
            ico: "build",
            link: "vpad.os"
        }, */{
            nome: $rootScope.i18n.menu.operational.pos,
            ico: "card_travel",
            link: "vpad.pdv"
        }]
        $scope.menu.operacional.nome = $rootScope.i18n.menu.operational.name




        $scope.menu.financeiro = [/*{
            nome: $rootScope.i18n.menu.accounting.toreceive,
            ico: "assessment",
            link: "contas_receber"
        }, {
            nome: $rootScope.i18n.menu.accounting.topay,
            ico: "assignment",
            link: "contas_pagar"
        },*/ {
            nome: $rootScope.i18n.menu.accounting.flux,
            ico: "equalizer",
            link: "vpad.cashflow"
        }]
        $scope.menu.financeiro.nome = $rootScope.i18n.menu.accounting.name

        $scope.menu.relatorio = [/*{
            nome: $rootScope.i18n.menu.report.customer,
            ico: "group",
            link: "cliente"
        }, {
            nome: $rootScope.i18n.menu.report.product,
            ico: "desktop_windows",
            link: "produto"
        }, {
            nome: $rootScope.i18n.menu.report.service,
            ico: "work",
            link: "servico"
        }, */{
            nome: $rootScope.i18n.menu.report.sales,
            ico: "shopping_cart",
            link: "vpad.report_sales"
        }/*, {
            nome: $rootScope.i18n.menu.report.cash,
            ico: "equalizer",
            link: "fluxocaixa"
        }, {
            nome: $rootScope.i18n.menu.report.account,
            ico: "assignment",
            link: "contas_pagar"
        }, */]
        $scope.menu.relatorio.nome = $rootScope.i18n.menu.report.name
        $scope.menu.vsync = [{
            nome: "Portfólio",
            ico: "portrait",
            link: "portfolio"
        }, {
            nome: "Vídeos",
            ico: "ondemand_video",
            link: "video"
        }, {
            nome: "Blog",
            ico: "comment",
            link: "blog"
        }, {
            nome: "Documentação",
            ico: "folder_shared",
            link: "documento"
        }]
    }
    translate_menu()
    $scope.panel = $rootScope.i18n.painel.panel
    $scope.logout = function() {
        localStorage.clear()
        window.location.reload()
    }
    if (window.nv == 4) {
        $scope.perm = {
            relatorio: true,
            home: true,
            financeiro: true
        }
    };

})
app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown", function(e) {
            if (e.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'e': e
                    });
                });
                e.preventDefault();
            }
        });
    };
});