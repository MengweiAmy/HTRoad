var webservice = (function(){
	function jsonrpc(targetURL){
		var ticket = 0;

		return function(method, params, handler) {
			var msgId = ++ticket;

			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				this.readyState===4 && handler(JSON.parse(this.responseText), this.status);
			};
			xhr.open("POST", targetURL);
			xhr.setRequestHeader("Content-Type","application/json");

			var webcall = {"jsonrpc": "2.0", "id": msgId, "method": method, "params": params };
			xhr.send(JSON.stringify(webcall));
		};
	};

	return {
		jsonrpc: jsonrpc
	};
}());

var hots = (function(){
	var jsonrpc = webservice.jsonrpc("/ws/")

	function login(user, pwd, callback) {
		var params = {"user": user, "password": pwd};
	    jsonrpc("login", params, callback);
	};

	function joblist_list(callback) {
	    jsonrpc("joblist.list", null, callback);
	};
	function joblist_push(serviceID, name, priority, contact, dataURL, callback) {
		var params = {"name": name, "service": serviceID, "priority": priority, "contact": contact, "dataurl": dataURL };
	    jsonrpc("joblist.push", null, callback);
	};
	function joblist_cancel(jobID, callback) {
	    jsonrpc("joblist.cancel", jobID, callback);
	};

    return {
    	login: login,
    	joblist: {
    		list: joblist_list,
    		push: joblist_push,
    		cancel: joblist_cancel
    	}
    }
}());
