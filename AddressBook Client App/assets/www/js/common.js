var server = 'http://192.168.100.45:8080/webServiceForAB/';
var PASSWORD = 'adminpassword';
var deletableIds = [];
if (typeof(localStorage.timeDiff) == 'undefined') {
	localStorage.timeDiff = '0';
}
if (typeof localStorage.lastSynced === 'undefined' || localStorage.lastSynced == '') {
	localStorage.lastSynced = '0001-01-01 00:00:00';
}
var viewByCatagory = false;
// On Menu Button Press
function menuButtonClickHandler(){
	if ($.mobile.activePage.is('#index')) {
		if( $("#indexPagePanel").hasClass("ui-panel-open") == true )
			$("#indexPagePanel").panel("close");
		else
			$("#indexPagePanel").panel("open");
	} else if ($.mobile.activePage.is('#detailsPage')) {
		if( $("#detailsPagePanel").hasClass("ui-panel-open") == true )
			$("#detailsPagePanel").panel("close");
		else
			$("#detailsPagePanel").panel("open");
	}
}

//On Back Button Press
function onBack() {
	if ($.mobile.activePage.is('#index')) {
			navigator.notification.confirm(
			'Are you sure you want to exit?',
			function(buttonIndex) {
				if(buttonIndex == '1')
					navigator.app.exitApp();
			},
			'Exit', ['Yes', 'No']
		);
		
	} else {
		navigator.app.backHistory();
		image = defaultimg;
	}
}

// On Online Function
function onOnline(){
	$('#syncButton').show();
	$('#importFileButton').show();
}

// On Offline Function
function onOffline(){
	$('#syncButton').hide();
	$('#importFileButton').hide();
}
//Get Current Date Time
function getCurrentDateTime() {
	var now = new Date();
	var currentTimeInMs = now.getTime();
	currentDateTime = new Date(parseInt(currentTimeInMs) - parseInt(localStorage.timeDiff));
	var month = currentDateTime.getMonth();
	var day = currentDateTime.getDate();
	var hours = currentDateTime.getHours();
	var minutes = currentDateTime.getMinutes();
	var seconds = currentDateTime.getSeconds();
	month = month + 1;

	month = month + "";

	if (month.length == 1) {
		month = "0" + month;
	}

	day = day + "";

	if (day.length == 1) {
		day = "0" + day;
	}

	hours = hours + "";

	if (hours.length == 1) {
		hours = "0" + hours;
	}

	minutes = minutes + "";

	if (minutes.length == 1) {
		minutes = "0" + minutes;
	}

	seconds = seconds + "";

	if (seconds.length == 1) {
		seconds = "0" + seconds;
	}
	return currentDateTime.getFullYear() + '-' + month + '-' + day + " " + hours + ":" + minutes + ":" + seconds;
}

//Create table INFO
function createTable() {
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS INFO (localId INTEGER PRIMARY KEY AUTOINCREMENT ,serverId INTEGER ,firstName TEXT ,middleName TEXT ,lastName TEXT ,address TEXT ,country TEXT ,officialEmail TEXT ,personalEmail TEXT ,mobilePhoneA TEXT ,mobilePhoneB TEXT ,homePhoneA TEXT ,homePhoneB TEXT ,emergencyPhoneA TEXT ,emergencyPhoneB TEXT ,projectGroup TEXT ,bloodGroup TEXT ,birthDay DATE ,image TEXT,dateCreated DATETIME ,dateModified DATETIME,dateDeleted DATETIME)');
	});
}

//Insert into SQLite
function insertInSqLite(data) {
	db.transaction(function(tx) {
		tx.executeSql('INSERT INTO INFO (firstName,middleName,lastName,address,country,projectGroup,officialEmail,personalEmail,mobilePhoneA,mobilePhoneB,homePhoneA,homePhoneB,emergencyPhoneA,emergencyPhoneB,bloodGroup,birthDay,dateCreated,image) VALUES ("' + data.firstName + '","' + data.middleName + '","' + data.lastName + '","' + data.address + '","' + data.country + '","' + data.projectGroup + '","' + data.officialEmail + '","' + data.personalEmail + '","' + data.mobilePhoneA + '","' + data.mobilePhoneB + '","' + data.homePhoneA + '","' + data.homePhoneB + '","' + data.emergencyPhoneA + '","' + data.emergencyPhoneB + '","' + data.bloodGroup + '","' + data.birthDay + '","' + getCurrentDateTime() + '","' + data.image + '")');
	});
	syncWithServer();
}

