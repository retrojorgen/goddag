var mobileThreshold = (window.innerWidth < 800);

var spilldb = angular
	.module('spilldb', ['ui.bootstrap', 'ngRoute', 'ngAnimate', 'underscore', 'ngSanitize', 'puElasticInput', 'angular-storage', 'angularMoment', 'angular-click-outside'])
	.constant("appConst", {
		"mobileThreshold": window.mobileThreshold
	})
	.run(function(amMoment) {
		amMoment.changeLocale('no');
	})
	.config(['$locationProvider', '$routeProvider', function config($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');
		$routeProvider.
		when('/user/:nickSlug', {
			'template': '<user></user>'
		}).
		when('/user/:nickSlug/profile/:space', {
			'template': '<user></user>'
		}).
		when('/user/:nickSlug/c/:collectionId', {
			'template': '<userlist></userlist>'
		}).
		when('/user/:nickSlug/c/:collectionId/g/:gameId', {
			'template': '<game></game>'
		}).
		when('/signup', {
			'template': '<signup></signup>'
		}).
		when('/reset', {
			'template': '<resetpassword></resetpassword>'
		}).
		when('/reset/:email', {
			'template': '<resetpassword></resetpassword>'
		}).
		when('/create/collection', {
			'template': '<createcollection></createcollection>'
		}).
		when('/wizard/collection', {
			'template': '<createcollection></createcollection>'
		}).
		when('/wizard/avatar', {
			'template': '<createprofilephoto></createprofilephoto>'
		}).
		when('/login', {
			'template': '<login></login>'
		}).
		when('/flush/all', {
			'template': '<flush></flush>'
		}).
		when('/logout', {
			'template': '<logout></logout>'
		}).
		when('/front', {
			'template': '<front></front>'
		}).
		otherwise('/front');
	}]);


// file upload button
// http://jsfiddle.net/johnwun/U47tM/