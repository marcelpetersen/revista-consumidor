angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

$ionicConfigProvider.views.maxCache(0);

$stateProvider

.state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
	controller: 'TabsCtrl'
})

.state('tab.leido', {
    url: '/leido',
    views: {
        'tab-leido': {
            templateUrl: 'templates/feed.html',
            controller: 'FeedCtrl'
        }
    },
	params: {
		category: "protected/_leido",
		user: null
	}
})

.state('tab.reciente', {
    url: '/reciente',
    views: {
        'tab-reciente': {
            templateUrl: 'templates/feed.html',
            controller: 'FeedCtrl'
        }
    },
	params: {
		category: "protected/_reciente",
		user: null
	}
})

.state('tab.estudios', {
    url: '/estudios',
    views: {
        'tab-estudios': {
            templateUrl: 'templates/feed.html',
            controller: 'FeedCtrl'
        }
    },
	params: {
		category: "protected/_estudios",
		user: null
	}
})

.state('category', {
    url: '/category',
	templateUrl: 'templates/feed.html',
	controller: 'FeedCtrl',
	params: {
		category: null,
		user: null,
		title: null
	}
})

.state('article', {
    url: '/article',
    templateUrl: 'templates/article.html',
	controller: 'ArticleCtrl',
	params: {
		article: null
	}
})

.state('explore', {
    url: '/explore',
    templateUrl: 'templates/explore.html',
	controller: 'ExploreCtrl',
	params: {
		title: 'Explorar'
	}
})

.state('saved', {
    url: '/saved',
    templateUrl: 'templates/saved.html',
	controller: 'SavedCtrl',
	params: {
		category: null,
		user: null,
		title: null
	}
})

.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
	controller: 'LoginCtrl',
	params: {
		title: "Entrar"
	}
})

.state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
	controller: 'ProfileCtrl',
	params: {
		title: "Mi perfil"
	}
})

.state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
	controller: 'SignupCtrl',
	params: {
		title: "Registro"
	}
})

$urlRouterProvider.otherwise('/tab/reciente')

});
