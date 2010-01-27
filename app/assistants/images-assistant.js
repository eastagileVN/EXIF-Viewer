/* Developed by East Agile Limited, http://eastagile.com, October 2009 */
function ImagesAssistant(albumID,albumName)
{
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
       
    this.currentAlbumName = albumName;
    this.currentAlbumID = albumID;
    this.waitingQueue = new myWqueue();
}

ImagesAssistant.prototype.setup = function()
{
	this.controller.get("images_header").update(this.currentAlbumName);   
    
    this.extractfsParams = ":90:90:4";
    if (Mojo.Host.current === Mojo.Host.browser)
    {
        this.extractfsPath = "./extractfs";
    }
    else
    {
        this.extractfsPath = "/var/luna/data/extractfs";
    }
    this.buildPhotos();
}

ImagesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ImagesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ImagesAssistant.prototype.cleanup = function(event)
{
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    for(var i=0; i < this.images.length; ++i)
    {
        Mojo.Event.stopListening(this.controller.get("image_" + this.images[i].imageID), Mojo.Event.tap, this.showIndividualImage.bind(this, this.images[i]));
    }

}

ImagesAssistant.prototype.buildPhotos = function()
{
    try
	{
		this.controller.serviceRequest
		(
			"palm://com.palm.mediadb/image",
			{
				method : 'listimages',
                parameters : { "albumID":  this.currentAlbumID },
				onSuccess : this.processImageList.bind(this),
                onFailure : this.loadFail.bind(this, "Error getting list of images")
			}
		);
	}
	catch (err)
	{
		this.controller.error(err);
	}
}

ImagesAssistant.prototype.processImageList = function(response)
{
    this.images = response.images;
    var str = "";
    for(var i=0; i < this.images.length; ++i)
    {
        var thumbpath = this.extractfsPath + encodeURIComponent(this.images[i].imagePictureUrl) + this.extractfsParams;
        str = str + "<div id='image_" + this.images[i].imageID +"' class='image_item left'><img width=90 height=90 src='" + thumbpath + "'></img></div>";
    }
    this.controller.get("image_list").update(str);
    for(var i=0; i < this.images.length; ++i)
    {
        Mojo.Event.listen(this.controller.get("image_" + this.images[i].imageID), Mojo.Event.tap, this.showIndividualImage.bind(this, this.images[i]));
    }
}

ImagesAssistant.prototype.loadFail = function(msg)
{
    //FIXME hander onFail 
}

ImagesAssistant.prototype.showIndividualImage = function(image)
{
	var lMyGalleryDBalbums	= DB.myGalleryDB.albums;
	
	//Update the db about which image is clicked
    var lIndex = getAlbumIndex (lMyGalleryDBalbums,this.currentAlbumID);
    
    var lTempThumbImage = lMyGalleryDBalbums[lIndex].thumbImages[0];
    lMyGalleryDBalbums[lIndex].thumbImages[0] = image;
    lMyGalleryDBalbums[lIndex].thumbImages[2] = lMyGalleryDBalbums[lIndex].thumbImages[1];
    lMyGalleryDBalbums[lIndex].thumbImages[1] = lTempThumbImage;
    
    this.waitingQueue.addTask(this.updateDB.bind(this));
    this.waitingQueue.addTask
    (
    	this.addScene.bind(this),
    	{
    		sceneName	: "show",
    		image		: image
    	}
    );
    this.waitingQueue.runTasks();
}

ImagesAssistant.prototype.updateDB = function()
{
	DB.depot.add
	(
		"albums",
		DB.myGalleryDB,
		function()
		{	
    		this.waitingQueue.taskDone = true;
    	}.bind(this),
		function()
		{
		}.bind(this)
	);
}

ImagesAssistant.prototype.addScene = function()
{
	lSceneName = arguments[0].sceneName;
	lImage = arguments[0].image;
	this.controller.stageController.pushScene(lSceneName, lImage);
	this.waitingQueue.taskDone = true;
}