//Populate userList
function populateContactList(obj) {
	createTable();
	var query;
	var id;
	if($.type(obj) == "undefined"){
		viewByCatagory = false;
		$("#showAllContacts").addClass("item_hidden");
		query = 'SELECT * FROM INFO WHERE dateDeleted IS NULL ORDER BY firstName,middleName,lastName ASC';
	} else {
		id = $(obj).attr('id');
		viewByCatagory = true;
		$("#showAllContacts").removeClass("item_hidden");
		if(id.indexOf("Group") != -1) {
			query = 'SELECT * FROM INFO WHERE dateDeleted IS NULL AND projectGroup ="'+$(obj).prev().val()+'" ORDER BY firstName,middleName,lastName ASC';
		} else if ( id.indexOf("Country") != -1 ) {	
			query = 'SELECT * FROM INFO WHERE dateDeleted IS NULL AND country = "'+$(obj).prev().val()+'" ORDER BY firstName,middleName,lastName ASC';
		}
	}

	db.transaction(function(tx) {
		tx.executeSql(query, [], function(tx, results) {
			$("#contactList").html('');
			var len = results.rows.length;
			for (var i = 0; i < len; i++) {
				var row = results.rows.item(i);
				if (row["mobilePhoneA"] != '0' && row["mobilePhoneA"] != null && row["mobilePhoneA"] != '')
					mobileNumber = row["mobilePhoneA"];
				else if (row["mobilePhoneB"] != '0' && row["mobilePhoneB"] != null && row["mobilePhoneB"] != '')
					mobileNumber = row["mobilePhoneB"];
				else if (row["homePhoneA"] != '0' && row["homePhoneA"] != null && row["homePhoneA"] != '')
					mobileNumber = row["homePhoneA"];
				else if (row["homePhoneB"] != '0' && row["homePhoneB"] != null && row["homePhoneB"] != '')
					mobileNumber = row["homePhoneB"];
				else if (row["emergencyPhoneA"] != '0' && row["emergencyPhoneA"] != null && row["emergencyPhoneA"] != '')
					mobileNumber = row["emergencyPhoneA"];
				else if (row["emergencyPhoneB"] != '0' && row["emergencyPhoneB"] != null && row["emergencyPhoneB"] != '')
					mobileNumber = row["emergencyPhoneB"];
				else
					mobileNumber = '';

				var htmlData = '<li data-icon="false" id="' + row["localId"] + '"><a onclick = "populateDetails(this);"><img src="' + row["image"] + '"/><h2>' + row["firstName"] + '</h2><p>' + mobileNumber + '<img src="" id="contactListCountry'+row["localId"]+'" class="contactListCountryFlag"/></p></a><a href="" onclick="callIndexPage(this);"></a></li>';
				$("#contactList").append(htmlData).listview('refresh');
				if(row["country"].toUpperCase() == 'NEPAL'){
					$('#contactListCountry'+row["localId"]).attr('src','images/nepal.png');
				} else if(row["country"].toUpperCase() == 'INDIA'){
					$('#contactListCountry'+row["localId"]).attr('src','images/india.png');
				} else if(row["country"].toUpperCase() == 'NETHERLANDS'){
					$('#contactListCountry'+row["localId"]).attr('src','images/netherlands.png');
				}
				$("#contactList").listview('refresh');
				$("#indexPagePanel").panel("close");
			}
		}, errorCB);
	});
}

//Error Callback
function errorCB(err) {
	alert(JSON.stringify(err));
}


