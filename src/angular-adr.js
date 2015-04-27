// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};


// basic angular
angular.module( 'disputeResolution', [] )

.controller( 'resultsController', function( $scope ) {
	'use strict';

	$scope.results = cachedData;

	$scope.model = {
		disputeType: [],
		party: [],
		disputeSubject: []
	};

	for ( var i = 0, len = cachedData.length; i < len; i++ ) {
		// ES6: let, exploder
		var type = cachedData[ i ].disputeType.split( /\s*;\s*/ );
		var party = cachedData[ i ].party.split( /\s*;\s*/ );
		var subject = cachedData[ i ].disputeSubject.split( /\s*;\s*/ );

		$scope.model.disputeType = $scope.model.disputeType.concat( type.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeType.indexOf( item ) === -1;
		}));
		$scope.model.party = $scope.model.party.concat( party.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.party.indexOf( item ) === -1;
		}));
		$scope.model.disputeSubject = $scope.model.disputeSubject.concat( subject.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeSubject.indexOf( item ) === -1;
		}));
	}

	$scope.story = {
		disputeSubject: $scope.model.disputeSubject[ 0 ],
		disputeType: $scope.model.disputeType[ 0 ],
		party: $scope.model.party[ 0 ]
	};


});
