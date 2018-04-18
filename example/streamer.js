window.StreamerSWF = window.StreamerSWF || {};
StreamerSWF.elemId = "streamer_swf";
StreamerSWF.obj = undefined;
StreamerSWF.log = function(s){
	console.log("[StreamerSWF] " + s);
}

StreamerSWF.warn = function(s){
	console.warn("[StreamerSWF] " + s);
}
	
StreamerSWF.error = function(s){
	console.error("[StreamerSWF] " + s);
}

/* override functions */
StreamerSWF.startedPublish = function(){ /* you can override */ }
StreamerSWF.stoppedPublish = function(){ /* you can override */ }
StreamerSWF.showSecuritySettings = function(){ /* you can override */ }
StreamerSWF.hideSecuritySettings = function(){ /* you can override */ }

StreamerSWF.activityLevel = function(lvl){
	console.log("audio lvl " + lvl);
}

StreamerSWF.flash = function(){
	if(!StreamerSWF.obj){
		StreamerSWF.obj = document.getElementById(StreamerSWF.elemId);
		if(!StreamerSWF.obj){
			StreamerSWF.error("Element '" + StreamerSWF.elemId + "' not found");
		}
		StreamerSWF.log("Init");
	}else if(!StreamerSWF.obj.vjs_activate){
		// try again
		StreamerSWF.obj = document.getElementById(StreamerSWF.elemId);
		if(!StreamerSWF.obj){
			StreamerSWF.error("Element '" + StreamerSWF.elemId + "' not found");
		}
		StreamerSWF.log("reinit");
	}
	return StreamerSWF.obj;
};
	
StreamerSWF.activate = function(rtmpUrl, codec){

	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_activate){
		var is_private = StreamerSWF.private.is() || false;
		f.vjs_activate(rtmpUrl, is_private, codec);
	}else{
		StreamerSWF.error("Function vjs_activate not found");
		StreamerSWF.obj = undefined;
	}
};

StreamerSWF.support = function(){
	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_support)
		return f.vjs_support();
	else{
		StreamerSWF.error("Function vjs_support not found");
		StreamerSWF.obj = undefined;
	}
};

StreamerSWF.status = function(){
	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_status)
		return f.vjs_status();
	else{
		StreamerSWF.error("Function vjs_status not found");
		StreamerSWF.obj = undefined;
	}
};
	
StreamerSWF.deactivate = function(){
	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_deactivate)
		f.vjs_deactivate();
	else{
		console.error("Function vjs_deactivate not found");
		StreamerSWF.obj = undefined;
	}
};

StreamerSWF.isActivated = function(){
	return (StreamerSWF.status() == "activated");
};

StreamerSWF.isDeactivated = function(){
	return (StreamerSWF.status() == "deactivated");
};

StreamerSWF.isTransitive = function(){
	return (StreamerSWF.status() == "transitive");
};

/* private mode opened */
StreamerSWF.private = {};
StreamerSWF.private.retry = function(isDone, next) {
    var current_trial = 0, max_retry = 50, interval = 10, is_timeout = false;
    var id = window.setInterval(
        function() {
            if (isDone()) {
                window.clearInterval(id);
                next(is_timeout);
            }
            if (current_trial++ > max_retry) {
                window.clearInterval(id);
                is_timeout = true;
                next(is_timeout);
            }
        },
        10
    );
}

StreamerSWF.private.isIE10OrLater = function(user_agent) {
    var ua = user_agent.toLowerCase();
    if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
        return false;
    }
    var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
    if (match && parseInt(match[1], 10) >= 10) {
        return true;
    }
    var edge = /edge/.exec(ua);
	if(edge && edge[0] == "edge"){
		return true;
	}
    return false;
}

StreamerSWF.private.detectPrivateMode = function(callback) {
    var is_private;

    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem(
            window.TEMPORARY, 1,
            function() {
                is_private = false;
            },
            function(e) {
                console.log(e);
                is_private = true;
            }
        );
    } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
        var db;
        try {
            db = window.indexedDB.open('test');
        } catch(e) {
            is_private = true;
        }

        if (typeof is_private === 'undefined') {
            StreamerSWF.private.retry(
                function isDone() {
                    return db.readyState === 'done' ? true : false;
                },
                function next(is_timeout) {
                    if (!is_timeout) {
                        is_private = db.result ? false : true;
                    }
                }
            );
        }
    } else if (StreamerSWF.private.isIE10OrLater(window.navigator.userAgent)) {
        is_private = false;
        try {
            if (!window.indexedDB) {
                is_private = true;
            }                 
        } catch (e) {
            is_private = true;
        }
    } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
        try {
            window.localStorage.setItem('test', 1);
        } catch(e) {
            is_private = true;
        }

        if (typeof is_private === 'undefined') {
            is_private = false;
            window.localStorage.removeItem('test');
        }
    }

    StreamerSWF.private.retry(
        function isDone() {
			return typeof is_private !== 'undefined' ? true : false;
        },
        function next(is_timeout) {
            callback(is_private);
        }
    );
}

StreamerSWF.private.is = function(){
	if(typeof StreamerSWF.private.is_ === 'undefined'){
		console.error('[StreamerSWF.private] cannot detect');
	}
	return StreamerSWF.private.is_;
}

StreamerSWF.private.detectPrivateMode(
	function(is_private) {
		StreamerSWF.private.is_ = is_private;
		
		if(typeof is_private === 'undefined'){
			console.error('[StreamerSWF.private] cannot detect');
		}else{
			StreamerSWF.private.is_ = is_private;
			console.log(is_private ? '[StreamerSWF.private] private' : '[StreamerSWF.private] not private')
		}
	}
);