//Populate Details Page
function populateDetails(list) {
	var id;
	if ($.type(list) == 'object')
		id = $(list).closest('li').attr('id');
	else if ($.type(list) == 'string')
		id = list;
	else
		id = $("#idHolder").val();
	$("#idHolder").val(id);
	$.mobile.changePage("#detailsPage");
	$('#saveButton').addClass('item_hidden');
	$('#detailsPageOption').removeClass('item_hidden');
	db.transaction(
		function(tx) {
			tx.executeSql('SELECT * FROM INFO WHERE localId=' + id, [],
				function(tx, results) {
					$("#idHolder").val(id);
					var row = results.rows.item(0);
					$("#serverId").val(row["serverId"]);
					$("#detailsImage").attr('src', row['image']);
					$("#nameHeader").html(
						""+ row['firstName'] + " " + row['middleName'] + " " +row['lastName'] + ""

					)
					/*Populate Country*/
					$("#detailsPageListView").html('');
					if(!(row['address'] == '' || typeof(row['address']) == 'undefined' || row['address'] == null  )){
						if(!(row['country'] == '' || typeof(row['country']) == 'undefined' || row['country'] == null  )){
							$("#detailsPageListView").append("<li><span>"+row['address']+", "+row['country']+"<img id='detailsPageFlag' height=60/></span></li>");
						}else{
							$("#detailsPageListView").append("<li>"+row['address']+"</li>");
						}
					}else if(!(row['country'] == '' || typeof(row['country']) == 'undefined' || row['country'] == null  )){
						$("#detailsPageListView").append("<li><span>"+row['country']+"<img id='detailsPageFlag' height=60/></span></li>");
					}
					if(row['country'].toUpperCase() == 'NEPAL')
						$("#detailsPageFlag").attr("src","images/nepal.png");
					else if(row['country'].toUpperCase() == 'INDIA')
						$("#detailsPageFlag").attr("src","images/india.png");
					else if(row['country'].toUpperCase() == 'NETHERLANDS')
						$("#detailsPageFlag").attr("src","images/netherlands.png");
					/*Populate Country Finished*/
					if(!(row['projectGroup'] == '' || typeof(row['projectGroup']) == 'undefined' || row['projectGroup'] == null  ))
						$("#detailsPageListView").append("<li>Project Group:&nbsp;&nbsp;<span>"+row['projectGroup']+"</span>");

					/*Populate Email Addresses*/
					if((row['officialEmail'] != '' && typeof(row['officialEmail']) != 'undefined' &&  row['officialEmail'] != null) || (row['personalEmail'] != '' && typeof(row['personalEmail']) != 'undefined' &&  row['personalEmail'] != null)){
						$("#detailsPageListView").append("<li data-role='list-divider'><strong>Email</strong></li>");
						if(row['officialEmail'] != '' && typeof(row['officialEmail']) != 'undefined' &&  row['officialEmail'] != null){
							$("#detailsPageListView").append("<li class='sublist'><span><a href='mailto:"+row['officialEmail']+"'>"+row['officialEmail']+"</a></span><span class='smallfonts'>(office)</span></li>");
						}
						if(row['personalEmail'] != '' && typeof(row['personalEmail']) != 'undefined' &&  row['personalEmail'] != null){
							$("#detailsPageListView").append("<li class='sublist'><span><a href='mailto:"+row['personalEmail']+"'>"+row['personalEmail']+"</a></span><span class='smallfonts'>(personal)</span></li>");
						}
					}
					/*Populate Email Address Finished*/

					/*Populate Mobile Numbers*/
					$("#detailsPageListView").append("<li data-role='list-divider'><strong>Phone</strong></li>");
					if((row['mobilePhoneA'] != '' && typeof(row['mobilePhoneA']) != 'undefined' &&  row['mobilePhoneA'] != null)){	
						$("#detailsPageListView").append("<li class='sublist'><span><a onclick='callMsgPopup(this);'>"+row['mobilePhoneA']+"</a></span><span class='smallfonts'>(mobile)</span></li>");
					}

					if((row['mobilePhoneB'] != '' && typeof(row['mobilePhoneB']) != 'undefined' &&  row['mobilePhoneB'] != null)){	
						$("#detailsPageListView").append("<li class='sublist'><span><a onclick='callMsgPopup(this);'>"+row['mobilePhoneB']+"</a></span><span class='smallfonts'>(mobile)</span></li>");
					}

					if((row['homePhoneA'] != '' && typeof(row['homePhoneA']) != 'undefined' &&  row['mobilePhoneB'] != null)){	
						$("#detailsPageListView").append("<li class='sublist'><span><a onclick='callMsgPopup(this);'>"+row['homePhoneA']+"</a></span><span class='smallfonts'>(home)</span></li>");
					}

					if((row['homePhoneB'] != '' && typeof(row['homePhoneB']) != 'undefined' &&  row['homePhoneB'] != null)){	
						$("#detailsPageListView").append("<li class='sublist'><span><a onclick='callMsgPopup(this);'>"+row['homePhoneB']+"</a></span><span class='smallfonts'>(home)</span></li>");
					}

					if((row['emergencyPhoneA'] != '' && typeof(row['emergencyPhoneA']) != 'undefined' &&  row['emergencyPhoneA'] != null)){	
						$("#detailsPageListView").append("<li class='sublist'><span><a onclick='callMsgPopup(this);'>"+row['emergencyPhoneA']+"</a></span><span class='smallfonts'>(emergency)</span></li>");
					}

					if((row['emergencyPhoneB'] != '' && typeof(row['emergencyPhoneB']) != 'undefined' &&  row['emergencyPhoneB'] != null)){	
						$("#detailsPageListView").append("<li class='sublist'><span><a onclick='callMsgPopup(this);'>"+row['emergencyPhoneB']+"</a></span><span class='smallfonts'>(emergency)</span></li>");
					}
					/*Populate Mobile Numbers Finished*/

					if((row['bloodGroup'] != '' && typeof(row['bloodGroup']) != 'undefined' &&  row['bloodGroup'] != null)){
						$("#detailsPageListView").append("<li>Blood Group:&nbsp;&nbsp;<span>"+row['bloodGroup']+"</span>");
					}

					if((row['birthDay'] != '' && typeof(row['birthDay']) != 'undefined' &&  row['bloodGroup'] != null)){
						$("#detailsPageListView").append("<li>Birth Day:&nbsp;&nbsp;<span>"+row['birthDay']+"</span>");
					}
					image=row["image"];
					$('#saveButton').addClass('item_hidden');
					$('#detailsPageOption').removeClass('item_hidden');
					$('#detailsPageTable').addClass('item_hidden');
					$('#cancelButton').addClass('item_hidden');
					$('#detailsPageBackButton').removeClass('item_hidden');
					$('#detailsPageListView').removeClass('item_hidden');
					$("#detailsImageDiv").removeAttr("onclick");
					$("#detailsImageDiv").removeClass('image');
					$('#detailsPageListView').listview('refresh');
				},
				errorCB);
		},
		errorCB);
}

