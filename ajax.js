cycligent.define( "cycligent.ajax", function(){

    if(cycligent.config.providerTimeout){
        $.ajaxSetup({timeout: cycligent.config.providerTimeout});
    }

    if(cycligent.config.providerUrl){

        cycligent.ajax.gateway = new cycligent.ajax.Gateway(cycligent.config.providerUrl);

        cycligent.ajax.gateways = {};
        cycligent.ajax.gateways[cycligent.config.providerUrl] = cycligent.ajax.gateway;

        cycligent.ajax.authorizer = new cycligent.ajax.Authorizer( cycligent.ajax.gateway );
        // Setup a convenience functions to make calls easy.
        cycligent.ajax.authorize = function(){cycligent.ajax.authorizer.authorize.apply(cycligent.ajax.authorizer,arguments)};
        cycligent.ajax.isAuthorized = function(){return cycligent.ajax.authorizer.isAuthorized.apply(cycligent.ajax.authorizer,arguments);};

        cycligent.ajax.cache = new cycligent.ajax.Cache( cycligent.ajax.gateway );
        cycligent.ajax.query = new cycligent.ajax.Query( cycligent.ajax.gateway );

        cycligent.ajax.callMonitor = new cycligent.ajax.CallMonitor( cycligent.ajax.gateway, nonPendingErrorHandler );
        // Setup a convenience function to make calls easy.
        cycligent.ajax.call = function(){cycligent.ajax.callMonitor.call.apply(cycligent.ajax.callMonitor,arguments)};

        cycligent.ajax.download = new cycligent.ajax.Download();

        cycligent.ajax.message = new cycligent.ajax.Message( cycligent.ajax.gateway );

        cycligent.ajax.timer = new cycligent.ajax.Timer( cycligent.ajax.gateway );

        cycligent.ajax.traceHandler = new cycligent.ajax.TraceHandler( cycligent.ajax.gateway );
    }

    function nonPendingErrorHandler(status, errorMessage){
        alert("A pending function from the page you were previously on returned a non-success status of '" + status + "' with the following message: " + errorMessage);
    }

    cycligent.ajax.addGateway = function(){
        var args = cycligent.args(arguments, {
            providerUrl: {type: String, required: false, defaultValue: cycligent.config.providerUrl}		// The URL of the server that provides the Ajax
        });

        if( !this.gateways[args.providerUrl] ){
            this.gateways[args.providerUrl] =
                new cycligent.ajax.Gateway( args.providerUrl );
        }

        return this.gateways[args.providerUrl];
    };

    cycligent.ajax.util = {

        /* @cycligentDoc {Method}
         * Finds and returns the index of an object in an array of objects via the
         * object's id.
         *
         * @Remarks
         * All objects in the array must have an "id" property. By convention
         * the "id" represents the systemwide id of the object, normally assigned
         * by the server.
         */
        findIndexById: function(){
            var args = cycligent.args(arguments, {
                _id: {type: String},		// The id to use to find the object.
                data: {type: [Object]}	// The data array to be searched.
            });

            var _id = args._id;
            var data = args.data;

            for(var index = 0; index < data.length; index++ ){
                if(data[index]._id == _id){
                    return index;
                }
            }

            return null;
        },

        /* @cycligentDoc {Method}
         * Finds the returns the object that is in an array of objects via the
         * object's id.
         *
         * @Remarks
         * All objects in the array must have an "id" property. By convention
         * the "id" represents the systemwide id of the object, normally assigned
         * by the server.
         */
        findItemById: function(){
            var args = cycligent.args(arguments, {
                _id: {type: String},		// The id to use to find the object.
                data: {type: [Object]}	// The data array to be searched.
            });

            var _id = args._id;
            var data = args.data;

            for(var index = 0; index < data.length; index++ ){
                if(data[index]._id == _id){
                    return data[index];
                }
            }

            return null;
        },

        /* @cycligentDoc {Method}
         * Finds and returns the first object of an array whose field value
         * matches the value supplied.
         */
        findItemByField: function(){
            var args = cycligent.args(arguments, {
                field: {type: String},	// The name of the field to serach
                value: {type: String},	// The value to find
                data: {type: [Object]}	// The object array to be searched.
            });

            var field = args.field;
            var value = args.value;
            var data = args.data;

            for(var index = 0; index < data.length; index++ ){
                if(data[index][field] == value){
                    return data[index];
                }
            }

            return null;
        },

        /* @cycligentDoc {Method}
         * Finds the returns the object that is in an array of objects via the
         * object's client id.
         *
         * @Remarks
         * By convention the "clientId" property represents a TEMPORARY id assigned
         * by the client before the systemwide "id" is assigned by the server. The
         * clientId is used for matching purposes when an item is being added.
         */
        findItemByClientId: function(){
            var args = cycligent.args(arguments, {
                client_id: {type: String},	// The client id to use to find the object.
                data: {type: [Object]}		// The data array to be searched.
            });

            var client_id = args.client_id;
            var data = args.data;

            for(var index = 0; index < data.length; index++ ){
                if(data[index].client_id == client_id){
                    return data[index];
                }
            }

            return null;
        },

        /* @cycligentDoc {Method}
         * Sort the JSON object via key field.
         */
        sortJsonObject: function(){
            var args = cycligent.args(arguments, {
                field: {type: String},	// The field to use for sort
                data: {type: [Object]},		// The data array to be sort
                order: {type: String}		    // The order of sorting (Must be asc/desc)
            });

            var key = args.field;
            var obj = args.data;
            var order = args.order;

            if ( String(order) == 'asc' ) {
                obj.sort(function(a, b){
                    if (a[key] < b[key]) {
                        return -1;
                    }

                    if (a[key] == b[key]) {
                        return 0;
                    }

                    if (a[key] > b[key]) {
                        return 1;
                    }
                })
            } else {
                obj.sort(function(b, a){
                    if (a[key] < b[key]) {
                        return -1;
                    }

                    if (a[key] == b[key]) {
                        return 0;
                    }

                    if (a[key] > b[key]) {
                        return 1;
                    }
                })
            }
        },

        formatDateString: function() {
            var args = cycligent.args(arguments, {
                date: {type: String},	// The value to be formatted.
                format: {type: String, required: false, defaultValue: "mm/dd/yy"}	// The format template to use in formatting the value.
            });

            var dateArg = args.date;
            //2012-10-01T18:30:00.000Z

            var splitDate = dateArg.split('T');
            var dateParts = splitDate[0].split('-');
            var timeParts = splitDate[1].split(':');
            var secondParts = timeParts[2].split('.');
            var date = new Date(dateParts[0], parseInt(dateParts[1] - 1), dateParts[2], timeParts[0], timeParts[1], secondParts[0]);
            return date;


        },

        /* @cycligentDoc {Method}
         * Given an array, it will return a new array with duplicate
         * items removed.
         *
         * @Remarks
         * The check to see if an item is in the array is done with lastIndexOf.
         *
         * This function will not preserve the order of the items in the array.
         */
        unique: function() {
            var args = cycligent.args(arguments, {
                array: {type: Array}
            });
            return args.array.filter(function (item, index, array) {
                return array.lastIndexOf(item) === index;
            });
        },

        /**
         * Returns the current location as a dotted name.
         *
         * For example, if our browser was at http://localhost:1337/c3/client/home/markup-i3i.html
         * this would return "c3.home."
         *
         * @returns {String}
         */
        dottedLocation: function() {
            return window.location.pathname.replace(/\\/g,"/").substr(1,window.location.pathname.lastIndexOf("/")).replace("/client/",".").replace(/\//g,".");
        },

        /**
         * Given a dotted name, return the fully qualified expansion of that name.
         *
         * For example, if our browser was at http://localhost:1337/c3/client/home/markup-i3i.html
         * and the given name was ".something" this would return "c3.home.something".
         *
         * @returns {String}
         */
        dottedNameExpand: function(name) {
            //noinspection FallthroughInSwitchStatementJS
            switch(name[0]) {
                case '.':   // HTML file (current window location) relative anchor
                    name = cycligent.ajax.util.dottedLocation() + name.slice(1);
                    break;
                case '^':   // Deploy directory anchor
                    name = name.slice(1);
                    break;
                case '/':   // Current application directory anchor
                case '@':   // Current application directory anchor
                    name = cycligent.root.name + "." + name.slice(1);
                    break;
                default:
                    var split = name.split('.');
                    var roots = [];
                    if (cycligent.Session && cycligent.Session.singleton) {
                        roots = cycligent.Session.singleton.rootsGet() || [];
                    }
                    if (roots.indexOf(split[0]) == -1 && roots.length > 0) { // Must be referring to current location.
                        name = cycligent.ajax.util.dottedLocation() + name;
                    } // else { // The store name is referring to a root, so we don't need to do anything more.
            }

            return name;
        }
    };

},1);

/* @cycligentDoc {Class}
 * An Ajax gateway.
 *
 * @Remarks
 * A gateway is a url on a server that processes Ajax requests,
 * typically for a specific functionality.
 */
cycligent.class({
    name: "cycligent.ajax.Gateway",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                providerUrl: {type: String},		// The URL of the server that provides the Ajax
                authorization: {type: String, required: false} // If we want to specify a specific session authorization token to use on this gateway, we can. Otherwise we'll just pull it out of session.
            });

            var me = this;

            $.extend(me,args);
            me.targets = [];			//@cycligentDoc {Property:[cycligent.ajax.Target]} The messaging targets processed by the gateway.
            me.requestCount = 0;		//@cycligentDoc {Property:Number} The number of requests that have been processed by the gateway.
            me.requestTimes = {};
        },

        sequenceQueueProcess: function(target){
            var args = cycligent.args(arguments, {
                target: {type: cycligent.ajax.Target}
            });
            var me = this;

            while( target.responseQueue.length > 0 && target.responseQueue[0].dataTarget ){

                function callbackGo1(){
                    if(target.context){
                        target.callback.call(target.context, target.responseQueue[0].dataTarget);
                    }else{
                        target.callback( target.responseQueue[0].dataTarget);
                    }
                }

                if(cycligent.config.debug.doNotCatchAllExceptionsOnLocalHost &&
                    (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1")){
                    callbackGo1();
                } else {
                    try {
                        callbackGo1();
                    }
                    catch (ex) {
                        console.error( "Exception occurred while trying to execute target event function for target '" + target.id + "' for a request id of '" + target.responseQueue[0].dataTarget.request + "'.");
                        console.error( ex.message );
                    }
                }

                target.responseQueue.shift();
            }
        },

        /* @cycligentDoc {Method}
         * Registers a messaging target
         * @returns cycligent.ajax.Target
         * @Remarks
         * Messaging targets will be called when unsolicted (or solicted)
         * messages are received in a multiplexed message.
         */
        register: function(){
            var args = cycligent.args(arguments, {
                id: {type: String},								// The id of the messaging target.
                callback: {type: Function},				// The event function to call when a message is received.
                context: {type: "Any", required: false},	// Reference data to pass to the function when a message is received.
                sequenceImportant: {type: Boolean, required: false, defaultValue: false}  // When true the target will always be called with responses in the same order in which the requests were made.
            });

            if( this.targets[args.id] ){
                //console.error( "Target '" + args.id + "' already registered.");
            }
            else{
                //noinspection JSCheckFunctionSignatures
                this.targets[args.id] = new cycligent.ajax.Target( args );
            }

            return this.targets[args.id];
        },

        /* @cycligentDoc {Method}
         * Makes a request from a gateway.
         */
        request: function(){
            var args = cycligent.args(arguments, {
                target: {type: cycligent.ajax.Target},		// The target making the request.
                postData: {type: Object},			// The data to post to the server through the gateway.
                jQueryOptions: {type: Object, required: false}, // Options to pass to $.ajax
                nonBlocking: {type: Boolean, required: false, defaultValue: false} // Indicates that this request shouldn't block other requests, even if sequence is important.
            });

            var me = this;

            var target = args.target;

            me.requestCount++;

            me.requestTimes[me.requestCount.toString()] = (new Date()).getTime();

            args.postData.target = target.id;
            args.postData.request = me.requestCount;
            args.postData.location = args.postData.location ? args.postData.location : cycligent.ajax.util.dottedLocation();

            if (me.authorization !== undefined) {
                args.postData.authorization = me.authorization;
            } else if (cycligent.Session && cycligent.Session.singleton) {
                args.postData.authorization = cycligent.Session.singleton.propertyGet("authorization");
            }
            //TODO: 3. ***SIDE-BY-SIDE*** Only need to do the following if supports.sideBySideRoles is configured to true
            /*
            if(cycligent.Session && cycligent.Session.singleton){
                args.postData.role = cycligent.Session.singleton.propertyGet("role");
            }
            */
            var options = {
                data: JSON.stringify(args.postData),
                type: "POST"
            };
            if (args.jQueryOptions) {
                for (var index in args.jQueryOptions) {
                    if (args.jQueryOptions.hasOwnProperty(index)) {
                        options[index] = args.jQueryOptions[index];
                    }
                }
            }

            function clearRequestFailure(settingsData, errorMessage){

                try {

                    var data = JSON.parse(settingsData);
                    var targetId = data.target;
                    var requestId = data.request;

                    var target = me.targets[targetId];

                    if (target) {

                        if (target.sequenceImportant) {
                            // Find the request Id in the response queue
                            for (var index = 0; index < target.responseQueue.length; index++) {
                                if (target.responseQueue[index].id == requestId) {

                                    // Remove failing request from queue so it doesn't hold up other requests
                                    target.responseQueue.splice(index, 1);
                                    me.sequenceQueueProcess(target);
                                    break;
                                }
                            }
                        }

                        switch(targetId){
                            case 'cycligentCache':
                            case 'cycligentHierarchy':
                            case 'cycligentQuery':

                                var ignoreFail = false;
                                //TODO: 4. request could be on a different gateway
                                if(target.context.pendingRequests[requestId]) {
                                    var store = target.context.pendingRequests[requestId].store;
                                    if (store.failFunctions && store.failFunctions.length > 0) {
                                        for (var failIndex = 0; failIndex < store.failFunctions.length; failIndex++) {
                                            ignoreFail = store.failFunctions[failIndex](errorMessage);
                                            if (ignoreFail) {
                                                break;
                                            }
                                        }
                                    }
                                }

                                if(!ignoreFail){
                                    console.error(errorMessage);
                                }

                                target.context.deleteRequest(target.context.pendingRequests[requestId], true);

                                break;

                            default:
                                console.error(errorMessage);
                        }
                    } else {
                        console.error(errorMessage);
                    }
                }
                catch(ex){
                    console.error(ex.message);
                }

            }

            var jqXHR = $.ajax( me.providerUrl, options )
                .done(function(data, textStatus, jqXHR){
                    // Make sure we are getting an appropriate JSON return
                    if( !(data instanceof Array) ){
                        // We are not so the session must have timed out, so reload
                        // the page to force a logon.
                        var errorMessage = "AJAX failure: Session may have ended, try logging back on (an unexpected response was received from the server). URL was: " + this.url;
                        if(cycligent.config.debug.on){
                            console.error("AJAX failure debug data: " + data);
                        }
                        clearRequestFailure(this.data, errorMessage);
                    } else {
                        me.response(data);
                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown){
                    var errorMessage;
                    try {
                        if (textStatus == "abort") {
                            errorMessage = "AJAX failure: Request was aborted. URL was: " + this.url;
                        } else if (errorThrown) {
                            errorMessage = "AJAX failure: " + errorThrown.name + " (" + errorThrown.message + "). URL was: " + this.url;
                        } else {
                            if (jqXHR.state() == "rejected") {
                                errorMessage = "AJAX failure: Request was rejected by the server (application may be down). URL was: " + this.url;
                            } else {
                                errorMessage = "AJAX failure: Unknown error detected: textStatus='" + textStatus + "', state='" + jqXHR.state() + "'.' URL was: " + this.url;
                            }
                        }
                    } catch(ex){
                        errorMessage= "AJAX failure: Timeout likely - error returned: " + ex.name + " (" + ex.message + "). URL was: " + this.url;
                    }
                    clearRequestFailure(this.data, errorMessage);
                })
            ;

            var responseItem = new cycligent.ajax.Target.ResponseItem(me.requestCount.toString(), jqXHR);

            if( target.sequenceImportant ){
                if (args.nonBlocking) {
                    target.responseQueueNonBlocking.push(responseItem);
                } else {
                    target.responseQueue.push(responseItem);
                }
            }

            return me.requestCount;
        },

        /* @cycligentDoc {Method}
         * INTERNAL USE ONLY. Handles the response from the server.
         */
        response: function( data ){

            var me = this;

            // Check for a long wait target...
            if(data[0].target == 'cycligentLongWait'){
                //TODO: 3. cycligentLongWait Should provide a signal to the application here!
                var postData = data[0].retrieve;
                postData.target = 'cycligentRetrieveLongWorker';
                postData.request = 0;
                if (me.authorization !== undefined) {
                    postData.authorization = me.authorization;
                } else if (cycligent.Session && cycligent.Session.singleton) {
                    postData.authorization = cycligent.Session.singleton.propertyGet("authorization");
                }
                //TODO: 3. ***SIDE-BY-SIDE*** Only need to do the following if supports.sideBySideRoles is configured to true
                /*
                if(cycligent.Session && cycligent.Session.singleton){
                    postData.role = cycligent.Session.singleton.propertyGet("role");
                }
                */
                $.post( me.providerUrl, JSON.stringify(postData), function(data){me.response(data);} );
                return;
            }

            var id;
            var request;
            var index;
            var foundIndex;
            var target;
            var responseItem;

            /* @cycligentDoc {Function}
             * Enumerator.
             */
            $.each(data,function(){

                    id = this.target;

                    target = me.targets[id];

                    if( target ){

                        if( target.sequenceImportant ){
                            request = this.request;
                            // Find the request Id in the response queue
                            foundIndex = -1;
                            for( index = 0; index < target.responseQueue.length; index++ ){
                                responseItem = target.responseQueue[index];
                                if( responseItem.id == request ){
                                    foundIndex = index;
                                    break;
                                }
                            }

                            if( foundIndex >= 0 ){
                                responseItem.dataTarget = this;
                                // TODO: 9. If a message got dropped the sequence queue locked up waiting on the request
                                //          not letting any other requests through.  Handled that by adding a global
                                //          $( document ).ajaxError handler that removed the failing request from the
                                //          queue allowing subsequent request to flow through.  If we ever find it to
                                //          be the case that ajaxError is not called then we will need to add some sort
                                //          of timeout function to remove overdue responses from the queue in
                                //          me.sequenceQueueProcess.
                                me.sequenceQueueProcess(target);
                            }
                            else{
                                for( index = 0; index < target.responseQueueNonBlocking.length; index++ ){
                                    responseItem = target.responseQueueNonBlocking[index];
                                    if( responseItem.id == request ){
                                        foundIndex = index;
                                        break;
                                    }
                                }

                                if ( foundIndex >= 0 ) {
                                    responseItem.dataTarget = this;

                                    function callbackGo2(){
                                        if(target.context){
                                            target.callback.call(target.context, target.responseQueueNonBlocking[foundIndex].dataTarget);
                                        }else{
                                            target.callback( target.responseQueueNonBlocking[foundIndex].dataTarget);
                                        }
                                    }

                                    if(cycligent.config.debug.doNotCatchAllExceptionsOnLocalHost &&
                                        (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1")){
                                        callbackGo2();
                                    } else {
                                        try {
                                            callbackGo2();
                                        }
                                        catch (ex) {
                                            console.error( "Exception occurred while trying to execute target event function for target '" + id + "' for a request id of '" + request + "'.");
                                            console.error( ex.message );
                                        }
                                    }

                                    target.responseQueueNonBlocking.splice(foundIndex, 1);

                                } else {
                                    console.error( "Sequenced target received unrecognized response request with an id of '" + request + "'");
                                }
                            }

                        }
                        else{

                            function callbackGo3(thisGo){
                                if(target.context){
                                    target.callback.call( target.context, thisGo );
                                }else{
                                    target.callback( thisGo );
                                }
                            }

                            if(cycligent.config.debug.doNotCatchAllExceptionsOnLocalHost &&
                                (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1")){
                                callbackGo3(this);
                            } else {
                                try {
                                    callbackGo3(this);
                                }
                                catch (ex) {
                                    console.error( "Exception occurred while trying to execute target event function for target '" + id + "'.");
                                    console.error( ex.message );
                                }
                            }
                        }

                    }
                    else{
                        console.warn( "Unrecognized target id '"
                            + id
                            + "' was returned from the server. It will be ignored.");
                    }
                }
            );
        }
    }
});

/* @cycligentDoc {Class}
 * A messaging target.
 *
 * @Remarks
 * A messaging target receives a particular message
 * type.
 */
cycligent.class({
    name: "cycligent.ajax.Target",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                id: {type: String},									// The id of the messaging target.
                callback: {type: Function},					// The event function to call when a message is received.
                context: {type: "Any", required: false},		// Reference data to pass to the function when a message is received.
                sequenceImportant: {type: Boolean, required: false, defaultValue: false}  // When true the target will always be called with responses in the same order in which the requests were made.
            });

            var me = this;

            $.extend(me,args);

            if( args.sequenceImportant ){
                me.responseQueue = [];  //@cycligentDoc {Property:[cycligent.ajax.Target.ResponseItem]} A queue of pending server responses.
                me.responseQueueNonBlocking = []; //@cycligentDoc {Property:[cycligent.ajax.Target.ResponseItem]} A queue of pending server responses. When the sequence of responses is important for a target, this array will hold pending responses that don't block the response queue (e.g. sequence is unimportant for these responses, and they take a long time to return.)
            }
        }
    }
});



