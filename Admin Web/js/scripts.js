angular.module('revista-consumidor-admin', ['ngMaterial','ui.router','firebase'])

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('grey');
$mdThemingProvider.theme('side')
    .primaryPalette('red')
    .backgroundPalette('grey', {
        'default':'700'
    })
})

.config(function($stateProvider, $urlRouterProvider) {

$stateProvider

.state('publicar', {
    url: '/publicar',
    templateUrl: 'templates/publicar.html',
	controller: 'PublicarCtrl'
})

.state('editar', {
    url: '/editar',
    templateUrl: 'templates/editar-post.html',
	controller: 'EditarCtrl',
    params: {
        id: null
    }
})

.state('category', {
    url: '/category',
    templateUrl: 'templates/category.html',
	controller: 'CategoryCtrl',
    params: {
        name: null
    }
})

.state('administrar', {
    url: '/administrar',
    templateUrl: 'templates/administrar.html',
	controller: 'AdministrarCtrl'
})

.state('analizar', {
    url: '/analizar',
    templateUrl: 'templates/analizar.html',
	controller: 'AnalizarCtrl'
})

$urlRouterProvider.otherwise('/publicar')

})

.controller("PublicarCtrl", function($scope, $firebaseArray) {
    $scope.posts = $firebaseArray(firebase.database().ref("articles"));
})

.controller("AdministrarCtrl", function($scope, $firebaseArray) {
    $scope.categories = $firebaseArray(firebase.database().ref("categories"));
    $scope.categories2 = {};
    $scope.categories.$loaded().then(function() {
			for(category of $scope.categories) {
				if(category.$id != "_leido" && category.$id != "_reciente" && category.$id != "_estudios")
			$scope.categories2[category.$id] = category;
			}
		});
        $scope.removeCat = function(ref) {
            $scope.categories.$remove(ref).then(function(){
                $scope.categories2 = {};
                for(category of $scope.categories) {
				if(category.$id != "_leido" && category.$id != "_reciente" && category.$id != "_estudios")
			    $scope.categories2[category.$id] = category;
                }
            })

        }
})

.controller("AnalizarCtrl", function($scope) {

})

.controller("EditarCtrl", function($scope, $stateParams, $firebaseObject, $mdToast, $state, $firebaseArray) {

    if($stateParams.id != null) {
        $scope.article = $firebaseObject(firebase.database().ref("articles").child($stateParams.id));
        $scope.title = "Actualizar publicación";
    } else {
        $scope.article = {};
        $scope.title = "Crear publicación";
    }
    $scope.categories = $firebaseArray(firebase.database().ref("categories"));
    $scope.categories3 = $firebaseObject(firebase.database().ref("categories"));
    $scope.categories2 = {};
    $scope.categories.$loaded().then(function() {
			for(category of $scope.categories) {
				if(category.$id != "_leido" && category.$id != "_reciente" && category.$id != "_estudios")
			$scope.categories2[category.$id] = category;
			}
		});
    $scope.guardar = function() {
        if($stateParams.id != null) {
            $scope.article.$save().then(function() {
                
                if($scope.categories3[$scope.article.cat]["articles"]==null || $scope.categories3[$scope.article.cat]["articles"][$scope.article.$id] == null) {
                    var obj= $firebaseObject(firebase.database().ref("categories").child($scope.article.cat).child("articles"));
                    obj.$loaded().then(function() {
                        obj[$scope.article.$id] = true;
                        obj.$save();
                    })
                
            }
                $mdToast.show($mdToast.simple().textContent('Actualizado!'));
                $state.go("publicar");
            });
        } else {
            var timestamp = (new Date()).getTime();
            $scope.articles = $firebaseObject(firebase.database().ref("articles"))
            $scope.articles.$loaded().then(function() {
                $scope.articles[timestamp] = $scope.article;
                $scope.articles.$save().then(function() {
                    
                
                    var obj = $firebaseObject(firebase.database().ref("categories").child($scope.article.cat).child("articles"));
                    obj.$loaded().then(function() {
                        obj[timestamp] = true;
                        obj.$save();
                    })
                
            
                    $mdToast.show($mdToast.simple().textContent('Publicado!'));
                    $state.go("publicar");
                });
            });
        }
    };
})

.controller("CategoryCtrl", function($scope, $stateParams, $firebaseObject, $mdToast, $state) {

    if($stateParams.name != null) {
        $scope.category = $firebaseObject(firebase.database().ref("categories").child($stateParams.name));
        $scope.title = "Actualizar categoría";
        $scope.id = $scope.category.$id;
    } else {
        $scope.category = {
            image: true
        };
        $scope.title = "Crear categoría";
    }
    
            $scope.categories = $firebaseObject(firebase.database().ref("categories"))
    $scope.guardar = function() {
        if($stateParams.name != null) {
            $scope.categories.$loaded().then(function() {
                $scope.categories[$scope.category.$id] = null;
                $scope.categories[$scope.id] = $scope.category;
                $scope.categories.$save().then(function() {
                    $mdToast.show($mdToast.simple().textContent('Actualizada!'));
                    $state.go("administrar");
                });
            });
        } else {
            $scope.categories.$loaded().then(function() {
                $scope.categories[$scope.id] = $scope.category;
                $scope.categories.$save().then(function() {
                    $mdToast.show($mdToast.simple().textContent('Creada!'));
                    $state.go("administrar");
                });
            });
        }
    };
})

.controller("AdminCtrl", function($scope, $state) {
    $scope.activeTab = {
            one: true,
            two: false,
            three: false
        }
    
    $scope.goPublicar = function() {
        $state.go("publicar");
        $scope.activeTab = {
            one: true,
            two: false,
            three: false
        }
    }

    $scope.goAdministrar = function() {
        $state.go("administrar");
        $scope.activeTab = {
            one: false,
            two: true,
            three: false
        }
    }

    $scope.goAnalizar = function() {
        $state.go("analizar");
        $scope.activeTab = {
            one: false,
            two: false,
            three: true
        }
    }

    $scope.goEditar = function(id) {
        
        $state.go("editar", {id: id});
        $scope.activeTab = {
            one: true,
            two: false,
            three: false
        }
    }

    $scope.goCategory = function(name) {
        
        $state.go("category", {name: name});
        $scope.activeTab = {
            one: false,
            two: true,
            three: false
        }
    }
})