//Edit Details
function editDetails() {
	id = $("#idHolder").val();
	db.transaction(
		function(tx) {
			tx.executeSql('SELECT * FROM INFO WHERE localId=' + id, [],
				function(tx, results) {
					var row = results.rows.item(0);
					$("#detailsImageDiv").attr("onclick", "loadImage()");
					$("#detailsImageDiv").addClass('image');
					$("#dataFirstName").html('<input class="editdata" type="text" id="editDataFirstName" name="editdatafirstName" value="' + row["firstName"] + '">');
					$("#dataMiddleName").html('<input class="editdata" type="text" id="editDataMiddleName" name="editdatamiddleName" value="' + row["middleName"] + '">');
					$("#dataLastName").html('<input class="editdata" type="text" id="editDataLastName" name="editdatalastName" value="' + row["lastName"] + '">');
					$("#dataAddress").html('<input class="editdata" type="text" id="editDataAddress" name="editdataaddress" value="' + row["address"] + '">');
					$("#dataCountry").html('<input class="editdata" type="text" id="editDataCountry" value="' + row["country"] + '">');
					$("#dataProjectGroup").html('<input class="editdata" type="text" id="editDataProjectGroup" value="' + row["projectGroup"] + '">');
					$("#dataOfficialEmail").html('<input class="editdata" type="email" id="editDataOfficialEmail" value="' + row["officialEmail"] + '">');
					$("#dataPersonalEmail").html('<input class="editdata" type="email" id="editDataPersonalEmail" value="' + row["personalEmail"] + '">');
					$("#dataMobilePhoneA").html('<input class="editdata" type="tel" id="editDataMobilePhoneA" value="' + row["mobilePhoneA"] + '">');
					$("#dataMobilePhoneB").html('<input class="editdata" type="tel" id="editDataMobilePhoneB" value="' + row["mobilePhoneB"] + '">');
					$("#dataHomePhoneA").html('<input class="editdata" type="tel" id="editDataHomePhoneA" value="' + row["homePhoneA"] + '">');
					$("#dataHomePhoneB").html('<input class="editdata" type="tel" id="editDataHomePhoneB" value="' + row["homePhoneB"] + '">');
					$("#dataEmergencyPhoneA").html('<input class="editdata" type="tel" id="editDataEmergencyPhoneA" value="' + row["emergencyPhoneA"] + '">');
					$("#dataEmergencyPhoneB").html('<input class="editdata" type="tel" id="editDataEmergencyPhoneB" value="' + row["emergencyPhoneB"] + '">');
					$("#dataBloodGroup").html('<input class="editdata" type="text" id="editDataBloodGroup" value="' + row["bloodGroup"] + '">');
					$("#dataBirthDay").html('<input class="editdata" type="text" id="editDataBirthDay" value="' + row["birthDay"] + '">');
					$('#detailsPage').trigger('create');
					img = row["image"];
					$('#detailsPageTable').removeClass('item_hidden');
					$('#detailsPageListView').addClass('item_hidden');
					$('#cancelButton').removeClass('item_hidden');
					$('#detailsPageBackButton').addClass('item_hidden');
					$("#detailsPagePanel").panel("close");
					$('#saveButton').removeClass('item_hidden');
					$('#detailsPageOption').addClass('item_hidden');
					$( "#editDataCountry" ).autocomplete({
			  			source: countries
					});
				}
			);
		}
	);
}

