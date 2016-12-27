var app = angular.module('vPadApp', [
    'ngAnimate', 
    'ngMessages', 
    'ngMaterial',
    'ui.router',
    'md.data.table', 
    'ngStorage', 
    'flow', 
    'ngGlue', 
    'ui.utils.masks'
    ]);

//App principal
app.controller('Main', function($scope,$rootScope,$timeout,$http,$state,$mdDialog) {
    
    //Variáveis
    $rootScope.socket = io.connect(window.ws, {secure: true})
    $rootScope.cancel = function() {$mdDialog.cancel();};
    $rootScope.aut = {
        'empresa': localStorage.empresa,
        'cidade': localStorage.cidade,
        'eid': localStorage.eid, 
        'uid':localStorage.uid, 
        'nome': localStorage.nome
    }
    $rootScope.promise_table =  function promise_table(){$scope.promise_table = $timeout(function () {}, 2000);}
   

    //Tradução
    $http.get('languages/brazil.json?1')
    .then(function(d){
        $rootScope.i18n=d.data
    })



    //Ao retornar reconectar
    $rootScope.socket.on('reconnect', function() {
        console.log('Reconectado!')       
    })
    //Ao retornar um erro na conexão
    $rootScope.socket.removeListener("connect_error");
    $rootScope.socket.on('connect_error', function() {
    });

});
app.config(function($mdIconProvider) {
  $mdIconProvider
    .defaultIconSet('src/icons/mdi.svg')
});
