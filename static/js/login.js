	$(document).ready(function() {
        var remember = $.cookie('remember');
        if (remember == 'true') 
        {
            var name = $.cookie('user');
            var password = $.cookie('psw');
            // autofill the fields
            $('#user').val(name);
            $('#psw').val(password);
        }
	});

    $(document).ready(function() {
        $('#rememberBtn').change(function() {
            if($(this).is(":checked")) {
                var returnVal = confirm("Are you sure?");
                $(this).attr("checked", returnVal);
            }    
        });
    });
	
	function storeCookies() {
        console.log("sign in click");
  		var name = document.getElementById("user").value;
    	var psw = document.getElementById("psw").value;
      
    	//Save cookies if checked remember me
    	if ($('#rememberBtn').is(':checked')) {
            var username = $('#user').val();
            var password = $('#psw').val();

            // set cookies to expire in 14 days
            $.cookie('user', username, { expires: 14 });
            $.cookie('psw', password, { expires: 14 });
            $.cookie('remember', true, { expires: 14 });                
        }
        else
        {
            // reset cookies
            $.cookie('user', null);
            $.cookie('pwd', null);
            $.cookie('remember', null);
        }
	}
	
	//Demo login, automatically login as Demo user
	function demoLogin(){
		document.getElementById("user").value = "Demo";
		document.getElementById("psw").value = "Demo";
		storeCookies();
	}