/* @cycligentDoc {Class}
 * A messaging target response queue. Used for sequencing messages
 */
cycligent.class({
    name: "cycligent.ajax.Target.ResponseItem",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                id: {type: String},									// The id of the response item.
                jqXHR: {type: Object, required: false}  // The jQuery XHR object associated with the request and response.
            });

            var me = this;

            $.extend(me,args);
        }
    }
});



/* @cycligentDoc {Class}
 * A data cache that requests data from the server when
 * necessary via Ajax.
 *
 * @Remarks
 * Improvement Interactive caches cache data requested
 * from the server. They facilitate not only typical
 * caching but eager caching where the server may return
 * more data than requested. Improvement Interactive
 * caches also inject objects into the specified location
 * (versus maintaining data in another location.
 */
cycligent.class({
    name: "cycligent.ajax.Cache",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway}			// The gateway for processing of data requests by the server.
            });

            var me = this;
            $.extend(me,args);

            if(me.gateway.targets['cycligentCache']){
                var existingCache = me.gateway.targets['cycligentCache'].context;
                me.stores = existingCache.stores;
                me.pendingRequests = existingCache.pendingRequests;
                me.gatewayTarget = existingCache.gatewayTarget;
            }else{

                me.stores = [];									//@cycligentDoc {Property:[cycligent.ajax.Cache.Store]} Stores maintained by the cache.
                me.pendingRequests = {};						//@cycligentDoc {Property:[cycligent.ajax.Cache.Request]} Requests awaiting a response from the gateway (server).
                me.gatewayTarget = me.gateway.register( "cycligentCache", me.response, me, true );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the cache.

            }
        },

        /* @cycligentDoc {Method}
         * Registers a store with the cache.
         * @returns cycligent.ajax.Cache.Store
         */
        register: function(){
            var me = this;
            var args = cycligent.args(arguments, {
                store: {type: String},									// The id of the store.
                itemConstructor: {type: Object, required: false},			// The constructor for the creation of items put into the store.
                itemConstructorArgs: {type: Object, required: false},		// The arguments definition specification for the constructor for the creation of items put into the store.
                parentStore: {type: cycligent.ajax.Cache.Store, required: false},		// The parent store of this store. When specified whenever the parent store changes this store is invalidated and cleared.
                isRecursive: {type: Boolean, required: false},				// When true, all items are added into the injection array, and items within the array are linked to one another.
                addToParentItem: {type: Boolean, required: false},			// When true, items are injected into the parent object in the parent store.
                parentInjectionProperty: {type: String, required: false, defaultValue: ''},		// The property name of parent object into which this object should be injected.
                linkToParentProperty: {type: String, required: false},			// The field name override for the field in the object being linked to its parent that links to the parent's _id field. The override is used when the field name in the child object is not the default of the parent store name minus the ending 's'.  For instance when the plural store name is categories and the singular is category not categorie as the system would construct by default.
                parentField: {type: String, required: false},				// The name of the field in the child object that you would like linked to the parent object.
                injectionArray: {type: Object, required: false},			// The array that holds objects that are created/stored by this store.
                multipleFetchesAllowed: {type: Boolean, required: false},	// Normally whenever a new fetch is requested the store is invalidated and cleared. When true, the cache allows multiple fetches and stores all data fetched, the store is only invalidated and cleared when the parent store changes.
                // TODO: 5. deDup is depreciated. Tell the world, and then remove it.
                deDup: {type: Boolean, required: false, defaultValue:false}, // If an item is returned from the server that we already have, we won't store the duplicate.
                maxRowsReturned:{type: Number, required: false}, // Controls how many rows are returned per fetch.
                lookupSpec: {type: Object, required: false},	// Contains the lookup spec for data linking (maps attributes to stores with documents that have an _id equal to the value of the attribute. Also, you can provide an array of documents instead of a store if you want.)

                notify: {type: Function, required: false}, // The function to call after every fetch (automatically triggered or manual.) Note that after data updates, it may be tempting to use this to update the view, but please consider that a full re-render may be much more expensive than minor updates done in the afterTransaction function.
                handleDuplicates: {type: String, required: false}, // Specifies how we should handle duplicates when we encounter one in the injection array. Possible values are "discardOld", "discardNew", "keepBoth", or "merge".
                mergeItem: {type: Function, required: false}, // Merges new data with old data. By default this copies the values contained in the new JSON received from the server into the object already stored in the cache. You can provide your own function to perform this operation if there are some special considerations. The function must take two arguments (the new data, and the existing data), and return the result of the merge (likely the existing item, but it doesn't have to be.)
                afterTransaction: {type: Function, required: false}, // Called after an object has been added or updated in the injectionArray. The function receives the object, and a string flag that will contain either "added" or "updated" depending on what happened. Note this only gets called when changes are made by the cycligentCache or cycligentQuery code, not when your own code updates or adds something.
                interval: {type: Number, required: false}, // Time in milliseconds between updates when using hot caching or long-polling. If you are using hot caching, the cache will wait this amount of time before doing the first update, so you may want to manually fetch first. For long-polling, the server institutes a floor of how frequently you can check for updates, which defaults to 50ms.
                hotCachingAutoStart: {type: Boolean, required: false}, // Whether or not to automatically start fetching from the store via the hot caching mechanism. If this is false, you'll have to call hotCachingStart.
                hotCachingCriteria: {type: "Any", required: false}, // The criteria (or a function that returns the criteria) to be used to fetch the data when doing hot caching. Type is actually Function|Object, so you can have a function dynamically return the criteria if you want to.
                timeout: {type: Number, required: false}, // By default requests will timeout after the time set in cycligent.config.providerTimeout. If you have a query that will take a while for some reason (or if you're using hot caching, which can utilize long polling to minimize the number of requests) you can specify a timeout to use.
                useLongPolling: {type: Boolean, required: false} // If no results are returned from a cache fetch, keep fetching server-side until we have some results. Respects the interval config option and the timeout config option.
            });

            args.store = cycligent.ajax.util.dottedNameExpand(args.store);

            // Create the store
            if( this.stores[args.store] ){
                console.error( "Store '" + args.store + "' already registered.");
            }
            else{
                this.stores[args.store] = new cycligent.ajax.Cache.Store(
                    args.store,
                    this,
                    args.itemConstructor,
                    args.itemConstructorArgs,
                    args.parentStore,
                    args.isRecursive,
                    args.addToParentItem,
                    args.parentInjectionProperty,
                    args.linkToParentProperty,
                    args.parentField,
                    args.injectionArray,
                    args.multipleFetchesAllowed,
                    args.deDup,
                    args.maxRowsReturned,
                    args.lookupSpec,

                    args.notify,
                    args.handleDuplicates,
                    args.mergeItem,
                    args.afterTransaction,
                    args.interval,
                    args.hotCachingAutoStart,
                    args.hotCachingCriteria,
                    args.timeout,
                    args.useLongPolling
                );
            }

            return this.stores[args.store];

        },

        /* @cycligentDoc {Method}
         * Requests data from the server through the gateway.
         */
        request: function(){
            var args = cycligent.args(arguments, {
                postData: {type: Object},	// The data to post to the server with the request.
                jQueryOptions: {type: Object, required: false}, // Options to pass to $.ajax
                nonBlocking: {type: Boolean, required: false} // Indicates that this request shouldn't block other requests, even if sequence is important.
            });

            return this.gateway.request( this.gatewayTarget, args.postData, args.jQueryOptions, args.nonBlocking );
        },

        /* @cycligentDoc {Method}
         * INTERNAL USE ONLY. Handles a response from the
         * server via the gateway.
         */
        response: function(){
            var args = cycligent.args(arguments, {
                dataTarget: {type: Object}		// The XML target node associated with the response.
            });

            var me = this;

            var store_id;
            var active_id = '';
            var store;
            var criteria;
            var request_id = args.dataTarget.request.toString();
            var request;
            var parentId;
            var maxRowsReturned;

            // Make sure the request is still valid
            if( me.pendingRequests[request_id] ){
                request = me.pendingRequests[request_id];
            }
            else{
                // Its not so just ignore it.
                return;
            }

            if (args.dataTarget.nextHotTranTime !== undefined)
                request.store.nextHotTranTime = args.dataTarget.nextHotTranTime;
            if (args.dataTarget.futureDuplicates !== undefined)
                request.store.futureDuplicates = args.dataTarget.futureDuplicates;

            $.each(args.dataTarget.stores, function(){

                store_id = this.id;
                store = me.stores[store_id];

                if( store ){
                    request.storesReturned.push(store);
                    var childrenCount = this.items.length;
                    maxRowsReturned = childrenCount >= (cycligent.Session && cycligent.Session.singleton.isSessionDataLoaded() ? cycligent.Session.singleton.configGet('itemsPerPage') : 25);

                    // Only return the active id from the first
                    // returned store - which is the response to
                    // the request
                    store.active_id = this.active_id;
                    if( !active_id ){
                        active_id = store.active_id;
                    }
                    criteria = this.criteria;

                    if( store.addToParentItem ){
                        parentId = criteria[store.linkToParentProperty];
                        if(!parentId){
                            console.error( "Parent id '"
                                + store.linkToParentProperty
                                + "' not specified in criteria '" + criteria + "'."
                            );
                        }
                    }
                    else{
                        parentId = null;
                    }

                    if( !store.multipleFetchesAllowed
                        && Object.keys(store.fetchedCriteria).length > 0 && !request.extendedFetch
                        ){
                        store.reset();
                    }

                    /*
                    We set both the criteria we got back (cleanCriteria) and request.criteria to fetched.
                    Originally we only had cleanCriteria, but if a server-side function unintentionally
                    mangled the criteria, requests would appear to pend forever. That was bad.

                    In theory, I think we should only be using the request.criteria, but some code actually
                    relies on this functionality (notable instance: the Session), so for now we'll leave it.
                     */
                    var cleanCriteria = JSON.stringify(criteria);
                    store.fetchedCriteria[cleanCriteria] = cycligent.ajax.fetchStatusTypes.fetched;
                    store.fetchedCriteria[request.criteria] = cycligent.ajax.fetchStatusTypes.fetched;

                    if(this.items){
                        var itemsStored = store.jitemsStore(this.items, parentId, true, request);
                        request.itemsStored.push.apply(request.itemsStored, itemsStored);
                        request.itemsStoredPerStore[store.id] = itemsStored;
                    }

                    if(this.json){
                        store.injectionArray.push(this);
                    }
                }
                else{
                    console.error( "Unrecognized store '" + store_id + "' returned from server on Cache request.");
                }
            });

            // Store from request didn't make it into storesReturned, we must be dealing with a Cache Plan,
            // not a Cache Service.
            if (request.storesReturned.indexOf(request.store) == -1
                && request.itemsStoredPerStore[request.store.id] === undefined) {
                request.storesReturned.push(request.store);
                request.itemsStoredPerStore[request.store.id] = request.itemsStored;
            }

            if (request.callbackIfDone()) {
                me.deleteRequest(request);
            } else {
                request.executeExtendedFetch(function() {
                    me.deleteRequest(request);
                });
            }
        },

        /* @cycligentDoc {Method}
         * Removes a finished request from the pendingRequests list of cycligentCache.
         */
        deleteRequest: function() {
            var args = cycligent.args(arguments, {
                request: {type: cycligent.ajax.Cache.Request},
                clearFetchedCriteria: {type: Boolean, required: false, defaultValue: false}
            });
            var me = this;

            delete args.request.store.pendingRequestIndexes[args.request.id];
            delete args.request.store.pendingRequestsByCriteria[args.request.criteria];
            delete me.pendingRequests[args.request.id];
            if (args.clearFetchedCriteria) {
                var cleanCriteria = JSON.stringify(args.request.criteria);
                delete args.request.store.fetchedCriteria[args.request.criteria];
                delete args.request.store.fetchedCriteria[cleanCriteria];
            }
        }
    }
});

