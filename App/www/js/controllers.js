angular.module('app.controllers', ["firebase"])

	.controller('AppCtrl', function ($scope, $ionicPopup, $ionicModal, $ionicSideMenuDelegate, $state, $rootScope, $firebaseArray, $firebaseAuth, $firebaseObject) {

		$scope.updateAuth = function() {
		if(firebase.auth().currentUser == null && localStorage.uid == null) {
			console.log(1)
			$firebaseAuth().$signInAnonymously().then(function() {
				$scope.user = firebase.auth().currentUser.uid;
				localStorage.uid = firebase.auth().currentUser.uid;
				$scope.anonymous = true;
				$scope.categories = $firebaseArray(firebase.database().ref("users").child($scope.user).child("categories"));
			});
		}

		else if(firebase.auth().currentUser == null && localStorage.uid != null) {
			console.log(2)
			$firebaseAuth().$signInWithCustomToken(localStorage.uid).then(function() {
				$scope.user = firebase.auth().currentUser.uid;
				$scope.anonymous = (firebase.auth().currentUser.isAnonymous);
				$scope.categories = $firebaseArray(firebase.database().ref("users").child($scope.user).child("categories"));
			})

		}
		else {
			console.log(3)
			localStorage.uid = firebase.auth().currentUser.uid;
			$scope.user = firebase.auth().currentUser.uid;
			$scope.anonymous = (firebase.auth().currentUser.isAnonymous);
			$scope.categories = $firebaseArray(firebase.database().ref("users").child($scope.user).child("categories"));
		}
		};

		$scope.updateAuth();

		$firebaseAuth().$onAuthStateChanged($scope.updateAuth);

		$rootScope.$on('$stateChangeSuccess', function (event, current, params, previous) {
			$scope.login = ($state.current.name == "login");
			$scope.main = ($state.current.name == "tab.reciente" || $state.current.name == "tab.leido" || $state.current.name == "tab.estudios");
			$scope.article = ($state.current.name == "article");
			$scope.articleRef = params.article;
			$scope.previous = previous.name;
			$scope.title = params.title;
		});

		$scope.toggleMenu = function () {
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.back = function () {
			if($scope.previous != "saved" && $scope.previous != "feed")
			$state.go($scope.previous);
			else {
				$state.go("tab.reciente");
			}
		};

		$scope.explore = function () {
			$state.go("explore");
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.home = function () {
			$state.go("tab.reciente");
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.firelogin = function () {
			$state.go("login");
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.goprofile = function () {
			$state.go("profile");
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.logout = function () {
			$firebaseAuth().$signOut();
			localStorage.removeItem("uid");
			$ionicPopup.alert({
				title: 'Éxito',
				template: 'Puedes seguir disfrutando de los contenidos de manera anónima.'
			});
			$state.go("tab.reciente");
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.openCustomCategory = function (cat) {
			$state.go("saved", { category: cat, user: $scope.user, title: cat }, { reload: true });
			$ionicSideMenuDelegate.toggleLeft();
		};

		$ionicModal.fromTemplateUrl('templates/bookmark.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
		});
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
		});
		$scope.showModal = function(ref) {
			$scope.modal.show();
			$scope.modal.categories = $firebaseArray(firebase.database().ref("users").child($scope.user).child("categories"));
			$scope.modal.ref = ref;
		};
		$scope.hideModal = function() {
			$scope.modal.hide();
			delete $scope.modal.ref;
		};

		$scope.saveToCategory = function(ref, category) {
			var obj = $firebaseObject(firebase.database().ref("users").child($scope.user).child("categories"));
			obj.$loaded().then(function() {
				if(obj[category] == true) {
					obj[category] = {};
					obj[category][ref] = true;
				} else {
					obj[category][ref] = true;
				}
				obj.$save().then(function() {
					$ionicPopup.alert({
						title: 'Artículo guardado',
						template: 'El artículo quedó guardado.',
						buttons:[{text: "OK", type:"button-assertive"}]
					});
				});
			});
		};

		$scope.createCustomCategory = function() {
			$scope.popup = {};
			$ionicPopup.show({
				title: 'Crear nuevo tema de interés',
				subTitle: 'Ingresa el nombre de tu nuevo tema',
    			scope: $scope,
				template: '<input type="text" ng-model="popup.newCat">',
				buttons: [
					{ text: 'Cancelar' },
					{
						text: 'Crear tema',
						type: 'button-assertive',
						onTap: function(e) {
							if (!$scope.popup.newCat) {
								//don't allow the user to close unless he enters wifi password
								e.preventDefault();
							} else {
								return $scope.popup.newCat;
							}
						}
					}
				]
			}).then(function(res) {
				if(res) {
					var obj = $firebaseObject(firebase.database().ref("users").child($scope.user).child("categories"));
					obj.$loaded().then(function() {
						obj[res] = true;
						obj.$save().then(function() {
							$ionicPopup.alert({
								title: 'Tema guardado',
								template: 'Ya puedes agregar artículos a este tema.',
								buttons:[{text: "OK", type:"button-assertive"}]
							});
						});
					});
					if(!$scope.article) $ionicSideMenuDelegate.toggleLeft();
				}
			});
		};

	})

	.controller('TabsCtrl', function ($scope) {

	})

	.controller('FeedCtrl', function ($scope, $firebaseArray, $firebaseObject, $state, $stateParams, $ionicModal, $ionicPopup) {


		$ionicModal.fromTemplateUrl('templates/bookmark.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
		});
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
		});
		$scope.showModal = function(ref) {
			$scope.modal.show();
			$scope.modal.categories = $firebaseArray(firebase.database().ref("users").child(firebase.auth().currentUser.uid).child("categories"));
			$scope.modal.ref = ref;
		};
		$scope.hideModal = function() {
			$scope.modal.hide();
			delete $scope.modal.ref;
		};

		$scope.saveToCategory = function(ref, category) {
			var obj = $firebaseObject(firebase.database().ref("users").child(firebase.auth().currentUser.uid).child("categories"));
			obj.$loaded().then(function() {
				if(obj[category] == true) {
					obj[category] = {};
					obj[category][ref] = true;
				} else {
					obj[category][ref] = true;
				}
				obj.$save().then(function() {
					$ionicPopup.alert({
						title: 'Artículo guardado',
						template: 'El artículo quedó guardado.',
						buttons:[{text: "OK", type:"button-assertive"}]
					});
				});
			});
		};

		$scope.showArticle = function (ref) {
			$state.go('article', { article: ref }, { reload: true });
		};

		$scope.createCustomCategory = function() {
			$scope.popup = {};
			$ionicPopup.show({
				title: 'Crear nuevo tema de interés',
				subTitle: 'Ingresa el nombre de tu nuevo tema',
    			scope: $scope,
				template: '<input type="text" ng-model="popup.newCat">',
				buttons: [
					{ text: 'Cancelar' },
					{
						text: 'Crear tema',
						type: 'button-assertive',
						onTap: function(e) {
							if (!$scope.popup.newCat) {
								//don't allow the user to close unless he enters wifi password
								e.preventDefault();
							} else {
								return $scope.popup.newCat;
							}
						}
					}
				]
			}).then(function(res) {
				if(res) {
					var obj = $firebaseObject(firebase.database().ref("users").child(firebase.auth().currentUser.uid).child("categories"));
					obj.$loaded().then(function() {
						obj[res] = true;
						obj.$save().then(function() {
							$ionicPopup.alert({
								title: 'Tema guardado',
								template: 'Ya puedes agregar el artículo a este tema.',
								buttons:[{text: "OK", type:"button-assertive"}]
							});
						});
					});
				}
			});
		};

		$scope.articlesRef = $firebaseArray(firebase.database().ref("categories").child($stateParams.category).child("articles"));
		$scope.articles = {};

		$scope.articlesRef.$loaded().then(function() {
			$scope.noArticles = ($scope.articlesRef.length == 0);
			for(articleRef of $scope.articlesRef) {
				var id = articleRef.$id;
				$scope.articles[id] = $firebaseObject(firebase.database().ref("articles").child(id));
			}
		});

	})

	.controller('SavedCtrl', function ($scope, $stateParams, $firebaseObject, $state, $firebaseArray) {
		$scope.fixedCategories = $firebaseArray(firebase.database().ref("categories"));
		$scope.fixedCategories2 = {};
		$scope.fixedCategories.$loaded().then(function() {
			for(category of $scope.fixedCategories) {
				if(category.$id != "_leido" && category.$id != "_reciente" && category.$id != "_estudios")
			$scope.fixedCategories2[category.$id] = category;
			}
		});

		$scope.openCategory = function (cate) {
			$state.go("category", { category: cate, title: cate }, { reload: true });
		};

		$scope.showArticle = function (ref) {
			$state.go('article', { article: ref }, { reload: true });
		};


		$scope.articlesRef = $firebaseArray(firebase.database().ref("users").child($stateParams.user).child("categories").child($stateParams.category));

		$scope.articles = {};

		$scope.articlesRef.$loaded().then(function() {
			$scope.noArticles = ($scope.articlesRef.length == 0);
			for(articleRef of $scope.articlesRef) {
				var id = articleRef.$id;
				$scope.articles[id] = $firebaseObject(firebase.database().ref("articles").child(id));
			}
		});
	})

	.controller('ArticleCtrl', function ($scope, $stateParams, $firebaseObject) {
		$scope.article = $firebaseObject(firebase.database().ref("articles").child($stateParams.article));
	})

	.controller('ExploreCtrl', function ($scope, $firebaseArray, $state, $ionicSideMenuDelegate) {

		$scope.fixedCategories = $firebaseArray(firebase.database().ref("categories"));
		$scope.fixedCategories2 = {};
		$scope.fixedCategories.$loaded().then(function() {
			for(category of $scope.fixedCategories) {
				if(category.$id != "_leido" && category.$id != "_reciente" && category.$id != "_estudios")
			$scope.fixedCategories2[category.$id] = category;
			}
		});

		$scope.openCategory = function (cat) {
			$state.go("category", { category: cat, title:cat }, { reload: true });
		};

	})

	.controller('LoginCtrl', function ($scope, $firebaseAuth, $state, $ionicPopup) {
		$scope.user = {};
		$scope.signIn = function(user) {
			$firebaseAuth().$signInWithEmailAndPassword(user.email, user.password).then(function(auth) {

				$state.go('tab.reciente', null, {reload: true});
				$ionicPopup.alert({
					title: 'Bienvenido',
					template: 'Has ingresado.'
				});
			}, function() {
				$ionicPopup.alert({
					title: 'Error',
					template: 'Favor de volver a intentar.'
				});
			});
		};
	})

	.controller('SignupCtrl', function ($scope, $state, $firebaseAuth, $firebaseObject, $ionicPopup) {
		$scope.data = $firebaseObject(firebase.database().ref("users"));
		$scope.user = {};
		$scope.signUp = function(user) {
			firebase.auth().currentUser.link(firebase.auth.EmailAuthProvider.credential(user.email, user.password)).then(function(userdata) {
				$scope.$parent.$parent.updateAuth();
				$scope.data[userdata.uid]["name"] = user.name;
				$scope.data.$save().then(function() {
					$state.go('tab.reciente', null, {reload: true});
					$ionicPopup.alert({
						title: 'Bienvenido',
						template: 'Has sido registrado.'
					});
				});
			});
		};
	})

	.controller('ProfileCtrl', function ($scope, $firebaseAuth, $firebaseObject) {
		$scope.auth = $firebaseAuth().$getAuth();
		$scope.profile = $firebaseObject(firebase.database().ref("users").child($scope.auth.uid));
	})
