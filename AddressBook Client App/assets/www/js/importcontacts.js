function importFromFile() {
    $("#inputPasswordPopup").popup("open");
    $("#password").val('');
    $('#passwordBtn').off("click");
    $("#passwordBtn").on("click",function(){    
        if(verifyPassword($("#password").val())){
            navigator.camera.getPicture(uploadPhoto,
                function(message) {}, {
                    quality: 50,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                }
            );
        } else {
            alert("Sorry password doesn't match");
        }
    });
    function uploadPhoto(imageURI) {
        var options = new FileUploadOptions();
        options.headers = {
            Connection: "close"
        };
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        
        options.mimeType = "text/csv";

        var params = {};
        params.value1 = "test";
        params.value2 = "param";

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI(server + "importcontacts.php"), win, fail, options);
    }

    function win(r) {
        clearLocalData();
        syncWithServer();
        $("#indexPagePanel").panel("close");
    }

    function fail(error) {
        alert("An error has occurred: Code = " + JSON.stringify(error));
    }
}