cycligent.class({
    name: "cycligent.ajax.Hierarchy",
    extends: "cycligent.ajax.Cache",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway}			// The gateway for processing of data requests by the server.
            });

            var me = this;

            $.extend(me,args);

            me.isHierarchy = true;

            me.stores = [];									//@cycligentDoc {Property:[cycligent.ajax.Cache.Store]} Stores maintained by the cache.
            me.pendingRequests = {};						//@cycligentDoc {Property:[cycligent.ajax.Cache.Request]} Requests awaiting a response from the gateway (server).
            me.gatewayTarget = me.gateway.register( "cycligentHierarchy", me.response, me, true );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the cache.

        }
    }
});

cycligent.class({
    name: "cycligent.ajax.Timer",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway}			// The gateway for processing of data requests by the server.
            });

            var me = this;

            $.extend(me,args);

            me.gateway.register( "cycligentTiming", me.response, me, false );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the cache.

        },

        response: function(){
            var args = cycligent.args(arguments, {
                data: {type: Object}		// The XML target node associated with the response.
            });

            var me = this;

            var request = args.data.request;
            var totalTime = (new Date()).getTime() - me.gateway.requestTimes[request];
            delete me.gateway.requestTimes[request];
            var serverTime = args.data.totalTime;
            var netTime = totalTime - serverTime;

            cycligent.timing.event("Ajax Request", undefined , totalTime);
            cycligent.timing.indent();
            cycligent.timing.event("Network", undefined, netTime);
            cycligent.timing.event("Server", undefined, serverTime);
            cycligent.timing.indent();
            cycligent.timing.event("Process", undefined, args.data.processTime);
            cycligent.timing.event("Database", undefined, args.data.databaseTime);
            cycligent.timing.indent();

            var timings = args.data.json;

            $(timings).each(
                function(){
                    cycligent.timing.event(this[0], undefined, this[1]);
                }
            );

            cycligent.timing.unindent();
            cycligent.timing.unindent();
            cycligent.timing.unindent();
        }
    }
});

cycligent.class({
    name: "cycligent.ajax.Message",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway}			// The gateway for processing of data requests by the server.
            });

            var me = this;


            $.extend(me,args);

            me.gateway.register( "cycligentMessage", me.response, me, false );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the cache.

        },
        register: function(){
            var args = cycligent.args(arguments, {
                callFunction: {type: Function},
                parent: {type: "Any"}
            });
            var me = this;
            me.callFunction = args.callFunction;
            me.parent = args.parent;
        },
        response: function(){
            var args = cycligent.args(arguments, {
                xmlNode: {type: "XmlNode:target"}		// The XML target node associated with the response.
            });

            var me = this;
            //TODO: 3. This will need to change
            var xmlNode = args.xmlNode;
            var index;

            var newMsgIndex = -1;
            var messages = [];

            $(xmlNode).find("jmessage").each(
                function(){
                    messages.push($.parseJSON($(xmlNode).text()));
                }
            );

            if(messages.length > 0){
                for(index in messages[0]){
					if(!messages[0].hasOwnProperty(index)) continue;

                    var msg = messages[0][index];
                    newMsgIndex = -1;
                    for(var msgIndex in cycligent.message.messages){
						if(!cycligent.message.messages.hasOwnProperty(msgIndex)) continue;

                        var checkMsg = cycligent.message.messages[msgIndex];
                        if(checkMsg.id == msg.id){
                            newMsgIndex = Number(msgIndex);
                            break;
                        }
                    }
                    if(newMsgIndex == -1){
                        //var strTagStrippedText = msg.messageAbstract.replace(/<\/?[^>]+(>|$)/g, "");
                        cycligent.message.component(msg.id, msg.type, msg.name, msg.messageAbstract, msg.moreContent, msg.newTill, msg.popup);
                    }else{
                        cycligent.message.messages[newMsgIndex].type = msg.type;
                        cycligent.message.messages[newMsgIndex].name = msg.name;
                        cycligent.message.messages[newMsgIndex].messageAbstract = msg.messageAbstract;
                        cycligent.message.messages[newMsgIndex].moreContent = msg.moreContent;
                        cycligent.message.messages[newMsgIndex].newTill = msg.newTill;
                        cycligent.message.messages[newMsgIndex].popup = msg.popup;
                    }
                    if(me.callFunction){
                        if(msg.popup == "true"){
                            me.callFunction(msg.name, msg.messageAbstract, me.parent);
                        }
                    }
                }
            }
        }
    }
});

/* @cycligentDoc {Class}
 * A request made of the gateway by the cache or query.
 */
