<?php
header("Access-Control-Allow-Origin: *");
//header("Content-Type: application/json");
require_once('connecttoDB.php');

date_default_timezone_set('Asia/Katmandu');
$now = new DateTime();
$response=array("serverId"=>array(),"news"=>array(),"datetime"=>$now->format('Y-m-d H:i:s'));

if(isset($_POST['lastSynced'])){
	$lastSynced=$_POST['lastSynced'];

	if($lastSynced==='0001-01-01 00:00:00'){
		$result = mysqli_query($con,"SELECT * FROM info WHERE dateDeleted = '0000-00-00 00:00:00'");
	}else{
		$result= mysqli_query($con,"SELECT * FROM info WHERE (dateCreated > '".$lastSynced."' OR dateModified > '".$lastSynced."')") ;
	}
	while($row = mysqli_fetch_array($result))
	  {	
		$response['news'][$row["id"]]=array("firstName"=>$row["firstName"],"middleName"=>$row["middleName"],"lastName"=>$row["lastName"],"address"=>$row["address"],"country"=>$row["country"],"projectGroup"=>$row["projectGroup"],"officialEmail"=>$row["officialEmail"],"personalEmail"=>$row["personalEmail"],"mobilePhoneA"=>$row["mobilePhoneA"],"mobilePhoneB"=>$row["mobilePhoneB"],"homePhoneA"=>$row["homePhoneA"],"homePhoneB"=>$row["homePhoneB"],"emergencyPhoneA"=>$row["emergencyPhoneA"],"emergencyPhoneB"=>$row["emergencyPhoneB"],"bloodGroup"=>$row["bloodGroup"],"birthDay"=>$row["birthDay"],"image"=>$row["image"],"dateCreated"=>$row["dateCreated"],"dateModified"=>$row["dateModified"],"dateDeleted"=>$row["dateDeleted"]);
	  }
}
if (isset($_POST["created"])){
	$created=$_POST["created"];
	foreach ($created as $id=>$infos){
		$sql="INSERT INTO info (firstName,middleName,lastname,address,country,projectGroup,officialEmail,personalEmail,mobilePhoneA,mobilePhoneB,homePhoneA,homePhoneB,emergencyPhoneA,emergencyPhoneB,bloodGroup,birthDay,image,dateCreated) VALUES('".$infos["firstName"]."','".$infos["middleName"]."','".$infos["lastName"]."','".$infos["address"]."','".$infos["country"]."','".$infos["projectGroup"]."','".$infos["officialEmail"]."','".$infos["personalEmail"]."','".$infos["mobilePhoneA"]."','".$infos["mobilePhoneB"]."','".$infos["homePhoneA"]."','".$infos["homePhoneB"]."','".$infos["emergencyPhoneA"]."','".$infos["emergencyPhoneB"]."','".$infos["bloodGroup"]."','".$infos["birthDay"]."','".$infos["image"]."','".$infos["dateCreated"]."')";

		if (!mysqli_query($con,$sql))
		  {
		  die('Error: ' . mysqli_error($con));
		  }
		array_push($response['serverId'],array("localId"=>$id,"serverId"=>mysqli_insert_id($con)));
	
	}
}
if (isset($_POST["modified"])){
	$modified=$_POST["modified"];
	foreach ($modified as $id=>$infos){
	
		if($infos["serverId"]==null){
		$sql="INSERT INTO info (firstName,middleName,lastname,address,country,projectGroup,officialEmail,personalEmail,mobilePhoneA,mobilePhoneB,homePhoneA,homePhoneB,emergencyPhoneA,emergencyPhoneB,bloodGroup,birthDay,image,dateCreated,dateModified) VALUES('".$infos["firstName"]."','".$infos["middleName"]."','".$infos["lastName"]."','".$infos["address"]."','".$infos["country"]."','".$infos["projectGroup"]."','".$infos["officialEmail"]."','".$infos["personalEmail"]."','".$infos["mobilePhoneA"]."','".$infos["mobilePhoneB"]."','".$infos["homePhoneA"]."','".$infos["homePhoneB"]."','".$infos["emergencyPhoneA"]."','".$infos["emergencyPhoneB"]."','".$infos["bloodGroup"]."','".$infos["birthDay"]."','".$infos["image"]."','".$infos["dateCreated"]."','".$infos["dateModified"]."')";
			if (!mysqli_query($con,$sql))
		  {
		  die('Error: ' . mysqli_error($con));
		  }
		  array_push($response['serverId'],array("localId"=>$id,"serverId"=>mysqli_insert_id($con)));
		}else{
			$sql="UPDATE info SET firstName='".$infos["firstName"]."',middleName='".$infos["middleName"]."',lastName='".$infos["lastName"]."',address='".$infos["address"]."',country='".$infos["country"]."',projectGroup='".$infos["projectGroup"]."',officialEmail='".$infos["officialEmail"]."',personalEmail='".$infos["personalEmail"]."',mobilePhoneA='".$infos["mobilePhoneA"]."',mobilePhoneB='".$infos["mobilePhoneB"]."',homePhoneA='".$infos["homePhoneA"]."',homePhoneB='".$infos["homePhoneB"]."',emergencyPhoneA='".$infos["emergencyPhoneA"]."',emergencyPhoneB='".$infos["emergencyPhoneB"]."',bloodGroup='".$infos["bloodGroup"]."',birthDay='".$infos["birthDay"]."',image='".$infos["image"]."',dateModified='".$infos["dateModified"]."' WHERE id='".$infos["serverId"]."'";
			if (!mysqli_query($con,$sql))
		  {
		  die('Error: ' . mysqli_error($con));
		  }
		}
		
	}
}
	
if (isset($_POST["deleted"])){
	$deleted=$_POST["deleted"];
	foreach ($deleted as $id=>$infos){
		if($infos["serverId"]==null){
		$sql="INSERT INTO info (firstName,middleName,lastname,address,country,projectGroup,officialEmail,personalEmail,mobilePhoneA,mobilePhoneB,homePhoneA,homePhoneB,emergencyPhoneA,emergencyPhoneB,bloodGroup,birthDay,image,dateCreated,dateModified,dateDeleted) VALUES('".$infos["firstName"]."','".$infos["middleName"]."','".$infos["lastName"]."','".$infos["address"]."','".$infos["country"]."','".$infos["projectGroup"]."','".$infos["officialEmail"]."','".$infos["personalEmail"]."','".$infos["mobilePhoneA"]."','".$infos["mobilePhoneB"]."','".$infos["homePhoneA"]."','".$infos["homePhoneB"]."','".$infos["emergencyPhoneA"]."','".$infos["emergencyPhoneB"]."','".$infos["bloodGroup"]."','".$infos["birthDay"]."','".$infos["image"]."','".$infos["dateCreated"]."','".$infos["dateModified"]."','".$infos["dateDeleted"]."')";
		}else{
			$sql="UPDATE info SET dateModified='".$infos["dateModified"]."',dateDeleted='".$infos["dateDeleted"]."'where id='".$infos["serverId"]."'";
		}
		if (!mysqli_query($con,$sql))
		  {
		  die('Error: ' . mysqli_error($con));
		  }
		
	}

}
	


mysqli_close($con);

echo json_encode($response);

?>