//Function Save edited Data
function saveEditedData() {
	var personalEmailBool = isEmail($("#editDataPersonalEmail").val()) || $("#editDataPersonalEmail").val() == '';
	var officialEmailBool = isEmail($("#editDataOfficialEmail").val()) || $("#editDataOfficialEmail").val() == '';
	if($("#editDataFirstName").val()!=''){
		if(($("#editDataMobilePhoneA").val() != '' || $("#editDataMobilePhoneB").val() != '' || $("#editDataHomePhoneA").val() != '' || $("#editDataHomePhoneB").val() != '' || $("#editDataEmergencyPhoneA").val() != ''|| $("#editDataEmergencyPhoneB").val() != '')){
			if( personalEmailBool && officialEmailBool){
				firstName = $("#editDataFirstName").val();
				middleName = $("#editDataMiddleName").val();
				lastName = $("#editDataLastName").val();
				address = $("#editDataAddress").val();
				country = $("#editDataCountry").val();
				projectGroup = $("#editDataProjectGroup").val();
				officialEmail = $("#editDataOfficialEmail").val();
				personalEmail = $("#editDataPersonalEmail").val();
				mobilePhoneA = $("#editDataMobilePhoneA").val();
				mobilePhoneB = $("#editDataMobilePhoneB").val();
				homePhoneA = $("#editDataHomePhoneA").val();
				homePhoneB = $("#editDataHomePhoneB").val();
				emergencyPhoneA = $("#editDataEmergencyPhoneA").val();
				emergencyPhoneB = $("#editDataEmergencyPhoneB").val();
				bloodGroup = $("#editDataBloodGroup").val();
				birthDay = $("#editDataBirthDay").val();
				db.transaction(function(tx) {
					tx.executeSql('UPDATE INFO SET firstName="' + firstName + '",middleName="' + middleName + '" ,lastName="' + lastName + '",address="' + address + '",country="' + country + '" ,projectGroup="' + projectGroup + '" ,officialEmail="' + officialEmail + '",personalEmail="' + personalEmail + '",mobilePhoneA="' + mobilePhoneA + '",mobilePhoneB="' + mobilePhoneB + '",homePhoneA="' + homePhoneA + '",homePhoneB="' + homePhoneB + '",emergencyPhoneA="' + emergencyPhoneA + '",emergencyPhoneB="' + emergencyPhoneB + '",bloodGroup="' + bloodGroup + '",birthDay="' + birthDay + '",image="' + image + '",dateModified="' + getCurrentDateTime() + '" WHERE localId="' + $("#idHolder").val() + '"');
				});
				populateDetails($("#idHolder").val());
				syncWithServer();
				populateContactList();
			} else {
				alert("Please insert valid Email Address");
			}
		} else {
			alert("Please insert atleast one Contact Number ");
		}

	} else {
		alert("Please insert First Name");
	}
}

//CLear Local Data
function clearLocalData() {
	$("#inputPasswordPopup").popup("open");
	$("#password").val('');
	$("#passwordBtn").on("tap",function(){	
		if(verifyPassword($("#password").val())){
			db.transaction(function(tx) {
				tx.executeSql('DROP TABLE IF EXISTS INFO');
			});
			createTable();
			localStorage.lastSynced = '0001-01-01 00:00:00';
			$("#indexPagePanel").panel("close");
			populateContactList();
			$("#inputPasswordPopup").popup("close");
			alert("Local data cleared");
		} else {
			alert("Sorry password doesn't match")
		}
	});
}

//function callIndexPage
function callIndexPage(obj) {
	var id = id = $(obj).closest('li').attr('id');
	db.transaction(
		function(tx) {
			tx.executeSql('SELECT * FROM INFO WHERE localId=' + id, [],
				function(tx, results) {
					var row = results.rows.item(0);
					if (row["mobilePhoneA"] != '0' && row["mobilePhoneA"] != null && row["mobilePhoneA"] != '')
						mobileNumber = row["mobilePhoneA"];
					else if (row["mobilePhoneB"] != '0' && row["mobilePhoneB"] != null && row["mobilePhoneB"] != '')
						mobileNumber = row["mobilePhoneB"];
					else if (row["homePhoneA"] != '0' && row["homePhoneA"] != null && row["homePhoneA"] != '')
						mobileNumber = row["homePhoneA"];
					else if (row["homePhoneB"] != '0' && row["homePhoneB"] != null && row["homePhoneB"] != '')
						mobileNumber = row["homePhoneB"];
					else if (row["emergencyPhoneA"] != '0' && row["emergencyPhoneA"] != null && row["emergencyPhoneA"] != '')
						mobileNumber = row["emergencyPhoneA"];
					else if (row["emergencyPhoneB"] != '0' && row["emergencyPhoneB"] != null && row["emergencyPhoneB"] != '')
						mobileNumber = row["emergencyPhoneB"];
					else
						mobileNumber = '';
					document.location.href = 'tel:' + mobileNumber;
				});
		}
	);
}