cycligent.class({
    name: "cycligent.ajax.Cache.Request",
    definition: {

        init: function() {
            var args = cycligent.args(arguments, {
                id: {type: Number},								// The id of the request.
                store: {type: cycligent.ajax.Cache.Store},				// The store associated with the request.
                criteria: {type: String},                       // The criteria used by this request to fetch data from the server.
                callbacks: {type: Array},				        // The functions to call when the gateway responds to the request.
                extendedFetch: {type: Boolean, required: false, defaultValue: false}	// Flag to indicate whether or not we want an extended fetch to happen with this request.
            });

            $.extend(this,args);
            this.extendedFetchCount = 0; //@cycligentDoc {Property:[Number]} Counts the number of extended fetches that we're waiting to complete for this request.
            this.extendedFetchPending = {};
            this.itemsStored = [];
            this.storesReturned = [];
            this.itemsStoredPerStore = {};
        },

        /* @cycligentDoc {Method}
         * If the request has completed, call the callback.
         *
         * Will return true if it has completed, false if it hasn't.
         */
        callbackIfDone: function() {
            var me = this;
            if (me.extendedFetch == false || (me.extendedFetch == true && me.extendedFetchCount == 0)) {
                for (var i = 0; i < me.callbacks.length; i++) {
                    me.callbacks[i](this.store.active_id, this.itemsStored);
                }
                for (i = 0; i < me.storesReturned.length; i++) {
                    var store = me.storesReturned[i];
                    store.notify(store.active_id, me.itemsStoredPerStore[store.id]);
                }
                return true;
            } else {
                return false;
            }
        },

        /* @cycligentDoc {Method}
         * Adds the given id in the given store as something we need to go get
         * through extended fetch before this request can be considered "complete".
         *
         * @Remarks
         * See also extendedFetchExecute, which should be called after all
         * calls to addExtendedFetch so that they can all be processed at once.
         */
        addExtendedFetch: function() {
            var args = cycligent.args(arguments, {
                store: {type: cycligent.ajax.Query.Store},
                id: {type: String},
                callback: {type: Function}
            });
            var me = this;
            if (!me.extendedFetchPending[args.store.id]) {
                me.extendedFetchPending[args.store.id] = {store: args.store, callbacks: [args.callback], ids: [args.id]};
            } else {
                me.extendedFetchPending[args.store.id].callbacks.push(args.callback);
                me.extendedFetchPending[args.store.id].ids.push(args.id);
            }

            me.extendedFetchCount++;
        },

        /* @cycligentDoc {Method}
         * Performs the fetches asked for in addExtendedFetch.
         *
         * Makes one request per store.
         */
        executeExtendedFetch: function() {
            var args = cycligent.args(arguments, {
                callback: {type: Function}
            });
            var me = this;
            for (var id in me.extendedFetchPending) {
                if (me.extendedFetchPending.hasOwnProperty(id)) {
                    var data = me.extendedFetchPending[id];

                    data.store.fetch(
                        {_id: {$in: cycligent.ajax.util.unique(data.ids)}},
                        (function(data) {
                            return function() {
                                for (var i = 0; i < data.callbacks.length; i++) {
                                    data.callbacks[i]();
                                    me.extendedFetchCount--;
                                }

                                if (me.callbackIfDone()) {
                                    args.callback();
                                }
                            };
                        })(data), me, true, true
                    );
                }
            }
        }
    }
});

/* @cycligentDoc {Property}
 * Ajax fetch status types enumeration.
 */
cycligent.ajax.fetchStatusTypes = {
    pending: 1,		//@cycligentDoc {Property:Number} Indicates that the fetch (request) for data is still pending.
    fetched: 2		//@cycligentDoc {Property:Number} Indicates that the data has been fetched and is available.
};

/* @cycligentDoc {Class}
 * Ajax cache store.
 */
