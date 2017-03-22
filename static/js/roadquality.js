var isMenuDis = true;
var layers = [];
var currentVisiblePage = '';
var currentPage = 'menupage';
var currentUser='';

init();

//Add extential button control on openlayer maps
$(document).ready(function(){
   $(function () {
       $('#dateTimeStart').datetimepicker();
       $('#dateTimeEnd').datetimepicker();
       $('#qualSlider').bootstrapSlider();
   });

  //Click Road quality to config map settings //OSM
  $('#roadquality').on('click',function() {
      currentPage = 'quality';
      document.getElementById('menupage').style.visibility = "hidden";
      document.getElementById('quality').style.visibility = "visible";
      //document.getElementById(currentPage).style.display = "block";
      //createAreaList();
  });

    //Click return button to return to services page
  $('#backtoMenu').on('click', function() {
      console.log(currentPage);
      document.getElementById(currentPage).style.visibility = "hidden";
      document.getElementById('menupage').style.visibility = "visible";
      currentPage='menupage';
  });

  //Click return button to return to services page
  //TODO:Different id for actually same item, will Change later
  $('#backMenu').on('click', function() {
      console.log(currentPage);
      document.getElementById(currentPage).style.visibility = "hidden";
      document.getElementById('menupage').style.visibility = "visible";
      currentPage='menupage';
  });


   //HOTS menubar, if current page is empty, then open menuoage
   //if current page is not menupage, then close the pages
   //if current page is menupage, then the collapse in/out would work
   $('#mainMenuBar').on('click', function() {
      console.log(currentPage);
   		if(currentPage == ''){
   			currentPage='menupage';
   		}else if(currentPage != 'menupage'){
   			document.getElementById(currentPage).style.visibility = "hidden";
   	   	currentPage='';
   		}
   		document.getElementById('menupCate').style.visibility = "visible";
   		document.getElementById('menupage').style.visibility = "visible";
   		document.getElementById('mainMenuBar').style.visibility = "hidden";
   });

   $('#account').on('click', function() {
      currentPage = 'accountDetail';
      document.getElementById('menupage').style.visibility = "hidden";
      document.getElementById('accountDetail').style.visibility = "visible";
      console.log(currentPage);
      $.ajax({
        type: 'POST',
        url: "/account/",
        dataType: "json"
      }).done(function (data) {
        // Do whatever with returned data
          //console.log("get user info",data)
          console.log("first data",data);
          document.getElementById("organ").value = data.Organization;
          document.getElementById("contact").value = data.Contact;
          document.getElementById("email").value = data.Email;

          var areas = data.CoverageAreas;
          var arealist=" ";
          for (var i in areas) {
              arealist = arealist.concat(areas[i].Name,";")
          }
          document.getElementById("covera").value = arealist
          
          var rsq = data.RSQMaps;
          var rsqlist=" ";
          for (var i in rsq) {
              rsqlist = rsqlist.concat(rsq[i].Name,";")
          }
          document.getElementById("rsq").value = rsqlist;

      });
   });

  function visibleConfig()
  {
      for(var i=0, ii=pageList.length-1;i<=ii;i++)
      {
         if(pageList[i] == currentPage)
         {
            document.getElementById(currentPage).style.visibility = "visible";
         }else {
            document.getElementById(pageList[i]).style.visibility = "hidden";
         }
      }
  }
  
  //request current job list from server
   hots.joblist.list(function(response, status) {
   		var object = response.result;
   		if(object != null) {
   			// Need the structure of the object definition
   			$.each(object, function(i,item){
   				$('<tr>').html(
   					"<td>" + object.id + "</td><td>"
   						   + object.type + "</td><td>"
   				      	   + object.priority + "</td><td>" 
   				           + object.start + "</td><td>"
   				           + object.status + "</td><td>"
   				           + object.contact + "</td><td>"
   				           + object.Estimate + "</td><td>"
   				           + "<a class='btn btn-default actionButton' data-toggle='dropdown' href='#'> Cancel </a>"
   				           + "<a class='btn btn-primary actionButton' data-toggle='dropdown' href='#'> Speed Up </a>"
   				           + "</td>").appendTo('#currentJobTbl');
   			}) 
   		}else {
   			//Test result create table code, would remove if response contains the objects
   			var object = {id:"1",type:"Fiat", priority:"500",start:"01-11-2016",status:"white", contact:"name", Estimate:"12-11-2016"};
   			$('<tr>').html(
   					"<td>" + object.id + "</td><td>"
   						   + object.type + "</td><td>"
   				      	   + object.priority + "</td><td>" 
   				           + object.start + "</td><td>"
   				           + object.status + "</td><td>"
   				           + object.contact + "</td><td>"
   				           + object.Estimate + "</td><td>"
   				           + "<a class='btn btn-default actionButton' data-toggle='dropdown' href='#' > Cancel </a>"
   				           + "<a class='btn btn-primary actionButton' data-toggle='dropdown' href='#'> Speed Up </a>"
   				           + "</td>").appendTo('#currentJobTbl');
   		     //+ "<td colspan='6' class='hiddenRow'> <div class='accordian-body collapse' id='demo1'> Could be the comment list here.</div></td>"
   		}
   		console.log(response);
   		console.log(status);
   })
   
    $(document).on('change', ':file', function() {
    	var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        var size = input.get(0).files[0].size;
        if(size > 52428800) {
        	bootbox.alert("Maximun file size is 50M.")
        }else {
        	input.trigger('fileselect', [numFiles, label]);
        }
  	});

    //We can watch for our custom `fileselect` event like this
  	$(document).ready( function() {
      	$(':file').on('fileselect', function(event, numFiles, label) {

        var input = $(this).parents('.form-group').find(':text'),
        log = numFiles > 1 ? numFiles + ' files selected' : label;

        if( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }
      });
  });
});

   //request to upload file to server
   //Might be use user information for uploading
   function uploadFile() {
   		//request to upload job to server
   		//parameters:serviceID, name, priority, contact, dataURL
   		var serviceID = "1";
   		var name="job";
   		var priority = "1";
   		var contact = "mengwei";
   		var dataURL = "";
   		if(document.getElementById('checkCurrentUser').checked) {
   			name = "user1";//TODO change to get current logged in user
   		}
   		hots.joblist_push(serviceID, name, priority, contact, dataURL ,function(response, status) {
   			console.log(response);
   		})
   }
   
   function createAreaList() {
   		var names = ["Kobenhavn","Lyngby","DTU"];
   		var s1 = document.getElementById('arealist');
   		for(var i=0; i< names.length; i++) {
   			var pair = names[i];
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = pair;
            checkbox.value = pair;
            if(pair == "DTU") {
            	checkbox.checked = true;
            	checkbox.disabled = true;
            }
            s1.appendChild(checkbox);
    
            var label = document.createElement('label')
            label.htmlFor = pair;
            label.appendChild(document.createTextNode(pair));

            s1.appendChild(label);
            s1.appendChild(document.createElement("br")); 
   		}
   		
   }
   
  function displayMenuBar()
  {
     console.log(currentPage);
  	 document.getElementById('mainMenuBar').style.visibility = "visible";
  	 if(currentPage == 'filterConfig' || currentPage=='includeConfig') {
  	 	 document.getElementById(currentPage).style.display = "none";
  	 	 document.getElementById('configmap').style.visibility = "hidden";
  	 }else{
  	 	 document.getElementById(currentPage).style.visibility = "hidden";
       document.getElementById('menupCate').style.visibility = "hidden";
  	 }
  	 
  }
  
    $(document).ready( function() {
      	 var table = document.getElementById("#currentJobTbl");
   		 if (table != null) {
       	 	for (var i = 0; i < table.rows.length; i++) {
            	for (var j = 0; j < table.rows[i].cells.length; j++){
            		table.rows[i].cells[j].onclick = function () {
                		tableText(this);
            		};
            	}
         	}
    	 }
    });