//function Delete Details
function deleteDetails() {
	$("#detailsPagePanel").panel("close");
	navigator.notification.confirm(
		'Are you sure?',
		function(buttonIndex) {
			onConfirm(buttonIndex);
		},
		'Delete Contact', ['Ok', 'Cancel']
	);
}
/*On confirm Delete Button*/
function onConfirm(buttonIndex) {
	if (buttonIndex == '1') {
		db.transaction(function(tx) {
			tx.executeSql("UPDATE INFO SET dateModified='" + getCurrentDateTime() + "',dateDeleted='" + getCurrentDateTime() + "' WHERE localId='" + $('#idHolder').val() + "'");
		});
		syncWithServer();
		populateContactList();
		$.mobile.changePage($("#index"));
	}
}

/*Sync With Server to Sent new Datas and receive new Datas*/
function syncWithServer() {
	if(navigator.network.connection.type != 'none')
		deletableIds = [];
		db.transaction(
			function(tx) {
				tx.executeSql("SELECT * FROM INFO WHERE dateCreated > Datetime('" + localStorage.lastSynced + "') OR dateModified > Datetime('" + localStorage.lastSynced + "')", [], processNewData, errorCB);
			}
		);
}

function processNewData(tx, results) {
	var len = results.rows.length;
	//Data To be sent to server
	var sentData = {
		lastSynced: localStorage.lastSynced,
		created: {},
		modified: {},
		deleted: {}
	};

	for (var i = 0; i < len; i++) {
		var row = results.rows.item(i);
		if (row["dateModified"] != null) {
			if (row["dateDeleted"] != null) {
				sentData.deleted[row["localId"]] = {
					serverId: row["serverId"],
					firstName: row["firstName"],
					middleName: row["middleName"],
					lastName: row["lastName"],
					address: row["address"],
					country: row["country"],
					projectGroup: row["projectGroup"],
					officialEmail: row["officialEmail"],
					personalEmail: row["personalEmail"],
					mobilePhoneA: row["mobilePhoneA"],
					mobilePhoneB: row["mobilePhoneB"],
					homePhoneA: row["homePhoneA"],
					homePhoneB: row["homePhoneB"],
					emergencyPhoneA: row["emergencyPhoneA"],
					emergencyPhoneB: row["emergencyPhoneB"],
					bloodGroup: row["bloodGroup"],
					birthDay: row["birthDay"],
					image: row["image"],
					dateCreated: row["dateCreated"],
					dateModified: row["dateModified"],
					dateDeleted: row["dateDeleted"]
				};
				deletableIds.push(row["localId"]);
			} 
			else {
				sentData.modified[row["localId"]] = {
					serverId: row["serverId"],
					firstName: row["firstName"],
					middleName: row["middleName"],
					lastName: row["lastName"],
					address: row["address"],
					country: row["country"],
					projectGroup: row["projectGroup"],
					officialEmail: row["officialEmail"],
					personalEmail: row["personalEmail"],
					mobilePhoneA: row["mobilePhoneA"],
					mobilePhoneB: row["mobilePhoneB"],
					homePhoneA: row["homePhoneA"],
					homePhoneB: row["homePhoneB"],
					emergencyPhoneA: row["emergencyPhoneA"],
					emergencyPhoneB: row["emergencyPhoneB"],
					bloodGroup: row["bloodGroup"],
					birthDay: row["birthDay"],
					image: row["image"],
					dateCreated: row["dateCreated"],
					dateModified: row["dateModified"]
				};
			}
		} else {
			// alert("insert into db");
			sentData.created[row["localId"]] = {
				serverId: row["serverId"],
				firstName: row["firstName"],
				middleName: row["middleName"],
				lastName: row["lastName"],
				address: row["address"],
				country: row["country"],
				projectGroup: row["projectGroup"],
				officialEmail: row["officialEmail"],
				personalEmail: row["personalEmail"],
				mobilePhoneA: row["mobilePhoneA"],
				mobilePhoneB: row["mobilePhoneB"],
				homePhoneA: row["homePhoneA"],
				homePhoneB: row["homePhoneB"],
				emergencyPhoneA: row["emergencyPhoneA"],
				emergencyPhoneB: row["emergencyPhoneB"],
				bloodGroup: row["bloodGroup"],
				birthDay: row["birthDay"],
				image: row["image"],
				dateCreated: row["dateCreated"]

			};
		}
	}
	navigator.notification.activityStart("", "Connecting to Server");
	$.ajax({
		url: server + 'transations.php',
		type: 'POST',
		async: false,
		data: sentData,
		success: function(response) {
			$.each(deletableIds, function(index,value){
				db.transaction(function(tx) {
					tx.executeSql("DELETE FROM INFO WHERE localId=" + value);
				});
			});
			response = JSON.parse(response);
			insert(response);
			var now = new Date();
			// alert("server date= "+ response.datetime);
			// alert("local time= "+now);

			var serverDate = response.datetime;
			//alert(serverDate + " /n " +getCurrentDateTime()+ " /n "+now);
			localStorage.timeDiff = now - new Date(parseInt(serverDate.substring(0, 4)),
				parseInt(serverDate.substring(5, 7)) - 1,
				parseInt(serverDate.substring(8, 10)),
				parseInt(serverDate.substring(11, 13)),
				parseInt(serverDate.substring(14, 16)),
				parseInt(serverDate.substring(17)));
			// alert("Time Diff= "+localStorage.timeDiff);
			localStorage.lastSynced = serverDate;
			populateContactList();
			$("#indexPagePanel").panel("close");
			navigator.notification.activityStop();
		},
		error: function(xhr, error) {
			alert("Could Not Connect to Server");
			populateContactList();
			$("#indexPagePanel").panel("close");
			navigator.notification.activityStop();
		}
	});
		//navigator.notification.activityStop();
}