cycligent.class({
    name: "cycligent.ajax.Cache.Store",
    definition: {

        init: function(){
            var me = this;
            var args = cycligent.args(arguments, {
                id: {type: String},												// The id of the store.
                cache: {type: cycligent.ajax.Cache},									// The cache that contain/manages the store.
                itemConstructor: {type: Object, required: false},				// The constructor for the creation of items put into the store.
                itemConstructorArgs: {type: Object, required: false},   		// The arguments definition specification for the constructor for the creation of items put into the store.
                parentStore: {type: cycligent.ajax.Cache.Store, required: false},			// The parent store of this store. When specified whenever the parent store changes this store is invalidated and cleared.
                isRecursive: {type: Boolean, required: false},					// When true, all items are added into the injection array, and items within the array are linked to one another.
                addToParentItem: {type: Boolean, required: false},				// When true, items are injected into the parent object in the parent store.
                parentInjectionProperty: {type: String, required: false, defaultValue: ''},			// The property name of parent object into which this object should be injected.
                linkToParentProperty: {type: String, required: false},						// The store id of parent object into which this object should be injected.
                parentField: {type: String, required: false},					// The name of the field in the child object that you would like linked to the parent object.
                injectionArray: {type: Array, required: false},					// The array that holds objects that are created/stored by this store.
                multipleFetchesAllowed: {type: Boolean, required: false, defaultValue: false},		// Normally whenever a new fetch is requested the store is invalidated and cleared. When true, the cache allows multiple fetches and stores all data fetched, the store is only invalidated and cleared when the parent store changes.
                deDup: {type: Boolean, required: false, defaultValue:false},    // when true, , upon receipt from the server, id comparison is made to ensure that duplicate entries are not injected to the array
                maxRowsReturned: {type: Number, required: false}, // Controls how many rows are returned per fetch
                lookupSpec: {type: Object, required: false},	// Contains the lookup spec for data linking (maps attributes to stores with documents that have an _id equal to the value of the attribute. Also, you can provide an array of documents instead of a store if you want.)

                notify: {type: Function, required: false, defaultValue: function() {}}, // The function to call after every fetch (whether that fetch was automatically triggered or manual.)
                handleDuplicates: {type: String, required: false, defaultValue: "keepBoth"}, // Specifies how we should handle duplicates when we encounter one in the injection array. Possible values are "discardOld", "discardNew", "keepBoth", or "merge".
                mergeItem: {type: Function, required: false, defaultValue: me.mergeItem.bind(me)}, // Merges new data with old data. By default this copies the values contained in the new JSON received from the server into the object already stored in the cache. You can provide your own function to perform this operation if there are some special considerations. The function must take two arguments (the new data, and the existing data), and return the result of the merge (likely the existing item, but it doesn't have to be.)
                afterTransaction: {type: Function, required: false, defaultValue: function() {}}, // Called after an object has been added or updated in the injectionArray. The function receives the object, and a string flag that will contain either "added" or "updated" depending on what happened. Note this only gets called when changes are made by the cycligentCache or cycligentQuery code, not when your own code updates or adds something.
                interval: {type: Number, required: false, defaultValue: 1000 * 60}, // Time in milliseconds between updates when using hot caching or long-polling. If you are using hot caching, the cache will wait this amount of time before doing the first update, so you may want to manually fetch first. For long-polling, the server institutes a floor of how frequently you can check for updates, which defaults to 50ms.
                hotCachingAutoStart: {type: Boolean, required: false, defaultValue: false}, // Whether or not to automatically start fetching from the store via the hot caching mechanism. If this is false, you'll have to call hotCachingStart.
                hotCachingCriteria: {type: "Any", required: false, defaultValue: {}}, // The criteria (or a function that returns the criteria) to be used to fetch the data when doing hot caching. Type is actually Function|Object, so you can have a function dynamically return the criteria if you want to.
                timeout: {type: Number, required: false, defaultValue: cycligent.config.providerTimeout}, // By default requests will timeout after the time set in cycligent.config.providerTimeout. If you have a query that will take a while for some reason (or if you're using hot caching, which can utilize long polling to minimize the number of requests) you can specify a timeout to use.
                useLongPolling: {type: Boolean, required: false, defaultValue: false} // If no results are returned from a cache fetch, keep fetching server-side until we have some results. Respects the interval config option and the timeout config option.
            });

            $.extend(me,args);

            me.active_id = 0;					//@cycligentDoc {Property:Number} The id of the active/selected/open item within the store 0 if no item is selected.
            me.stores = [];						//@cycligentDoc {Property:[cycligent.ajax.Cache.Store]} Childrens stores.
            me.pendingRequestIndexes = {};		//@cycligentDoc {Property:[Number]} Pending request indexes.
            me.pendingRequestsByCriteria = {};         //@cycligentDoc {Property:Object} The requests made on this store, accessible by criteria.
            me.fetchedCriteria = {};			//@cycligentDoc {Property:[String]} The criteria of items fetched that have been requested from the server or are currently in the store.
            me.futureDuplicates = [];           //@cycligentDoc {Property:[Array]} The hotcaching mechanism will sometimes send duplicates, and we send it this field to help reduce the chances of that.
            me.failFunctions = [];

            if( args.parentStore ){
                args.parentStore.stores.push( me );
            }

            if( me.isRecursive ){
                me.parentStore = me;
            }

            if (me.deDup) {
                me.handleDuplicates = "discardNew";
            }

            me.intervalID = null;

            if (me.hotCachingAutoStart) {
                me.hotCachingStart();
            }
        },

        /**
         * Register a notification function
         *
         * @method
         *
         * @param func {function} The function to be called whenever a console
         * message is logged or console messages are cleared. The notify function
         * should accept one argument ({@link cycligent.console.Message}) which
         * will be contain the new console message. If the message is not passed
         * to the function (undefined) then the console messages were cleared.
         */
        failFunctionRegister: function (func) {
            var me = this;
            // Make sure we don't add a function more than once.
            for(var index = 0; index < me.failFunctions.length; index++){
                if(func === me.failFunctions[index]){
                    return;
                }
            }
            me.failFunctions.push(func)
        },

        /**
         * Unregister a notification function
         *
         * @method
         *
         * @param func {function} The notify function to unregister.
         */
        failFunctionClear: function (func) {
            var me = this;
            for(var index = 0; index < me.failFunctions.length; index++){
                if(func === me.failFunctions[index]){
                    me.failFunctions.splice(index,1);
                    index--;
                }
            }
        },


        /* @cycligentDoc {Method}
         * Change the interval at which the hot caching mechanism checks for updates.
         */
        hotCachingIntervalSet: function() {
            var me = this;
            var args = cycligent.args(arguments, {
                newInterval: {type: Number, required: true}
            });
            me.hotCachingStop();
            me.interval = args.newInterval;
            me.hotCachingStart();
        },

        /* @cycligentDoc {Method}
         * Configures the store for some hot caching defaults.
         *
         * @Remarks
         * cycligentCache and cycligentQuery have a lot of options, and it can be easy to miss
         * the optimal options for hot caching. This function highlights all relevant
         * options, and gives some sensible defaults for hot caching (which may be
         * different than the defaults provided by the cache constructor, because not
         * all caches will be hot caches, and therefore the options will be
         * different.)
         *
         * multipleFetchesAllowed, handleDuplicates, timeout, and useLongPolling are
         * set to defaults that will override whatever was given in the constructor.
         * Everything else is left as it was.
         *
         * After calling this function, you'll probably want to call hotCachingStart.
         */
        hotCachingConfigure: function() {
            var me = this;
            var args = cycligent.args(arguments, {
                multipleFetchesAllowed: {type: Boolean, required: false, defaultValue: true},
                handleDuplicates: {type: String, required: false, defaultValue: "merge"},
                timeout: {type: Number, required: false, defaultValue: 1000 * 60 * 2},
                useLongPolling: {type: Boolean, required: false, defaultValue: true},

                notify: {type: Function, required: false, defaultValue: me.notify},
                mergeItem: {type: Function, required: false, defaultValue: me.mergeItem},
                afterTransaction: {type: Function, required: false, defaultValue: me.afterTransaction},
                interval: {type: Number, required: false, defaultValue: me.interval},
                hotCachingCriteria: {type: "Any", required: false, defaultValue: me.hotCachingCriteria}
            });

            if (me.intervalID != null) {
                console.warn("hotCachingConfigure was called for store '" + me.id + "' after hot caching had already begun!");
            } else {
                $.extend(me, args);
            }
        },

        /* @cycligentDoc {Method}
         * Begin the automated fetches that facilitate hot caching.
         *
         * @Remarks
         * See also: hotCachingStart
         */
        hotCachingStart: function() {
            var me = this;
            if (me.intervalID == null) {
                me.intervalID = setInterval(me.hotCachingPoll.bind(me), me.interval);
            }
        },

        /* @cycligentDoc {Method}
         * Stop/pause the caching.
         *
         * @Remarks
         * See also: hotCachingStart
         */
        hotCachingStop: function() {
            var me = this;
            if (me.intervalID != null) {
                clearInterval(me.intervalID);
                me.intervalID = null;
            }
        },

        /**
         * Given some criteria, and the date we're going to use for the criteria,
         * insert the date in a way that makes sense for the type of store that's
         * implementing this method.
         *
         * Returns the new criteria.
         *
         * I believe this will only ever be used internally to cycligentCache/cycligentQuery.
         *
         * @param {Object} criteria The criteria we're sending to the server.
         * @param {Number|Undefined} date The number representing the Date we're dealing with.
         * @return {Object} Return the criteria object that was passed to it.
         */
        hotCachingUpdateCriteria: function(criteria, date) {
            var me = this;
            if (date === undefined) {
                date = {$hotTranTime: 1};
            }
            criteria["hotTranTime"] = date;
            return {criteria: criteria};
        },

        /* @cycligentDoc {Method}
         * Polls the server for any updates to the cache.
         *
         * @Remarks
         * Normally this is called automatically by the cache, but
         * if you wanted to force a hot cache update to occur, you
         * can call this method directly.
         */
        hotCachingPoll: function() {
            var me = this;
            var criteria;

            if (typeof me.hotCachingCriteria == "function") {
                criteria = me.hotCachingCriteria();
            } else {
                criteria = me.hotCachingCriteria;
            }

            criteria = me.hotCachingUpdateCriteria(criteria, me.nextHotTranTime);
            me.hotCachingFetchHelper({criteria: criteria});
        },

        /* @cycligentDoc {Method}
         * INTERNAL USE ONLY
         *
         * A helper function for doing a fetch for hotCaching.
         * If you want to manually trigger a hotCache fetch before
         * the interval causes one, use hotCachingPoll instead.
         */
        hotCachingFetchHelper: function() {
            var me = this;
            var args = cycligent.args(arguments, {
                criteria: {type: Object, required: true}
            });
            me.fetch({
                request: args.criteria,
                forHotCaching: true
            });
        },

        /* @cycligentDoc {Method}
         * Resets the store.
         *
         * @Remarks
         * Resetting the store causes each of the store's children
         * stores to be reset.  Any of its pending requests
         * to be invalidated. And all data and fetched criteria
         * information to be deleted from the store.
         */
        //TODO: 3. Think reset should only be callable on the gateway!!!
        reset: function(){
            cycligent.args(arguments, {} );

            var me = this;

            // Reset any children stores
            /* To do delete if the jQuery item below is working correctly
             for( var index; index < me.stores.legnth; index++ ){
             me.stores[index].reset();
             }
             */

            /* @cycligentDoc {Function}
             * Enumerator.
             */
            $.each(me.stores, function(){
                this.reset();
            });

            // Clear fetchedCritria
            me.fetchedCriteria = {};

            // Invalidate any pending requests
            /* @cycligentDoc {Function}
             * Enumerator.
             */
            $.each(me.pendingRequestIndexes, function(){
                delete me.cache.pendingRequests[this];
            });
            me.pendingRequestIndexes = {};
            me.pendingRequestsByCriteria = {};

            // Delete any injected data
            if( me.injectionArray ){
                me.injectionArray.length = 0;
            }
        },

        /* @cycligentDoc {Method}
         * Fetches data from the cache or if not present in the
         * cache from the server via the cache.
         */
        fetch: function(){
            var me = this;
            var args = cycligent.args(arguments, {
                request: {type: Object}, // The criteria that specifies the desired data.
                callback: {type: Function, required: false, defaultValue: function() {}}, // The response function to be called when the data is available.  If the data is already in the cache this function is called immediately.
                context: {type: "Any", required: false}, // The reference data to pass to the function open the data being ready.
                extendedFetch: {type: Boolean,required: false, defaultValue:false},
                searchText: {type: String,required: false, defaultValue:""},
                otherCriteria: {type: String,required: false, defaultValue:""},
                timeout: {type: Number, required: false, defaultValue: me.timeout}, // By default requests will timeout after the time set in cycligent.config.providerTimeout. If you have a query that will take a while for some reason (or if you're using hot caching, which can utilize long polling to minimize the number of requests) you can specify a timeout to use.
                useLongPolling: {type: Boolean, required: false, defaultValue: me.useLongPolling}, // Allows you to override the option set on the cache for a specific fetch. If no results are returned from a cache fetch, keep fetching server-side until we have some results. Uses the same interval as the hot caching interval.
                forHotCaching: {type: Boolean, required: false, defaultValue: false} // INTERNAL USE ONLY, changes a few things for fetches created by the hot caching mechanism.
            });
            var requestId;

            if(!args.request.criteria){
                args.request.criteria = {};
            }

            args.request.criteria.store = me.id;
            if (args.forHotCaching) {
                args.request.hotCaching = true;
                args.request.duplicates = me.futureDuplicates;
                args.request.interval = me.interval;
            }
            if (args.useLongPolling) {
                args.request.useLongPolling = args.useLongPolling;
                args.request.timeout = args.timeout;
                args.request.interval = me.interval;
            }

            var inCache = false;

            var searchText = args.searchText;
            var otherCriteria = args.otherCriteria;

            var cleanCriteria = JSON.stringify(args.request.criteria);

            if(me.fetchedCriteria[cleanCriteria] == cycligent.ajax.fetchStatusTypes.fetched){
                inCache = true;
                if(args.context){
                    args.callback.call( args.context, me.active_id, [] );
                }else{
                    args.callback(me.active_id, []);
                }
            }

            if(!inCache) {

                if( !me.multipleFetchesAllowed && !args.extendedFetch){
                    me.reset();
                }

                if (me.fetchedCriteria[cleanCriteria] == cycligent.ajax.fetchStatusTypes.pending) {
                    me.pendingRequestsByCriteria[cleanCriteria].callbacks.push(args.callback.bind(args.context));
                } else {
                    me.fetchedCriteria[cleanCriteria] = cycligent.ajax.fetchStatusTypes.pending;

                    if (args.forHotCaching)
                        requestId = me.cache.request( args.request, {timeout: args.timeout}, true );
                    else
                        requestId = me.cache.request( args.request, {timeout: args.timeout} );

                    var requestObject =
                            new cycligent.ajax.Cache.Request(
                                requestId,
                                me,
                                cleanCriteria,
                                [args.callback.bind(args.context)],
                                args.extendedFetch
                            )
                        ;

                    me.cache.pendingRequests[requestId] = requestObject;
                    me.pendingRequestsByCriteria[cleanCriteria] = requestObject;
                    me.pendingRequestIndexes[requestId] = requestId;
                }
            }

            return inCache;
        },

        //noinspection JSUnfilteredForInLoop
        typesWire: function(item, request){

            var me = this;
            var index;
            var property;
            var parentObjId;
            var lookedUpStore;

            // Build the argument map for the itemConstructor
            for( index in item ){
			   if(!item.hasOwnProperty(index)) continue;

                if(this.lookupSpec[index]){

                    var value = item[index];

                    if( value ){
                        if(index == "_id"){
                            parentObjId = value;
                        }
                        lookedUpStore = me.lookupSpec[index];
                        if (lookedUpStore !== undefined && lookedUpStore instanceof cycligent.ajax.Cache.Store) {
                            var retrieved = cycligent.ajax.util.findItemById(value, lookedUpStore.injectionArray);
                            if (retrieved != null) {
                                item[index] = retrieved;
                            } else {
                                if (request.extendedFetch && lookedUpStore instanceof cycligent.ajax.Query.Store) {
                                    request.addExtendedFetch(lookedUpStore, value, function() {
                                        me.typesWire(item, {});
                                    });
                                } else {
                                    item[index] = null;
                                    if( !me.isRecursive || value != "" ){
                                        console.error( "Unrecognized lookup id '"
                                            + value
                                            + "' was returned from the server. A null link will be injected for '" + index + "'."
                                        );
                                    }
                                }
                            }
                        }else{
                            if(index.substr(index.length-3) == '_id'){
                                property = index.substr(0,index.length-3);
                            }else{
                                property = index;
                            }
                            item[property] = cycligent.ajax.util.findItemById(value, me.lookupSpec[index]);
                            if( !item[property] ){
                                if( !me.isRecursive || value != "" ){
                                    console.error( "Unrecognized lookup id '"
                                        + value
                                        + "' was returned from the server. A null link will be injected for '" + property + "'."
                                    );
                                }
                            }
                        }
                    }
                }
            }
        },

        /* @cycligentDoc {Method}
         * Stores an item (object) in the cache of the store's parent
         * cache, if it has one.
         *
         * @Remarks
         * See also: storeItem
         */
        storeItemIntoParent: function(){
            var args = cycligent.args(arguments, {
                lastItemAdded: {type: Object},
                lastItem: {type: Boolean},
                parentId: {type: String, required: false},
                request: {type: "Any", required: false, defaultValue: {}}
            });

            var me = this;
            var parentItem;
            var item = args.lastItemAdded;

            // Do lookups as necessary
            if(me.lookupSpec){
                me.typesWire(item, args.request);
            }

            if( args.parentId ){
                parentItem = cycligent.ajax.util.findItemById(args.parentId, me.parentStore.injectionArray);

                if (parentItem) {
                    if (me.addToParentItem && me.parentInjectionProperty != '') {
                        if (!parentItem[me.parentInjectionProperty]) {
                            parentItem[me.parentInjectionProperty] = [];
                        }
                        item = me.storeItemHelper({
                            newItem: item,
                            injectionArray: parentItem[me.parentInjectionProperty],
                            useItemConstructor: false
                        });
                    }

                    if (item && me.parentField) {
                        item[me.parentField] = parentItem;
                    }
                }
                else {
                    if (args.request.extendedFetch && me.parentStore instanceof cycligent.ajax.Query.Store) {
                        args.request.addExtendedFetch(me.parentStore, args.parentId, function() {
                            me.storeItemIntoParent(item, args.lastItem, args.parentId, {});
                        });
                    } else {
                        console.error("Unrecognized parent id '"
                            + args.parentId
                            + "' in item id '"
                            + item.id
                            + "' was returned from the server for store '"
                            + me.parentStore.id
                            + "'. Item will be not injected for parent property '"
                            + me.parentInjectionProperty + "'."
                        );
                    }
                }
            }

        },

        /* @cycligentDoc {Method}
         * Stores an item (object) in the cache.
         *
         * @Remarks
         * storeItem takes the provided object and converts it to
         * an object of the appropriate type and injects it into
         * the object store.
         *
         * See also: storeItemIntoParent, storeItemHelper
         */
        storeItem: function(newItem) {
            var me = this;

            return me.storeItemHelper({
                newItem: newItem,
                injectionArray: me.injectionArray,
                useItemConstructor: true
            });
        },

        /* @cycligentDoc {Method}
         * A helper for storeItem, and related functions.
         * It helps facilitate inserting items into injectionArrays.
         *
         * @Remarks
         * storeItemHelper takes an item to store, the injection array
         * to put it in, and whether or not to use the item constructor
         * on the new item, and then inserts the item into the injection
         * array based on various store configurations.
         *
         * Note that if the injectionArray is not provided, nothing will
         * be done with it.
         *
         * It is possible the item passed to this function will be modified
         * (by the merging process, or by the item constructor), this
         * function will returne modified item, which callers will likely
         * want to keep track of.
         *
         * See also: storeItem, storeItemIntoParent
         */
        storeItemHelper: function() {
            var args = cycligent.args(arguments, {
                newItem: {type: "Any", required: true},
                injectionArray: {type: Array, required: false, defaultValue: undefined},
                useItemConstructor: {type: Boolean, required: true}
            });

            var me = this;
            var newItem = args.newItem;

            var existingItem = null;
            var existingItemIndex = null;
            if (args.injectionArray) {
                existingItemIndex = me.itemIndex(args.injectionArray, newItem);
                if (existingItemIndex != null)
                    existingItem = args.injectionArray[existingItemIndex];
            }

            if (args.useItemConstructor && me.itemConstructor) {
                if (!existingItem || me.handleDuplicates == "discardOld" || me.handleDuplicates == "keepBoth") {
                    newItem = new me.itemConstructor(newItem); // This could be problematic with partial documents, cycligentCache/cycligentQuery consumers will need to be careful with this.
                }
            }

            var chosenItem = newItem;
            if (args.injectionArray) {
                if (!existingItem) {
                    args.injectionArray.push(newItem);
                    me.afterTransaction(newItem, "added");
                } else {
                    switch (me.handleDuplicates) {
                        case "discardOld":
                            args.injectionArray[existingItemIndex] = newItem;
                            me.afterTransaction(newItem, "updated");
                            break;
                        case "discardNew":
                            chosenItem = null;
                            break;
                        case "keepBoth":
                            args.injectionArray.push(newItem);
                            me.afterTransaction(newItem, "added");
                            break;
                        case "merge":
                            chosenItem = me.mergeItem(newItem, existingItem);
                            if (chosenItem != existingItem)
                                args.injectionArray[existingItemIndex] = chosenItem;
                            if (chosenItem == null)
                                console.error("mergeItem for store '" + me.id + "' returned a null or undefined value.");
                            me.afterTransaction(chosenItem, "updated");
                            break;
                    }
                }
            }

            return chosenItem;
        },

        /* @cycligentDoc {Method}
         * Merges two objects together by assigning every value in newData
         * to existingData.
         *
         * @Remarks
         * This is called when storing items, when handleDuplicates is set
         * to "merge". Users of cycligentCache/cycligentQuery can pass a mergeItem function
         * that will override this if they desire the merge to work some
         * other way.
         * See also: storeItem
         */
        mergeItem: function(newData, existingData) {
            for (var field in newData) {
				if(!newData.hasOwnProperty(field)) continue;

                //noinspection JSUnfilteredForInLoop
                existingData[field] = newData[field];
            }
            return existingData;
        },

        /* @cycligentDoc {Method}
         * Inserts some items into the cache store.
         *
         * Generally for internal use only.
         *
         * @Remarks
         * See also: storeItem
         */
        jitemsStore: function(){
            var args = cycligent.args(arguments, {
                jsonData: {type: Array},		// The data to inject into the store.
                parentId: {type: String, required: false},	// The id of the parent object into which this item should be injected.
                storeItem: {type: Boolean, required: false, defaultValue: true}, // Whether or not to add the given item to this store's injection array.
                request: {type: "Any", required: false}
            });
            var me = this;
            var jsonData = args.jsonData;
            var itemsStored = [];

            for(var i = 0; i < jsonData.length; i++){
                var item = jsonData[i];
                if (args.storeItem) {
                    item = me.storeItem(item);
                    if (item) {
                        itemsStored.push(item);
                    }
                }
                me.storeItemIntoParent(item, i == jsonData.length - 1, args.parentId, args.request);
            }

            return itemsStored;
        },

        /* @cycligentDoc {Method}
         * Checks whether or not the given item (lastItemAdded) is
         * present in the given array. This function isn't used
         * anymore, and may be removed soon.
         *
         * @Remarks
         * See also: itemIndex
         */
        isItemExists: function(array, lastItemAdded){

            for(var index in array){
				if(!array.hasOwnProperty(index)) continue;

				if(array[index]._id === lastItemAdded._id ){
                    return true;
                }
            }

            return false;
        },

        /* @cycligentDoc {Method}
         * Loops through the given array looking for the given item.
         * Uses "==" to compare the _id field of the passed item and
         * the items in the array. Returns the index, or null if
         * an item with the same _id wasn't found in the array.
         *
         * @Remarks
         * See also: isItemExists
         */
        itemIndex: function(array, item) {
            var me = this;

            for (var i = 0; i < array.length; i++) {
                if (array[i]._id == item._id)
                    return i;
            }

            return null;
        }
    }
});



