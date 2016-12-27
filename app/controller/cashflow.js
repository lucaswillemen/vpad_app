app.controller('cashflow', function($scope, $rootScope, $mdDialog, $document) {

    $rootScope.promise_table()


    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };
    var date = new Date();
    $scope.data_filter = {
        "start": new Date(date.getFullYear(), date.getMonth(), 1),
        "end": new Date(date.setHours(24,0,0,0)),
    }
    console.log(new Date(date.getFullYear(), date.getMonth(), 1))
    $scope.pre_date_select = 'mes'
    $scope.recharge = function() {
        $rootScope.socket.emit("fetch_financeiro", $rootScope.aut, $scope.data_filter)
    }
    $scope.pre_date = function() {
        switch ($scope.pre_date_select) {
            case 'hoje':
                $scope.data_filter = {
                    "start": new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    "end": new Date(),
                }
                $scope.recharge()
                break;
            case 'semana':
                d = new Date();
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -7 : 0); // adjust when day is sunday
                $scope.data_filter = {
                    "start": new Date(d.setDate(diff)),
                    "end": new Date(),
                }
                $scope.recharge()
                break;
            case 'mes':
                $scope.data_filter = {
                    "start": new Date(date.getFullYear(), date.getMonth(), 1),
                    "end": new Date(),
                }
                $scope.recharge()
                break;
        }

    }
    $rootScope.socket.emit("fetch_financeiro", $rootScope.aut, $scope.data_filter)
    $rootScope.socket.removeListener("fetch_pdv")
    $rootScope.socket.on("fetch_financeiro", function(data) {
        $scope.pdv = data
        $rootScope.promise_table()
        $scope.receita = 0
        $scope.despesa = 0
        $scope.total = 0
        angular.forEach(data, function(v, k) {
            $scope.total += v.data.valor
            if (v.data.valor > 0) {
                $scope.receita += v.data.valor 
            }else{
                $scope.despesa += v.data.valor                 
            }
            $scope.$apply()
        })
    })
    $rootScope.socket.removeListener("fetch_financeiro_chart")
    $rootScope.socket.on("fetch_financeiro_chart", function(data) {
        $scope.labels = []
        $scope.ind = []
        angular.forEach(data, function(v, k) {
            $scope.labels.push("Dia " + v._id)
            $scope.ind.push(v.valor)
        })
        $scope.startchart($scope.labels, $scope.ind)
    })
    $scope.startchart = function(lb, ind) {
        var ctx = document.getElementById("myChart");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: lb,
                datasets: [{
                    data: ind,
                    backgroundColor: 'rgba(3, 155, 229, 0.5)',
                    borderColor: 'rgb(3, 155, 229)',
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return "Valor da movimentação do dia: R$ "+ tooltipItem.yLabel.toFixed(2);
                        }
                    }
                }
            }
        });
    }
    $scope.print = function(print) {

        $scope.query.limit = $scope.pdv.length
        setTimeout(function() {
            window.print();
        }, 100);

    };
    $scope.movimentarfluxo = function(ev, mode) {
        if (mode == 'adicionar') {
            $scope.data_mov_text = {
                tipe: mode,
                title: "Adicionar dinheiro",
                filed: "Valor a ser adicionado"
            }            
        }else{
            $scope.data_mov_text = {
                tipe: mode,
                title: "Retirar dinheiro",
                filed: "Valor a ser retirado"
            } 
        }
        $scope.data_mov = {
            valor: 0,
            desc: ""
        }
        $mdDialog.show({
            contentElement: '#movimentar',
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true
        });
    };
    $scope.movimentar = function(){
        if ($scope.data_mov_text.tipe == 'adicionar'){}else{                
            $scope.data_mov.valor = 0 - $scope.data_mov.valor
        }
        $rootScope.socket.emit("enviar_financeiro", $rootScope.aut, $scope.data_mov)
    }
    $rootScope.socket.removeListener("enviar_financeiro")
    $rootScope.socket.on("enviar_financeiro", function(res){
        $scope.recharge()
        $rootScope.cancel()
    })
})