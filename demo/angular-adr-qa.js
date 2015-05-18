// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};

// basic angular
angular.module( 'disputeResolutionQA', [] )


// controller
.controller( 'qaController', [ '$scope',
	                      function(  $scope ) {
	'use strict';

	$scope.results = cachedData;

	$scope.model = {
		disputeType: [],
		party: [],
		disputeSubject: []
	};

	// group data by permutations
	$scope.permutations = {};

	// array length filter
	function lengthFilter( s ) {
		return s.length > 0;
	}

	// init
	for ( var i = 0, len = cachedData.length; i < len; i++ ) {
		// ES6: let, exploder
		var type = cachedData[ i ].disputeType.split( /\s*;\s*/ ).filter( lengthFilter );
		var party = cachedData[ i ].party.split( /\s*;\s*/ ).filter( lengthFilter );
		var subject = cachedData[ i ].disputeSubject.split( /\s*;\s*/ ).filter( lengthFilter );

		// collect all document types in use
		// if ( cachedData[ i ].documentType ) {
		// 	$scope.resultFilter.documentType[ cachedData[ i ].documentType ] = true;
		// }

		// create lists of disputes, parties and topics
		$scope.model.disputeType = $scope.model.disputeType.concat( type.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeType.indexOf( item ) === -1;
		}));
		$scope.model.party = $scope.model.party.concat( party.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.party.indexOf( item ) === -1;
		}));
		$scope.model.disputeSubject = $scope.model.disputeSubject.concat( subject.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeSubject.indexOf( item ) === -1;
		}));

		for ( var j = 0, lenj = type.length; j < lenj; j++ ) {
			for ( var k = 0, lenk = party.length; k < lenk; k++ ) {
				for ( var l = 0, lenl = subject.length; l < lenl; l++ ) {
					$scope.permutations[ type[ j ] + '-' + party[ k ] + '-' + subject[ l ]] = $scope.permutations[ type[ j ] + '-' + party[ k ] + '-' + subject[ l ]] || {
						disputeType: type[ j ],
						party: party[ k ],
						disputeSubject: subject[ l ],
						results: []
					};
					$scope.permutations[ type[ j ] + '-' + party[ k ] + '-' + subject[ l ]].results.push( cachedData[ i ] );
				}
			}
		}
	}

}]);
