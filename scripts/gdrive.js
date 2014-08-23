define(['q'], function($q) {

    var loadDeferred = $q.defer();

    var clientId = '461007973312-aa7865ciif8rvhkl4rm30l6p61ugv039.apps.googleusercontent.com';
    var scopes = 'https://www.googleapis.com/auth/drive.readonly.metadata https://www.googleapis.com/auth/drive.apps.readonly';
    var fields = "items(defaultOpenWithLink,description,editable,etag,iconLink,id,kind,properties,title,mimeType),nextPageToken";



    /**
     * SDK script injecting
     */
    (function() {
        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/client:plusone.js';
        var s = document.getElementsByTagName('script')[0];
        po.onload = function() {
            loadDeferred.resolve(gapi);
        };

        s.parentNode.insertBefore(po, s);
    })();

    var isSigndIn = false;

    function getFiles(folderId) {
        var deferred = $q.defer();
        var retrievePageOfFiles = function(request, result) {
            request.execute(function(resp) {
                result = result.concat(resp.items);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    request = gapi.client.drive.files.list({
                        'pageToken': nextPageToken,
                        "q": "'" + folderId + "' in parents",
                        fields: fields
                    });
                    retrievePageOfFiles(request, result);
                } else {
                    deferred.resolve(result);
                }
            });
        }

        var initialRequest = gapi.client.drive.files.list({
            "q": "'" + folderId + "' in parents",
            fields: fields
        });
        retrievePageOfFiles(initialRequest, []);

        return deferred.promise;
    }

    function signIn() {
        var gapi;
        return loadDeferred.promise.then(function(_api) {
            gapi = _api;
            var deferred = $q.defer();

            if (!isSigndIn) {
                gapi.auth.authorize({
                    client_id: clientId,
                    scope: scopes,
                    immediate: false
                }, function(authResult) {
                    isSigndIn = true;
                    deferred.resolve(authResult);
                });

            } else {
                deferred.resolve(true);

            }

            return deferred.promise;
        }).then(function(authResult) {
            var deferred = $q.defer();

            gapi.client.load('drive', 'v2', function() {
                deferred.resolve();

            });
            return deferred.promise;

        });
    }

    return {
        ready: function() {
            return loadDeferred.promise;
        },
        signIn: signIn,
        getFiles: getFiles
    }



});