function insert(response){
	db.transaction(function(tx) {
		$.each(response, function(index) {
			if (index == 'serverId') {
				$.each(response.serverId, function(index) {
					// alert(response.serverId[index].serverId);
					db.transaction(function(tx) {
						tx.executeSql("UPDATE INFO SET serverId='" + response.serverId[index].serverId + "' WHERE localId='" + response.serverId[index].localId + "'");
					});
				});
			} else if (index == 'news') {
				$.each(response.news,
					function(index) {
						// alert(index);
						if (response.news[index].dateModified != '0000-00-00 00:00:00') {
							if (response.news[index].dateDeleted != '0000-00-00 00:00:00') {
								// alert("delete");
								tx.executeSql('DELETE FROM INFO WHERE serverId=' + index);
							} else {
								// alert("modify");
								tx.executeSql("SELECT * FROM INFO WHERE serverId=" + index, [],
									function(tx, result) {
										if (result.rows.length != 0) {
											// alert("not
											// empty");
											tx.executeSql('UPDATE INFO SET firstName="' + response.news[index].firstName + '",middleName="' + response.news[index].middleName + '" ,lastName="' + response.news[index].lastName + '",address="' + response.news[index].address + '",country="' + response.news[index].country + '" ,projectGroup="' + response.news[index].projectGroup + '" ,officialEmail="' + response.news[index].officialEmail + '",personalEmail="' + response.news[index].personalEmail + '",mobilePhoneA="' + response.news[index].mobilePhoneA + '",mobilePhoneB="' + response.news[index].mobilePhoneB + '",homePhoneA="' + response.news[index].homePhoneA + '",homePhoneB="' + response.news[index].homePhoneB + '",emergencyPhoneA="' + response.news[index].emergencyPhoneA + '",emergencyPhoneB="' + response.news[index].emergencyPhoneB + '",bloodGroup="' + response.news[index].bloodGroup + '",birthDay="' + response.news[index].birthDay + '",image="' + response.news[index].image + '",dateCreated="' + response.news[index].dateCreated + '",dateModified="' + response.news[index].dateModified + '" WHERE serverId="' + index + '"');
											// alert("sfd");
										} else {
											// alert("empty");
											tx.executeSql('INSERT INTO INFO (firstName,middleName,lastName,address,country,projectGroup,officialEmail,personalEmail,mobilePhoneA,mobilePhoneB,homePhoneA,homePhoneB,emergencyPhoneA,emergencyPhoneB,bloodGroup,birthDay,dateCreated,dateModified,image) VALUES ("' + response.news[index].firstName + '","' + response.news[index].middleName + '","' + response.news[index].lastName + '","' + response.news[index].address + '","' + response.news[index].country + '","' + response.news[index].projectGroup + '","' + response.news[index].officialEmail + '","' + response.news[index].personalEmail + '","' + response.news[index].mobilePhoneA + '","' + response.news[index].mobilePhoneB + '","' + response.news[index].homePhoneA + '","' + response.news[index].homePhoneB + '","' + response.news[index].emergencyPhoneA + '","' + response.news[index].emergencyPhoneB + '","' + response.news[index].bloodGroup + '","' + response.news[index].birthDay + '","' + response.news[index].dateCreated + '","' + response.news[index].dateModified + '","' + response.news[index].image + '")');
										}
									}
								);
							}
						} else {
							// alert("insert");
							tx.executeSql('INSERT INTO INFO (serverId,firstName,middleName,lastName,address,country,projectGroup,officialEmail,personalEmail,mobilePhoneA,mobilePhoneB,homePhoneA,homePhoneB,emergencyPhoneA,emergencyPhoneB,bloodGroup,birthDay,dateCreated,image) VALUES ("' + index + '","' + response.news[index].firstName + '","' + response.news[index].middleName + '","' + response.news[index].lastName + '","' + response.news[index].address + '","' + response.news[index].country + '","' + response.news[index].projectGroup + '","' + response.news[index].officialEmail + '","' + response.news[index].personalEmail + '","' + response.news[index].mobilePhoneA + '","' + response.news[index].mobilePhoneB + '","' + response.news[index].homePhoneA + '","' + response.news[index].homePhoneB + '","' + response.news[index].emergencyPhoneA + '","' + response.news[index].emergencyPhoneB + '","' + response.news[index].bloodGroup + '","' + response.news[index].birthDay + '","' + response.news[index].dateCreated + '","' + response.news[index].image + '")');
						}
					}
				);
			}
		});
	});
	populateContactList();
}
/*Sync With Server Finished*/

