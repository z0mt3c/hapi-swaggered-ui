module.exports = function (grunt) {
    // load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
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
    grunt.registerTask('default', ['jshint', 'watch']);
};