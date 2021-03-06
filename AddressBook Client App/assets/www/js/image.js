//Load Image-Edit 
function loadImage() {
	navigator.camera.getPicture(onPhotoSuccessEdit, onFail, { quality: 50, 
	destinationType: Camera.DestinationType.DATA_URL,
	sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
	
 }
	 
//Load Image-Add 
function loadImageAdd() {
	navigator.camera.getPicture(onPhotoSuccessAdd, onFail, { quality: 50, 
	destinationType: Camera.DestinationType.DATA_URL,
	sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
}
 
function onPhotoSuccessAdd(imageData) {
    image = "data:image/jpeg;base64," + imageData;
	$('.previewer').attr('src', setImage(image));
}

function onPhotoSuccessEdit(imageData) {
	image = "data:image/jpeg;base64," + imageData;
	$('#detailsImage').attr('src', setImage(image));
}

function onFail(message) {
  //alert('Failed because: ' + message);
}

//Set Default Image
$(document).on("pagebeforeshow","#index",function(){
	image = "";
});

//Set Image
function setImage(img){
	if(img != null && img !="" && typeof(img) != "undefined"){
		return img;
	}else {
		return defaultimg;
	}
}