/* @cycligentDoc {Class}
 * A data query that requests data from the server when
 * necessary via Ajax.
 *
 * @Remarks
 * Improvement Interactive caches query data requested
 * from the server. They facilitate not only typical
 * caching but eager caching where the server may return
 * more data than requested. Improvement Interactive
 * caches also inject objects into the specified location
 * (versus maintaining data in another location.
 */
cycligent.class({
    name: "cycligent.ajax.Query",
    extends: "cycligent.ajax.Cache",
    definition: {
        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway}			// The gateway for processing of data requests by the server.
            });

            var me = this;

            $.extend(me,args);

            me.stores = {};									//@cycligentDoc {Property:[cycligent.ajax.Query.Store]} Stores maintained by the cache.
            me.pendingRequests = {};						//@cycligentDoc {Property:[cycligent.ajax.Cache.Request]} Requests awaiting a response from the gateway (server).
            me.gatewayTarget = me.gateway.register( "cycligentQuery", me.response, me, true );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the cache.
        },

        /* @cycligentDoc {Method}
         * Registers a store with the cache.
         * @returns cycligent.ajax.Query.Store
         */
        register: function(){
            var args = cycligent.args(arguments, {
                store: {type: String},									// The id of the store.
                itemConstructor: {type: Object, required: false},			// The constructor for the creation of items put into the store.
                itemConstructorArgs: {type: Object, required: false},		// The arguments definition specification for the constructor for the creation of items put into the store.
                parentStore: {type: cycligent.ajax.Cache.Store, required: false},		// The parent store of this store. When specified whenever the parent store changes this store is invalidated and cleared.
                isRecursive: {type: Boolean, required: false},				// When true, all items are added into the injection array, and items within the array are linked to one another.
                addToParentItem: {type: Boolean, required: false},			// When true, items are injected into the parent object in the parent store.
                parentInjectionProperty: {type: String, required: false, defaultValue: ''},		// The property name of parent object into which this object should be injected.
                linkToParentProperty: {type: String, required: false},			// The field name override for the field in the object being linked to its parent that links to the parent's _id field. The override is used when the field name in the child object is not the default of the parent store name minus the ending 's'.  For instance when the plural store name is categories and the singular is category not categorie as the system would construct by default.
                parentField: {type: String, required: false},				// The name of the field in the child object that you would like linked to the parent object.
                injectionArray: {type: Object, required: false},			// The array that holds objects that are created/stored by this store.
                multipleFetchesAllowed: {type: Boolean, required: false},	// Normally whenever a new fetch is requested the store is invalidated and cleared. When true, the cache allows multiple fetches and stores all data fetched, the store is only invalidated and cleared when the parent store changes.
                deDup: {type: Boolean, required: false, defaultValue:false},// when true, upon receipt from the server, id comparison is made to ensure that duplicate entries are not injected to the array
                lookupSpec: {type: Object, required: false},					// Contains the lookup spec for data linking (maps attributes to stores with documents that have an _id equal to the value of the attribute. Also, you can provide an array of documents instead of a store if you want.)
                maxRowsReturned: {type: Number, required: false},                // Controls how many rows are returned per fetch, you can use the "getMoreRows" option on fetch to get additional unfetched rows.
                handleNonSuccess: {type: Function, required: false},               // A function that will be called if the server returns "error" or "unauthorized" or any other non-success status after a fetch of the query store. It receives the response from the server.

                notify: {type: Function, required: false}, // The function to call after every fetch (automatically triggered or manual.) Note that after data updates, it may be tempting to use this to update the view, but please consider that a full re-render may be much more expensive than minor updates done in the afterTransaction function.
                handleDuplicates: {type: String, required: false}, // Specifies how we should handle duplicates when we encounter one in the injection array. Possible values are "discardOld", "discardNew", "keepBoth", or "merge".
                mergeItem: {type: Function, required: false}, // Merges new data with old data. By default this copies the values contained in the new JSON received from the server into the object already stored in the cache. You can provide your own function to perform this operation if there are some special considerations. The function must take two arguments (the new data, and the existing data), and return the result of the merge (likely the existing item, but it doesn't have to be.)
                afterTransaction: {type: Function, required: false}, // Called after an object has been added or updated in the injectionArray. The function receives the object, and a string flag that will contain either "added" or "updated" depending on what happened. Note this only gets called when changes are made by the cycligentCache or cycligentQuery code, not when your own code updates or adds something.
                interval: {type: Number, required: false}, // Time in milliseconds between updates when using hot caching or long-polling. If you are using hot caching, the cache will wait this amount of time before doing the first update, so you may want to manually fetch first. For long-polling, the server institutes a floor of how frequently you can check for updates, which defaults to 50ms.
                hotCachingAutoStart: {type: Boolean, required: false}, // Whether or not to automatically start fetching from the store via the hot caching mechanism. If this is false, you'll have to call hotCachingStart.
                hotCachingCriteria: {type: "Any", required: false}, // The criteria (or a function that returns the criteria) to be used to fetch the data when doing hot caching. Type is actually Function|Object, so you can have a function dynamically return the criteria if you want to.
                timeout: {type: Number, required: false}, // By default requests will timeout after the time set in cycligent.config.providerTimeout. If you have a query that will take a while for some reason (or if you're using hot caching, which can utilize long polling to minimize the number of requests) you can specify a timeout to use.
                useLongPolling: {type: Boolean, required: false} // If no results are returned from a cache fetch, keep fetching server-side until we have some results. Respects the interval config option and the timeout config option.
            });

            args.store = cycligent.ajax.util.dottedNameExpand(args.store);

            var me = this;
            // Create the store
            if( this.stores[args.store] ){
                console.error( "Query store '" + args.store + "' already registered.");
            } else {
                this.stores[args.store] = new cycligent.ajax.Query.Store(
                    args.store,
                    me,
                    args.itemConstructor,
                    args.itemConstructorArgs,
                    args.parentStore,
                    args.isRecursive,
                    args.addToParentItem,
                    args.parentInjectionProperty,
                    args.linkToParentProperty,
                    args.parentField,
                    args.injectionArray,
                    args.multipleFetchesAllowed,
                    args.deDup,
                    args.lookupSpec,
                    args.maxRowsReturned,
                    args.handleNonSuccess,

                    args.notify,
                    args.handleDuplicates,
                    args.mergeItem,
                    args.afterTransaction,
                    args.interval,
                    args.hotCachingAutoStart,
                    args.hotCachingCriteria,
                    args.timeout,
                    args.useLongPolling
                );
            }

            return this.stores[args.store];

        },

        /* @cycligentDoc {Method}
         * Requests data from the server through the gateway.
         */
        request: function(){
            var args = cycligent.args(arguments, {
                postData: {type: Object},		// The data to post to the server with the request.
                jQueryOptions: {type: Object, required: false}, // Options to pass to $.ajax
                nonBlocking: {type: Boolean, required: false} // Indicates that this request shouldn't block other requests, even if sequence is important.
            });

            return this.gateway.request( this.gatewayTarget, args.postData, args.jQueryOptions, args.nonBlocking );
        },

        /* @cycligentDoc {Method}
         * Handles the response from the gateway.
         */
        response: function(target) {
            var me = this;

            var store = me.stores[target.id];
            var requestId = target.request;
            var request;
            var cleanCriteria = JSON.stringify(target.criteria);

            // Make sure the request is still valid
            if( me.pendingRequests[requestId] ){
                request = me.pendingRequests[requestId];
            } else {
                return; // Its not so just ignore it.
            }
            request.storesReturned = [store];

            if (store) {
                store.fetchedCriteria[cleanCriteria] = cycligent.ajax.fetchStatusTypes.fetched;
            } else{
                console.error( "Unrecognized store '" + target.id + "' returned from server on Query request.");
                return;
            }

            if (target.status != "success") {
                store.handleNonSuccess({target: target});
            }

            if (target.nextHotTranTime !== undefined)
                store.nextHotTranTime = target.nextHotTranTime;
            if (target.futureDuplicates !== undefined)
                store.futureDuplicates = target.futureDuplicates;

            if (target.active_id !== undefined)
                store.active_id = target.active_id;

            request.itemsStoredPerStore[store.id] = [];
            var itemsStored = request.itemsStoredPerStore[store.id];
            $.each(target.items, function(index) {
                var itemStored = store.storeItem(this);
                if (itemStored) {
                    request.itemsStored.push(itemStored);
                    itemsStored.push(itemStored);
                    target.items[index] = itemStored;
                }
            });

            $.each(target.items, function() {
                var item = this;
                var parentItem;
                if (store.linkToParentProperty) {
                    parentItem = item[store.linkToParentProperty];
                }
                store.jitemsStore([item], parentItem, false, request);
            });

            if (store.maxRowsReturned != undefined) {
                store.rowsReturned[cleanCriteria] += target.items.length;
                store.needMoreRows[cleanCriteria] = (target.items.length >= store.maxRowsReturned);
            }

            if (request.callbackIfDone()) {
                me.deleteRequest(request);
            } else {
                request.executeExtendedFetch(function() {
                    me.deleteRequest(request);
                });
            }
        }
    }
});

/* @cycligentDoc {Class}
 * Ajax query store.
 */
