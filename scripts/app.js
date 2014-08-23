requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        bower: '../bower_components',
        q: '../bower_components/q-1/q',
        js: '../js',
        term: '../js/jquery.terminal-min',
        mousewheel: '../js/jquery.mousewheel-min'
    },
    shim : {
        'js/jquery' : {
            exports  : '$'
        },
        'term' : {
            deps  : ['js/jquery']
        },
        'mousewheel' : {
            deps  : ['js/jquery', 'term']
        },
        'js/jquery.mousewheel-min' : {
          deps : ['js/jquery.terminal-min']  
        },
        'js/underscore' : {
            exports : '_'
        }
    }
});

requirejs(["main"]);
