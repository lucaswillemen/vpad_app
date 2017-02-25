app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider, $mdDateLocaleProvider) {

    $mdDateLocaleProvider.parseDate = function(dateString) {
      var m = moment(dateString, 'DD/MM/YYYY', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };

    $mdDateLocaleProvider.formatDate = function(date) {
      var m = moment(date);
      return m.isValid() ? m.format('DD/MM/YYYY') : '';
    };

    $mdThemingProvider.theme('default')
        .backgroundPalette('grey', {
            'default': '200'
        })
        .primaryPalette('light-blue', {
            'default': '600'
        })
        .warnPalette('red', {
            'default': '500'
        })
    $mdThemingProvider.theme('dark').dark()
        .backgroundPalette('grey', {
            'default': '100'
        })
    $stateProvider
        .state('login', {
            url: "/login",
            views: {
                //"painel": { templateUrl: "template/root/panel/panel.html?"+ window.version, controller: "painel"} ,
                "root": {
                    templateUrl: "template/root/login.html?" + window.version,
                    controller: "login"
                }
            }
        })
        .state('webchat', {
            url: "/webchat",
            views: {
                //"painel": { templateUrl: "template/root/panel/panel.html?"+ window.version, controller: "painel"} ,
                "root": {
                    templateUrl: "template/root/webchat.html?" + window.version,
                    controller: "home"
                }
            }
        })
        .state('register', {
            url: "/register",
            views: {
                //"painel": { templateUrl: "template/root/panel/panel.html?"+ window.version, controller: "painel"} ,
                "root": {
                    templateUrl: "template/root/register.html?" + window.version,
                    controller: "register"
                }
            }
        })
        .state('vpad', {
            abstract: true,
            url: "/vpad",
            views: {
                "menu": {
                    templateUrl: "template/vpad/menu/menu.html?" + window.version,
                    controller: "menu"
                },
                "painel": {
                    templateUrl: "template/vpad/panel/panel.html?" + window.version,
                    controller: "painel"
                },
                "root": {
                    templateUrl: "template/vpad/root.html?" + window.version,
                    controller: "vpad as vm"
                }
            }
        })
        .state('vpad.report_sales', {
            url: "/report/sales",
            views: {
                "view": {
                    templateUrl: "template/vpad/report/sales.html?" + window.version,
                    controller: "sales"
                }
            }
        })
        .state('vpad.cliente', {
            url: "/customers",
            views: {
                "view": {
                    templateUrl: "template/vpad/cliente.html?" + window.version,
                    controller: "cliente"
                }
            }
        })
        .state('vpad.usuario', {
            url: "/users",
            views: {
                "view": {
                    templateUrl: "template/vpad/usuario.html?" + window.version,
                    controller: "usuario"
                }
            }
        })
        .state('vpad.monitoring', {
            url: "/monitoring/:id",
            views: {
                "view": {
                    templateUrl: "template/vpad/monitoring.html?" + window.version,
                    controller: "monitoring"
                }
            }
        })
        .state('vpad.os', {
            url: "/os",
            views: {
                "view": {
                    templateUrl: "template/vpad/os.html?" + window.version,
                    controller: "os"
                }
            }
        })
        .state('vpad.service', {
            url: "/service",
            views: {
                "view": {
                    templateUrl: "template/vpad/service.html?" + window.version,
                    controller: "service"
                }
            }
        })
        .state('vpad.vendor', {
            url: "/vendor",
            views: {
                "view": {
                    templateUrl: "template/vpad/fornecedor.html?" + window.version,
                    controller: "fornecedor"
                }
            }
        })
        .state('vpad.produto', {
            url: "/products",
            views: {
                "view": {
                    templateUrl: "template/vpad/produto.html?" + window.version,
                    controller: "produto"
                }
            }
        })
        .state('vpad.newservice', {
            url: "/newservice",
            views: {
                "view": {
                    templateUrl: "template/vpad/newservice.html?" + window.version,
                    controller: "newservice"
                }
            }
        })
        .state('vpad.pdv', {
            url: "/pdv",
            views: {
                "view": {
                    templateUrl: "template/vpad/pdv.html?" + window.version,
                    controller: "pdv"
                }
            }
        })
        .state('vpad.develop', {
            url: "/develop",
            views: {
                "view": {
                    templateUrl: "template/vpad/develop.html?" + window.version,
                    controller: "develop"
                }
            }
        })
        .state('vpad.cashflow', {
            url: "/cashflow",
            views: {
                "view": {
                    templateUrl: "template/vpad/cashflow.html?" + window.version,
                    controller: "cashflow"
                }
            }
        })
        .state('vpad.payment', {
            url: "/payment",
            views: {
                "view": {
                    templateUrl: "template/vpad/payment.html?" + window.version,
                    controller: "payment"
                }
            }
        })
        .state('vpad.invoice', {
            url: "/invoice",
            views: {
                "view": {
                    templateUrl: "template/vpad/invoice.html?" + window.version,
                    controller: "invoice"
                }
            }
        })
    $urlRouterProvider.otherwise("/login")
    $locationProvider.html5Mode(true);
})