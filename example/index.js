
StreamerSWF.log = function(s){
	document.getElementById('streaming-log').innerHTML = s + "\n" + document.getElementById('streaming-log').innerHTML;
}

StreamerSWF.error = function(s){
	document.getElementById('streaming-log').innerHTML = s + "\n" + document.getElementById('streaming-log').innerHTML;
}

StreamerSWF.warn = function(s){
	document.getElementById('streaming-log').innerHTML = s + "\n" + document.getElementById('streaming-log').innerHTML;
}

StreamerSWF.startedPublish = function(){
	document.getElementById('streaming-log').innerHTML = "Publishing started\n" + document.getElementById('streaming-log').innerHTML;
}

StreamerSWF.stoppedPublish = function(){
	document.getElementById('streaming-log').innerHTML = "Publishing stopped\n" + document.getElementById('streaming-log').innerHTML;
}

StreamerSWF.activityLevel = function(lvl){
	var el = document.getElementById('audiolevel_value');
	if(lvl < 0) lvl = 0;
	var h = Math.floor((lvl/100)*140);
	el.style['height'] = h + "px";
	el.style['margin-top'] = (140-h)+ "px";
}

function adobe_start(){
	StreamerSWF.activate(document.getElementById('url').value, "PCMU");
}

function adobe_stop(){
	StreamerSWF.deactivate();
}
