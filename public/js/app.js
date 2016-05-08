var app = angular.module('app', ['ngRoute','colorpicker.module','ngRoute','restangular']);

app.controller('MainController', function($scope, Restangular,$timeout) {
	Restangular.one('lights').get().then(function(data) {
	  console.log(data);
	  $scope.lights=data;
	});	
	function update() {
		$scope.lights.forEach(function(l)
		{
			if(l.rgbraw!=undefined)
			{
				var channel_vals_array = l.rgbraw.slice(4, -1).split(",");

				l.params.colors = l.params.colors || {};
				l.params.colors.r=channel_vals_array[0];
				l.params.colors.g=channel_vals_array[1];
				l.params.colors.b=channel_vals_array[2];

				// var updatechannels = {};
				// updatechannels[l.colors.r]=channel_vals_array[0];
				// updatechannels[l.colors.g]=channel_vals_array[1];
				// updatechannels[l.colors.b]=channel_vals_array[2];
				// Restangular.one('channels')
				// .put(updatechannels)
				// 	.then(function(data) {
				
				// });	
			}
			Restangular
				.one('lights/'+l.id)
				.customPUT(l)
				.then(function(data) {});	
		})
	}
	var timeout = null;
	var debounceUpdate = function(newVal, oldVal) {
    if (newVal != oldVal) {
      if (timeout) {
        $timeout.cancel(timeout)
      }
      timeout = $timeout(function () {
        update();
      }, 10);
    }
  };
  $scope.$watch('lights', debounceUpdate, true);

  $scope.setMode = function(light, mode)
  {
  	light.mode = mode;
  	console.log(light.id, mode);
  };

});


app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		});

	$locationProvider.html5Mode(true);

}]);