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
		var party = cachedData[ i ].party.split( /\s*;\s*/ ).filter( lengthFilter );
		var subject = cachedData[ i ].disputeSubject.split( /\s*;\s*/ ).filter( lengthFilter );

		// collect all document types in use
		// if ( cachedData[ i ].documentType ) {
		// 	$scope.resultFilter.documentType[ cachedData[ i ].documentType ] = true;
		// }

		// create lists of disputes, parties and topics
		$scope.model.party = $scope.model.party.concat( party.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.party.indexOf( item ) === -1;
		}));
		$scope.model.disputeSubject = $scope.model.disputeSubject.concat( subject.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeSubject.indexOf( item ) === -1;
		}));

		// for ( var j = 0, lenj = type.length; j < lenj; j++ ) {
			for ( var k = 0, lenk = party.length; k < lenk; k++ ) {
				for ( var l = 0, lenl = subject.length; l < lenl; l++ ) {
					var key = party[ k ] + '-' + subject[ l ];
					$scope.permutations[ key ] = $scope.permutations[ key ] || {
						party: party[ k ],
						disputeSubject: subject[ l ],
						results: []
					};
					$scope.permutations[ key ].results.push( cachedData[ i ] );
				}
			}
		// }
	}

	// counts
	angular.forEach( $scope.permutations, function( record ) {
		record.self = record.results.filter(function( result ) {
			return result.resolution.indexOf( 'Self' ) !== -1;
		}).length;
		record.assisted = record.results.filter(function( result ) {
			return result.resolution.indexOf( 'Assisted' ) !== -1;
		}).length;
		record.formal = record.results.filter(function( result ) {
			return result.resolution.indexOf( 'Formal' ) !== -1;
		}).length;
	});


	// check for permutations with zero results
	// for ( var j = 0, lenj = $scope.model.disputeType.length; j < lenj; j++ ) {
		for ( var k = 0, lenk = $scope.model.party.length; k < lenk; k++ ) {
			for ( var l = 0, lenl = $scope.model.disputeSubject.length; l < lenl; l++ ) {
				var key = $scope.model.party[ k ] + '-' + $scope.model.disputeSubject[ l ];
				if ( typeof $scope.permutations[ key ] === 'undefined' ) {
					$scope.permutations[ key ] = {
						party: $scope.model.party[ k ],
						disputeSubject: $scope.model.disputeSubject[ l ],
						results: [],
						self: 0,
						assisted: 0,
						formal: 0
					}
				}
			}
		}
	// }

}]);
