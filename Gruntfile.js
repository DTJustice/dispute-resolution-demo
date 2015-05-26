module.exports = function( grunt ) {

	var pkg = grunt.file.readJSON( 'package.json' );

	// config
	grunt.initConfig({
		jshint: {
			app: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: 'src/**.js'
			}
		},
		casper: {
			acceptance: {
				options: {
					test: true,
					concise: true
				},
				files: {
					'casper-acceptance.xml' : [ 'test/*.js' ]
				}
			}
		}
	});


	// plugins
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-casper' );


	// helpers
	grunt.registerTask( 'test', [ 'jshint', 'casper' ]);
};