/*Show Call Message Popup Function*/
function callMsgPopup(obj){
	var phoneNumber = $(obj).html().replace ( /[^\d.]/g, '' );
	$('#callMsgDialog > .ui-grid-a > .ui-block-a').html('<a href="tel:'+phoneNumber+'"><img src="images/phoneicon.png" class="leftimg" /></a>');
	$('#callMsgDialog > .ui-grid-a > .ui-block-b').html('<a href="sms:'+phoneNumber+'"><img src="images/message.png" class="rightimg" /></a>');
	$('#callMsgDialog').trigger('create');
	$('#callMsgDialog').popup('open');
}
/*Show Call Message Popup Finished*/

/*Choose Catagory Popup*/
function catagoryButtonClick(){
	$('#indexPagePanel').panel('close');
	$('#chooseCatagory').popup('open');
}

/*Index page Popus's Select Country/Project Group*/
function viewCounGrp(obj){
	var projectGroups = [];
	var countries = [];

	db.transaction(function(tx){
		tx.executeSql("SELECT * FROM INFO WHERE dateDeleted IS NULL",[],function(tx,results){
			var len = results.rows.length;
			for (var i = 0; i < len; i++) {
				var row = results.rows.item(i);
				var projectGroupFound = false;
				var countryFound = false;
				$.each( projectGroups, function( index, value ){
				  if(row["projectGroup"].toString().toUpperCase() == value.toString().toUpperCase()){
				  	projectGroupFound = true;
				  	return false;
				  }
				});
				$.each( countries, function( index, value ){
				  if(row["country"].toString().toUpperCase() == value.toString().toUpperCase()){
				  	countryFound = true;
				  	return false;
				  }
				});
				if(!projectGroupFound)
					projectGroups.push(row["projectGroup"]);
				if(!countryFound){
					countries.push(row["country"]);
				}
			}
		});
	},errorCB , populateCatagoryList);
	
	function populateCatagoryList(){
		var id = $(obj).attr("id");
		projectGroups.sort();
		countries.sort();
		$("#catagoryPageListview").html("");
		if(id == 'chooseByPGroup'){
			$.each(projectGroups, function(index,value){
				if(value == "")
					$("#catagoryPageListview").append("<li><input type='hidden' value='"+value+"'/><a id='notSpecifiedGroup' onclick='populateSelectedData(this);'>Not Specified</a></li>");
				else
					$("#catagoryPageListview").append("<li><input type='hidden' value='"+value+"'/><a id=projectGroup"+index+" onclick='populateSelectedData(this);'>"+value+"</a></li>");
			});			
		} else if (id == 'chooseByCountry'){
			$.each(countries, function(index,value){
				if(value == "")
					$("#catagoryPageListview").append("<li><input type='hidden' value='"+value+"'/><a id='notSpecifiedCountry' onclick='populateSelectedData(this);'>Not Specified</a></li>");
				else
					$("#catagoryPageListview").append("<li><input type='hidden' value='"+value+"'/><a id=Country"+index+" onclick='populateSelectedData(this);'>"+value+"</a></li>");
			});	
		}
		$.mobile.changePage("#catagoryPage", {transition:"slide"});
		$("#catagoryPageListview").listview("refresh");
	}
}
/*Popualate Selected Data Function*/
function populateSelectedData(obj){
	populateContactList(obj);
	$.mobile.changePage("#index");
}
/*Populate Selected Data Finished*/

/*Verify Password Function*/
function verifyPassword(pass){
	if(pass === PASSWORD)
		return true;
	else
		return false;
} 

/*Validate Email*/
function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}