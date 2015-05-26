module.exports = function( grunt ) {
	require( 'time-grunt' )( grunt );

	var pkg = grunt.file.readJSON( 'package.json' );

	// TODO local preview server
	// in the interim, this is expected to be the local folder used with the swe_template repo
	// with apache (XAMPP recommended) setup and running
	// https://github.com/qld-gov-au/swe_template
	var HTDOCS = '../swe_template/build/_htdocs';

	// config
	grunt.initConfig({

		// move files for preview
		copy: {
			js: {
				expand: true,
				cwd: 'src',
				src: '*.js',
				dest: HTDOCS + '/assets/law/'
			},
			templates: {
				expand: true,
				cwd: 'src/neighbourhood',
				src: '*',
				dest: HTDOCS + '/law/legal-mediation-and-justice-of-the-peace/setting-disputes-out-of-court/neighbourhood-mediation/neighbourhood-dispute-resolution/'
			}
		},

		// code qa
		jshint: {
			app: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: 'src/**.js'
			},
			tests: {
				src: 'test/**.js'
			}
		},

		// acceptance tests
		casper: {
			acceptance: {
				options: {
					test: true,
					concise: true,
					failFast: true
				},
				files: {
					'logs/casper-acceptance.xml' : [ 'test/*.js' ]
				}
			}
		},

		// watch
		watch: {
			options: {
				spawn: false
			},
			js: {
				files: 'src/*.js',
				tasks: [ 'jshint:app', 'copy:js', 'casper:acceptance' ]
			},
			templates: {
				files: 'src/**/*.html',
				tasks: [ 'copy:templates', 'casper:acceptance' ]
			},
			tests: {
				files: 'test/**',
				tasks: [ 'jshint:tests', 'casper:acceptance' ]
			}
		}
	});


	// plugins
	grunt.loadNpmTasks( 'grunt-casper' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );


	// helpers
	grunt.registerTask( 'test', [ 'jshint', 'casper' ]);
	grunt.registerTask( 'default', [ 'copy', 'test', 'watch' ]);
};
