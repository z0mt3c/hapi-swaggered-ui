module.exports = function (grunt) {
    // load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-release');

    // Project configuration.
    grunt.initConfig({
        release: {
            options: {
                tagName: 'v<%= version %>'
            }
        },
        watch: {
            scripts: {
                files: ['<%= jshint.all %>'],
                tasks: ['test']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'lib/*.js',
                'index.js'
            ]
        }
    });

    // Default task.
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['test', 'watch']);
};