cycligent.class({
    name: "cycligent.ajax.Query.Store",
    extends: "cycligent.ajax.Cache.Store",
    definition: {
        init: function() {
            var me = this;

            var args = cycligent.args(arguments, {
                id: {type: String},												// The id of the store.
                cache: {type: cycligent.ajax.Query},									// The cache that contain/manages the store.
                itemConstructor: {type: Object, required: false},				// The constructor for the creation of items put into the store.
                itemConstructorArgs: {type: Object, required: false},			// The arguments definition specification for the constructor for the creation of items put into the store.
                parentStore: {type: cycligent.ajax.Cache.Store, required: false},			// The parent store of this store. When specified whenever the parent store changes this store is invalidated and cleared.
                isRecursive: {type: Boolean, required: false},					// When true, all items are added into the injection array, and items within the array are linked to one another.
                addToParentItem: {type: Boolean, required: false},				// When true, items are injected into the parent object in the parent store.
                parentInjectionProperty: {type: String, required: false, defaultValue: ''},			// The property name of parent object into which this object should be injected.
                linkToParentProperty: {type: String, required: false},			// The field name override for the field in the object being linked to its parent that links to the parent's _id field. The override is used when the field name in the child object is not the default of the parent store name minus the ending 's'.  For instance when the plural store name is categories and the singular is category not categorie as the system would construct by default.
                parentField: {type: String, required: false},					// The name of the field in the child object that you would like linked to the parent object.
                injectionArray: {type: Array, required: false},					// The array that holds objects that are created/stored by this store.
                multipleFetchesAllowed: {type: Boolean, required: false, defaultValue: false},		// Normally whenever a new fetch is requested the store is invalidated and cleared. When true, the cache allows multiple fetches and stores all data fetched, the store is only invalidated and cleared when the parent store changes.
                deDup: {type: Boolean, required: false, defaultValue:false},    // when true, upon receipt from the server, id comparison is made to ensure that duplicate entries are not injected to the array
                lookupSpec: {type: Object, required: false},    				// Contains the lookup spec for data linking (maps attributes to stores with documents that have an _id equal to the value of the attribute. Also, you can provide an array of documents instead of a store if you want.)
                maxRowsReturned: {type: Number, required: false},                // Controls how many rows are returned per fetch, you can use the "getMoreRows" option on fetch to get additional unfetched rows.
                handleNonSuccess: {type: Function, required: false},               // A function that will be called if the server returns "error" or "unauthorized" or any other non-success status after a fetch of the query store. It receives the response from the server.

                notify: {type: Function, required: false, defaultValue: function() {}}, // The function to call after every fetch (automatically triggered or manual.) Note that after data updates, it may be tempting to use this to update the view, but please consider that a full re-render may be much more expensive than minor updates done in the afterTransaction function.
                handleDuplicates: {type: String, required: false, defaultValue: "keepBoth"}, // Specifies how we should handle duplicates when we encounter one in the injection array. Possible values are "discardOld", "discardNew", "keepBoth", or "merge".
                mergeItem: {type: Function, required: false, defaultValue: me.mergeItem.bind(me)}, // Merges new data with old data. By default this copies the values contained in the new JSON received from the server into the object already stored in the cache. You can provide your own function to perform this operation if there are some special considerations. The function must take two arguments (the new data, and the existing data), and return the result of the merge (likely the existing item, but it doesn't have to be.)
                afterTransaction: {type: Function, required: false, defaultValue: function() {}}, // Called after an object has been added or updated in the injectionArray. The function receives the object, and a string flag that will contain either "added" or "updated" depending on what happened. Note this only gets called when changes are made by the cycligentCache or cycligentQuery code, not when your own code updates or adds something.
                interval: {type: Number, required: false, defaultValue: 1000 * 60}, // Time in milliseconds between updates when using hot caching or long-polling. If you are using hot caching, the cache will wait this amount of time before doing the first update, so you may want to manually fetch first. For long-polling, the server institutes a floor of how frequently you can check for updates, which defaults to 50ms.
                hotCachingAutoStart: {type: Boolean, required: false, defaultValue: false}, // Whether or not to automatically start fetching from the store via the hot caching mechanism. If this is false, you'll have to call hotCachingStart.
                hotCachingCriteria: {type: "Any", required: false, defaultValue: {}}, // The criteria (or a function that returns the criteria) to be used to fetch the data when doing hot caching. Type is actually Function|Object, so you can have a function dynamically return the criteria if you want to.
                timeout: {type: Number, required: false, defaultValue: cycligent.config.providerTimeout}, // By default requests will timeout after the time set in cycligent.config.providerTimeout. If you have a query that will take a while for some reason (or if you're using hot caching, which can utilize long polling to minimize the number of requests) you can specify a timeout to use.
                useLongPolling: {type: Boolean, required: false, defaultValue: false} // If no results are returned from a cache fetch, keep fetching server-side until we have some results. Respects the interval config option and the timeout config option.
            });

            $.extend(me,args);

            me.stores = [];						//@cycligentDoc {Property:[cycligent.ajax.Query.Store]} Children's stores.
            me.pendingRequestIndexes = {};		//@cycligentDoc {Property:[Number]} Pending request indexes.
            me.fetchedCriteria = {};			//@cycligentDoc {Property:Object} The criteria of items fetched that have been requested from the server or are currently in the store.
            me.pendingRequestsByCriteria = {};         //@cycligentDoc {Property:Object} The requests made on this store, accessible by criteria.
            me.rowsReturned = {};               //@cycligentDoc {Property:Object} The rows returned for a particular fetch, if we're limited by maxRowsReturned.
            me.needMoreRows = {};               //@cycligentDoc {Property:Object} Whether or not there are any rows left to get for a particular criteria, for use with maxRowsReturned.
            me.futureDuplicates = [];           //@cycligentDoc {Property:[Array]} The hotcaching mechanism will sometimes send duplicates, and we send it this field to help reduce the chances of that.

            if( args.parentStore ){
                args.parentStore.stores.push( me );
            }

            if( me.isRecursive ){
                me.parentStore = me;
                me.addToParentItem = true;
            }

            if (me.deDup) {
                me.handleDuplicates = "discardNew";
            }

            me.intervalID = null;

            if (me.hotCachingAutoStart) {
                me.hotCachingStart();
            }
        },

        /* @cycligentDoc {Method}
         * Resets the store.
         *
         * @Remarks
         * Resetting the store causes each of the store's children
         * stores to be reset.  Any of its pending requests
         * to be invalidated. And all data and fetched criteria
         * information to be deleted from the store.
         */
        reset: function(){
            var args = cycligent.args(arguments, {} );

            var me = this;

            /* @cycligentDoc {Function}
             * Enumerator.
             */
            $.each(me.stores, function() {
                this.reset();
            });

            // Clear fetchedCriteria
            me.fetchedCriteria = {};
            me.pendingRequestsByCriteria = {};
            me.rowsReturned = {};
            me.needMoreRows = {};

            // Invalidate any pending requests
            /* @cycligentDoc {Function}
             * Enumerator.
             */
            $.each(me.pendingRequestIndexes, function() {
                delete me.cache.pendingRequests[this];
            });
            me.pendingRequestIndexes = {};

            // Delete any injected data
            if( me.injectionArray ){
                me.injectionArray.length = 0;
            }
        },

        /* @cycligentDoc {Method}
         * Fetches data from the cache or if not present in the
         * cache from the server via the cache.
         */
        fetch: function(){
            var me = this;
            var args = cycligent.args(arguments, {
                query: {type: Object},                      // A query for the fields we're looking at, e.g. {firstName: /^Tyler/, lastName: "Church"}. We also support querying against booleans, instances of Date, null values, and numbers. You can query for MongoDB ObjectID's by using the following syntax: query: {_id: {type: "ObjectID", value: "000000000000000000000000"}}, but strings that look like ObjectIds will automatically be converted into them (24 characters long, containing only 0-9 and a-f). MongoDB supports more regex flags than JavaScript natively supports, you can utilize these with a similar syntax to ObjectIDs: query: {field: {type: "RegExp", value: "^RegExp.+", options: "xi"}}. You can also use many of the mongodb query operators such as $in, i.e. {_id: {$in: [id1, id2]}}.
                callback: {type: Function, required: false, defaultValue: function() {}}, // The response function to be called when the data is available.  If the data is already in the cache this function is called immediately.
                context: {type: "Any", required: false},		// The reference data to pass to the function open the data being ready.
                getMoreRows: {type: Boolean, required: false},  // if you set maxRowsReturned when you created the store, setting this to true will grab additional rows from the database (assuming there are any) in increments of maxRowsReturned.
                extendedFetch: {type: Boolean,required: false, defaultValue:false}, // If true, any referenced documents that we don't have will also be pulled down, assuming the correct relationship to other stores has been established via lookupSpec, isRecursive, and parentStore.
                timeout: {type: Number, required: false, defaultValue: me.timeout}, // By default requests will timeout after the time set in cycligent.config.providerTimeout. If you have a query that will take a while for some reason (or if you're using hot caching, which can utilize long polling to minimize the number of requests) you can specify a timeout to use.
                useLongPolling: {type: Boolean, required: false, defaultValue: me.useLongPolling}, // Allows you to override the option set on the cache for a specific fetch. If no results are returned from a cache fetch, keep fetching server-side until we have some results. Uses the same interval as the hot caching interval.
                forHotCaching: {type: Boolean, required: false, defaultValue: false} // INTERNAL USE ONLY, changes a few things for fetches created by the hot caching mechanism.
            });
            var requestId;

            function recurseFillingExtendedJSON(data) {
                for (var field in data) {
                    if (data.hasOwnProperty(field)) {
                        if (field == "$where") {
                            return "An cycligentQuery was received that contained a $where clause.";
                        }
                        var value = data[field];
                        try {
                            var type = Object.prototype.toString.call(value).slice(8,-1); // because typeof isn't foolproof (try typeof new String(""), it returns "object")
                            if (type == "RegExp") {
                                data[field] = {};
                                data[field].$regex = value.source;
                                data[field].$options = "";
                                if (value.global) {
                                    data[field].$options += "g";
                                }
                                if (value.ignoreCase) {
                                    data[field].$options += "i";
                                }
                                if (value.multiline) {
                                    data[field].$options += "m";
                                }
                            } else if ("Date" == type) {
                                data[field] = {$date: value};
                            } else if ("String" == type && likelyObjectId(value)) {
                                data[field] = {$oid: value};
                            } else {
                                if (typeof value == "object" && value != null && !likelyExtendedJSON(value)) {
                                    var err = recurseFillingExtendedJSON(value);
                                    if (err)
                                        return err;
                                }
                            }
                        } catch (ex) {
                            return "An error was thrown while trying to parse extended JSON for an cycligentQuery call.";
                        }
                    }
                }

                return null;

                /**
                 * Returns true if the passed string looks like an ObjectId (is 24 characters long, and contains only
                 * hex characters.)
                 * @param {String} string
                 * @returns {Boolean}
                 */
                function likelyObjectId(string) {
                    return string.length == 24 && /^[a-f0-9]+$/.test(string);
                }

                /**
                 * Returns true if the provided object looks like extended JSON.
                 * http://docs.mongodb.org/manual/reference/mongodb-extended-json/
                 * @param {Object} obj
                 * @returns {Boolean}
                 */
                function likelyExtendedJSON(obj) {
                    var keys = Object.keys(obj);
                    var numberOfKeys = keys.length;

                    return ((numberOfKeys == 2 && (
                               (contains(keys, "$binary") && contains(keys, "$type"))
                            || (contains(keys, "$regex") && contains(keys, "$options"))
                            || (contains(keys, "$ref") && contains(keys, "$id"))
                        )) || (numberOfKeys == 1 && (
                               contains(keys, "$date")
                            || contains(keys, "$timestamp")
                            || contains(keys, "$oid")
                            || contains(keys, "$undefined")
                            || contains(keys, "$minKey")
                            || contains(keys, "$maxKey")
                        ))
                        );
                }

                /**
                 * Returns true if the passed array contains the given element. Uses indexOf.
                 * @param {Array} array
                 * @param {*} what
                 * @returns {Boolean}
                 */
                function contains(array, what) {
                    return array.indexOf(what) != -1;
                }
            }

            var err = recurseFillingExtendedJSON(args.query);
            if (err) {
                console.error("An error occurred while trying to parse extended JSON for an cycligentQuery call. "
                    + "Error message: '" + err + "'.");
            }

            var queryCriteriaString = JSON.stringify(args.query);
            var inCache = false;

            if( me.fetchedCriteria[queryCriteriaString] && !(args.getMoreRows && me.needMoreRows[queryCriteriaString])){
                if( me.fetchedCriteria[queryCriteriaString] == cycligent.ajax.fetchStatusTypes.fetched ){
                    inCache = true;
                    if (args.context)
                        args.callback.call(args.context, me.active_id, []);
                    else
                        args.callback(me.active_id, []);
                } else { // The request must be pending.
                    me.pendingRequestsByCriteria[queryCriteriaString].callbacks.push(args.callback.bind(args.context));
                }
            } else {
                if( !me.multipleFetchesAllowed && !args.extendedFetch && !args.getMoreRows){
                    me.reset();
                }
                me.fetchedCriteria[queryCriteriaString] = cycligent.ajax.fetchStatusTypes.pending;
                me.rowsReturned[queryCriteriaString] = me.rowsReturned[queryCriteriaString] || 0;

                var nonBlocking = false;
                var request = {
                    id: me.id,
                    criteria: args.query
                };
                if (args.forHotCaching) {
                    request.hotCaching = true;
                    request.duplicates = me.futureDuplicates;
                    request.interval = me.interval;
                    nonBlocking = true;
                }
                if (args.useLongPolling) {
                    request.useLongPolling = true;
                    request.timeout = args.timeout;
                    request.interval = me.interval;
                }
                if (me.maxRowsReturned)
                    request.limit = me.maxRowsReturned;
                if (args.getMoreRows)
                    request.skip = me.rowsReturned[queryCriteriaString];

                requestId = me.cache.request( request, {timeout: args.timeout}, nonBlocking );
                var requestObject = new cycligent.ajax.Cache.Request(
                    requestId,
                    me,
                    queryCriteriaString,
                    [args.callback.bind(args.context)],
                    args.extendedFetch
                );

                me.cache.pendingRequests[requestId] = requestObject;
                me.pendingRequestsByCriteria[queryCriteriaString] = requestObject;
                me.pendingRequestIndexes[requestId] = requestId;
            }

            return inCache;
        },

        /**
         * Given some criteria, and the date we're going to use for the criteria,
         * insert the date in a way that makes sense for the type of store that's
         * implementing this method.
         *
         * Returns the new criteria.
         *
         * I believe this will only ever be used internally to cycligentCache/cycligentQuery.
         *
         * @param {Object} criteria The criteria we're sending to the server.
         * @param {Number|Undefined} date The number representing the Date we're dealing with.
         * @return {Object} Return the criteria object that was passed to it.
         */
        hotCachingUpdateCriteria: function(criteria, date) {
            var me = this;
            if (date == undefined) {
                date = {$hotTranTime: 1};
            } else {
                date = {$date: me.nextHotTranTime};
            }
            criteria["hotTranTime"] = {$gt: date};
            return criteria;
        },

        /* @cycligentDoc {Method}
         * INTERNAL USE ONLY
         *
         * A helper function for doing a fetch for hotCaching.
         * If you want to manually trigger a hotCache fetch before
         * the interval causes one, use hotCachingPoll instead.
         */
        hotCachingFetchHelper: function() {
            var me = this;
            var args = cycligent.args(arguments, {
                criteria: {type: Object, required: true}
            });
            me.fetch({
                query: args.criteria,
                forHotCaching: true
            });
        },

        /* @cycligentDoc {Method}
         *
         * The function called when an cycligentQuery store returns a status other than "success".
         *
         * By default, it will simply report this as an error. If this is an expected case
         * in your application, you can override this by passing a function for the
         * "handleNonSuccess" argument when you're registering your cycligentQuery store, and
         * act accordingly.
         */
        handleNonSuccess: function() {
            var args = cycligent.args(arguments, {
                target: {type: Object, required: true}
            });
            var target = args.target;
            var message = "cycligentQuery store " + target.id + " returned non-success status '" + target.status + "'";
            if (target.status == "error" && target.error) {
                message += ", error message was: " + target.error;
            } else {
                message += ".";
            }

            console.error(message);
        }
    }
});

