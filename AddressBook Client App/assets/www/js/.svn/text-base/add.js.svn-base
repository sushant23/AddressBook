//insert form data
function addFormData(){
	var personalEmailBool = isEmail($("#personalEmail").val()) || $("#personalEmail").val() == '';
	var officialEmailBool = isEmail($("#officialEmail").val()) || $("#officialEmail").val() == '';
	if($("#firstName").val()!=''){
		if(($("#mobilePhoneA").val() != '' || $("#mobilePhoneB").val() != '' || $("#homePhoneA").val() != '' || $("#homePhoneB").val() != '' || $("#emergencyPhoneA").val() != ''|| $("#emergencyPhoneB").val() != '')){
			if( personalEmailBool && officialEmailBool){
				createTable();
				var convertedData='{';
				formData = $("#addForm").serializeArray();
				formData.push({"name" : "image", "value": ''+image+''});
				$.each( formData, function( i, field ) {
					convertedData += '"'+field.name +'" : "'+ field.value + '" , ';
				});
				convertedData = convertedData.substring(0, convertedData.length - 2);
				convertedData += '}';
				convertedData = JSON.parse(convertedData);
				
				insertInSqLite(convertedData);
				document.getElementById("addForm").reset();
				
				$.mobile.changePage($("#index"), { transition : "pop"});
				populateContactList();
			}else {
				alert("Please insert valid Email Address");
			}
		}else{
			alert("Please insert atleast one Contact Number ");
		}

	}else{
		alert("Please insert First Name");
	}
}