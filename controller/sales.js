app.controller('sales', function($scope, $rootScope) {
    $scope.text = $rootScope.i18n

    $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    $scope.query = {
        order: '',
        limit: 10,
        page: 1
    };
    var date = new Date();
    $scope.data_filter = {
        "start": new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        "end": new Date(),
    }
    $scope.pre_date_select = 'hoje'
    $scope.recharge = function() {
        $rootScope.socket.emit("fetch_pdv", $rootScope.aut, $scope.data_filter)
    }
    $scope.pre_date = function() {
        console.log($scope.pre_date_select)
        switch ($scope.pre_date_select) {
            case 'hoje':
                $scope.data_filter = {
                    "start": new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    "end": new Date(),
                }
                $scope.recharge()
                console.log($scope.data_filter)
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
                console.log($scope.data_filter)
                break;
            case 'mes':
                $scope.data_filter = {
                    "start": new Date(date.getFullYear(), date.getMonth(), 1),
                    "end": new Date(),
                }
                $scope.recharge()
                console.log($scope.data_filter)
                break;
        }

    }
    $rootScope.socket.emit("fetch_pdv", $rootScope.aut, $scope.data_filter)
    $rootScope.socket.removeListener("fetch_pdv")
    $rootScope.socket.on("fetch_pdv", function(data) {
        $scope.pdv = data
        $scope.$apply()
    })
    $rootScope.socket.removeListener("fetch_pdv_chart")
    $rootScope.socket.on("fetch_pdv_chart", function(data) {
        console.log(data)
        $scope.labels = []
        $scope.ind = []
        $scope.total = 0
        $scope.produtos = 0
        angular.forEach(data, function(v, k) {
            $scope.labels.push("Dia " + v._id)
            $scope.ind.push(v.valor)
            $scope.total += v.valor
            $scope.produtos += v.produtos
        })
        $scope.startchart($scope.labels, $scope.ind)
    })


    Chart.defaults.global.defaultFontFamily = "'Roboto,Helvetica Neue,sans-serif";
    Chart.defaults.global.defaultFontSize = 14;


    $scope.startchart = function(lb, ind) {
        var ctx = document.getElementById("myChart");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: lb,
                datasets: [{
                    label: 'Valor das vendas no dia',
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
                }
            }
        });
    }

})