/* @cycligentDoc {Class}
 * Improvement Interactive Download
 *
 * @Remarks
 * Provides for simplified downloading of files generated dynamically
 * on the server.
 */
cycligent.class({
    name: "cycligent.ajax.Download",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {});
            var me = this;
            $.extend(me,args);
        },

        /* @cycligentDoc {Method}
         * Create a form that when submitted will send a request to download a file
         * dynamically generated on the server side.
         *
         * @Remarks
         * We have to create a form because generally JavaScript can't initiate downloads
         * it has to be clearly user-initiated. To ensure that it is, we create a form
         * that the user can submit. Be sure to call fillForm before this gets submitted.
         * (you can handle the onsubmit event.)
         */
        makeForm: function() {
            var args = cycligent.args(arguments, {
                submitText: {type: String, required: false, defaultValue: 'Download'}, // Text on the submit button used for this download.
                formClass: {type: String, required: false} // CSS class of the form, so you can style it however you want.
            });
            var me = this;
            var $form = $('<form></form>');
            $form.attr('action', cycligent.config.providerUrl);
            $form.attr('method', 'POST');
            $form.append(me.makeInput("name", ""));
            $form.append(me.makeInput("data", {}));
            $form.append(me.makeInput("target", "cycligentDownload"));
            $form.append(me.makeInput("authorization", ""));
            $form.append(me.makeInput("location", cycligent.ajax.util.dottedLocation()));
            var $submit = $("<input/>");
            $submit.attr('type', 'submit');
            $submit.attr('value', args.submitText);
            $form.append($submit);
            if (args.formClass) {
                $form.addClass(args.formClass);
            }
            return $form;
        },

        /* @cycligentDoc {Method}
         * Fills the cycligentDownload form with the necessary information for the download.
         *
         * @Remarks
         * Targets the given form at the cycligentDownload function on the server that has the
         * given name, and fills. Data can be anything that JSON.stringify will work on.
         * Usually you'll want to call this in the onsubmit event of the form created
         * with makeForm.
         */
        fillForm: function() {
            var args = cycligent.args(arguments, {
                form: {type: HTMLFormElement},  // Form to be submitted for the download.
                name: {type: String}, // Object containing the op codes (context and op) for the transaction.
                data: {type: "Any"},   // Object containing the data of the transaction.
                authorization: {type: String, required: false} // String containing the session authorization to send. Will be provided automatically.
            });

            var $form = $(args.form);
            $($form.find("input[name='name']")).val(JSON.stringify(args.name));
            $($form.find("input[name='data']")).val(JSON.stringify(args.data));
            if (args.authorization !== undefined) {
                $($form.find("input[name='authorization']")).val(JSON.stringify(args.authorization));
            } else if (cycligent.Session && cycligent.Session.singleton) {
                $($form.find("input[name='authorization']")).val(JSON.stringify(cycligent.Session.singleton.propertyGet("authorization")));
            }
        },

        /* @cycligentDoc {Method}
         * A helper function that creates a hidden input for the download form.
         *
         * @Remarks
         * Data must be something that can be converted with JSON.stringify.
         */
        makeInput: function() {
            var args = cycligent.args(arguments, {
                name: {type: String}, // The name of the input to create.
                data: {type: "Any"}   // The JSON data for the form.
            });
            var $input = $("<input/>");
            $input.attr('name', args.name);
            $input.attr('type', 'hidden');
            $input.val(JSON.stringify(args.data));
            return $input;
        }
    }
});

/* @cycligentDoc {Class}
 * Improvement Interactive Call Monitor
 *
 * @Remarks
 * The call monitor provides a generalized vehicle for processing
 * calls on the server from the client.
 */
//noinspection JSUnusedGlobalSymbols
cycligent.class({
    name: "cycligent.ajax.CallMonitor",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway},			// The gateway for processing of transactions by the server.
                nonPendingErrorFunction: {type: Function}	// Function to call when an error was returned from a transaction that is no longer pending. This can occur when the user navigates away from the current page.
            });

            var me = this;

            $.extend(me,args);

            me.callCount = 0;	//@cycligentDoc {Property:Number} The number of transactions processed by the transaction monitor since its instantiation.
            me.pendingCalls = [];						//@cycligentDoc {Property:[cycligent.ajax.TransactionMonitor.Transaction]} Requests awaiting a response from the gateway (server).
            me.gatewayTarget = me.gateway.register( "cycligentCall", me.response, me );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the transaction monitor.

        },

        /* @cycligentDoc {Method}
         * Resets the call monitor.
         *
         * @Remarks
         * All pending calls are cleared and their RESPONSES will not
         * be processed. The actual calls will complete, if valid, and
         * no errors are experienced on the server.
         */
        //TODO: 3. Think reset should only be callable on the gateway!!!
        reset: function(){
            cycligent.args(arguments, {});

            this.pendingCalls = [];
        },

        /* @cycligentDoc {Method}
         * Process a call on the server the server.
         *
         * @Remarks
         * Sends a call to the server for processing and monitors the
         * success or failure of the call and reports back via a
         * callback function the result of the call.
         */
        call: function(){
            var args = cycligent.args(arguments, {
                name: {type: String},				                // Object containing the op codes (context and op) for the transaction.
                data: {type: "Any"},					        // Object containing the data of the transaction
                callback: {type: Function},				// The function to call when the server has responded to the transaction.
                context: {type: "Any", required: false},	// The reference data to pass to the callback when called.
                passThroughData: {type: "Any", required: false},
                jQueryOptions: {type: Object, required: false} // Options to pass to $.ajax
            });

            var me = this;

            me.callCount++;

            me.pendingCalls[me.callCount] = {
                id: me.callCount,
                name: args.name,
                callback: args.callback,
                context: args.context,
                passThroughData: args.passThroughData
            };

            return me.gateway.request( me.gatewayTarget, {
                call: {
                    id: me.callCount,
                    name: args.name,
                    data: args.data
                }
            }, args.jQueryOptions );
        },

        /* @cycligentDoc {Method}
         * Process a call response from the server.
         */
        response: function(){
            var args = cycligent.args(arguments, {
                callResponse: {type: Object}	// The object associated with the response.
            });

            var me = this;

            var call = me.pendingCalls[args.callResponse.id];

            // Make sure the transaction is still valid
            if( call ){
                if(call.context){
                    call.callback.call( call.context, call, args.callResponse );
                }else{
                    call.callback( call, args.callResponse );
                }
                delete me.pendingCalls[args.callResponse.id];
            }else{
                if( args.callResponse.status != "success" ){
                    me.nonPendingErrorFunction( args.callResponse.status, args.callResponse.error );
                }
            }

        }

    }
});


/* @cycligentDoc {Class}
 * Improvement Interactive Trace Handler.
 *
 * @Remarks
 * Handles trace messages sent by the server regarding system information the
 * server is sending to the client.  This information is typically displayed
 * by the client in a status bar trace window.
 */
cycligent.class({
    name: "cycligent.ajax.TraceHandler",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway},			// The gateway for processing of transactions by the server.
                notificationFunction: {type: Function, required: false}		// Function to call when an error was returned from the server.
            });

            var me = this;

            $.extend(me,args);

            me.gatewayTarget = me.gateway.register( "cycligentTrace", me.response, me );   //@cycligentDoc {Property:cycligent.ajax.Target} The gateway messaging target associated with the exception handler.

        },

        /* @cycligentDoc {Method}
         * Handles the reciept of a trace message.
         */
        response: function(){
            var args = cycligent.args(arguments, {
                data: {type: Object}	// The JSON data associated with the response.
            });

            var me = this;

            var traces = args.data.json;

            $(traces).each(
                function(){

                    if(this[0] < 4){
                        console.log(this[1]);
                    } else if (this[0] < 16){
                        console.info(this[1]);
                    } else if (this[0] < 32){
                        console.warn(this[1]);
                    } else {
                        console.error(this[1]);
                    }

                    if( me.notificationFunction ){
                        me.notificationFunction( this[0], this[1] );
                    }
                }
            )
        }
    }
});

//TODO: 2. Document
/* @cycligentDoc {Class}
 * Facilitates authorization.
 */
//noinspection JSUnusedGlobalSymbols
cycligent.class({
    name: "cycligent.ajax.Authorizer",
    definition: {

        init: function(){
            var args = cycligent.args(arguments, {
                gateway: {type: cycligent.ajax.Gateway, required: false, defaultValue: cycligent.ajax.gateway}	// The gateway for processing of transactions by the server.
            });

            var me = this;

            $.extend(me,args);

            me.authorizations = {};		//@cycligentDoc {Property:[String]} The authorizations paths returned from the server.
        },

        /* @cycligentDoc {Method}
         * Returns a boolean indicating if a particular function, pased in the
         * form of a cycligentESM path is authorized for this user.
         */
        isAuthorized: function(){
            var args = cycligent.args(arguments, {
                context: {type: String},
                path: {type: String}	// The path to check to see if an application module "function" is authorized
            });

            var me = this;
            var authorized = false;
            var prop;
            var index;
            var path;

            if(me.authorizations[args.context]){

                for( index = 0; index < me.authorizations[args.context].length; index++ ){
                    path = me.authorizations[args.context][index];
                    if( args.path.substr(0,path.length) == path ){
                        authorized = true;
                        break;
                    }
                }
            }

            return authorized;
        },

        /* @cycligentDoc {Method}
         * Fetches an authorization set, based on the cycligentESM path
         * from the server for use in later authorizations via
         * cycligentLink(cycligent.ajax.Authorizer.isAuthorized).
         *
         * If the Session was provided with the authorizationsCache
         * this will just use that instead of talking to the server.
         */
        authorize: function(){
            var args = cycligent.args(arguments, {
                contextPaths: {type: Object},							// The path for which authorizations are to be returned.  Multiple paths for authorization may be passed in as an array.
                callback: {type: Function},				        // The function to call when the server has responded to the transaction.
                context: {type: "Any", required: false}	    // The reference data to pass to the callback when called.
            });

            var me = this;

            var authorizationsCache = undefined;

            if(cycligent.Session && cycligent.Session.singleton) {
                authorizationsCache = cycligent.Session.singleton.propertyGet("role").authorizationsCache;
            }

            if (authorizationsCache) {
                var callReturn = {status: "success", data: authorizationsCache};
                me.authorizations = authorizationsCache;
                if (args.context) {
                    args.callback.call(args.context, callReturn);
                } else {
                    args.callback(callReturn);
                }
                return;
            }

            cycligent.ajax.call({
                name: '/cycligent.authorize.paths',
                data: args.contextPaths,
                callback: function(call, callReturn){

                    for(var context in callReturn.data){
                        if (callReturn.data.hasOwnProperty(context)) {
                            if(!me.authorizations[context]){
                                me.authorizations[context] = [];
                            }

                            for(var index = 0; index < callReturn.data[context].length; index++){
                                //TODO: 7. Should probably check to see if the item is already in the array so we don't
                                // create a small memory leak like condition if the authorize function is called multiple
                                // times with the same requests. (Could also just check to see if previous requests where
                                // made, but this is probably more trouble than it is worth).
                                me.authorizations[context].push(callReturn.data[context][index]);
                            }
                        }
                    }

                    if (args.context) {
                        args.callback.call(args.context,callReturn);
                    } else {
                        args.callback(callReturn);
                    }
                }
            });
        }
    }
});
