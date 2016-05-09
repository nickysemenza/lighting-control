var app = angular.module('app', ['ngRoute','colorpicker.module','ngRoute','restangular','rzModule']);

app.controller('MainController', function($scope, Restangular,$timeout) {
	Restangular.one('lights').get().then(function(data) {
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
  	console.log("mode of: ", light.id, mode);
  };

});

app.controller('VisController', function($scope, Restangular,$timeout) {
	getDMX();
	Restangular.one('lights').get().then(function(data) {
	  $scope.lights=data;
	});

	$scope.data = {};
	$scope.data.r=255;
	$scope.data.g=55;
	$scope.data.b=255;

	function getDMX() 
	{
		Restangular.one('dmx').get().then(function(data) {
		  $scope.dmx=Restangular.stripRestangular(data);
		  getDMX();
		});
	}
	setInterval(getDMX,1000);

	$scope.get_color = function(light)
	{
		if($scope.dmx===undefined)
			return {};
		return {'background-color': 'rgb(' + $scope.dmx[light.colors.r] + ',' + $scope.dmx[light.colors.g] + ',' + $scope.dmx[light.colors.b]+')'};
	}
});



app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})
		.when('/vis', {
			templateUrl: 'views/vis.html',
			controller: 'VisController'
		});

	$locationProvider.html5Mode(true);

}]);