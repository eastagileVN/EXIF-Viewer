/* Developed by East Agile Limited, http://eastagile.com, October 2009 */

function AlbumsAssistant()
{
	this.waitingQueue = new myWqueue();
	this.totalWaitTime = 0;
}

AlbumsAssistant.prototype.setup = function()
{
	this.extractfsParams = ":90:72:4";
    
	if (Mojo.Host.current === Mojo.Host.browser)
    {
        this.extractfsPath = "./extractfs";
    }
    else
    {
        this.extractfsPath = "/var/luna/data/extractfs";
    }
	
	this.appMenuModel =
	{
		visible: true,
		items:
		[
			{
				label: $L('Choose A Style'),
				command: 'cmd-SelectStyles'
			},
			{
				label: $L('about'),
				command: 'cmd-readabout'
			},
			Mojo.Menu.editItem
		]
	};

	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
	
	this.buildAlbums();
    
	/*
	var temp = function()
    {
    	this.controller.get("tester").update(DB.test + " $ " + this.totalWaitTime + " @ " + DB.myGalleryDB.currentStyleName);
    };
    
    setTimeout (temp.bind(this), 1000);
    setTimeout (temp.bind(this), 5000);
    setTimeout (temp.bind(this), 10000);
    setTimeout (temp.bind(this), 15000);
    setTimeout (temp.bind(this), 20000);
    */
    //this.controller.get("tester").update(DB.test);
}

AlbumsAssistant.prototype.handleCommand = function(event)
{
	//Returns the currently active scene from this stage, if any. If no scenes are active, returns undefined.
	this.controller=Mojo.Controller.stageController.activeScene();
    if(event.type == Mojo.Event.command)
    {	
		switch (event.command)
		{
			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
			case 'cmd-SelectStyles':
				this.controller.showDialog
				(
					{
						title: $L("Prefs Menu"),
						template: 'dialogs/choosestyledialog-scene',
						assistant: new ChoosestyledialogAssistant(this,this.choosestylesdialogCallbackFunc.bind(this)),
						preventCancel: false
					}
				);
				break;
			case 'cmd-readabout':
				this.controller.showDialog
				(
					{
						template: 'dialogs/aboutdialog-scene',
						assistant: new AboutdialogAssistant(this,this.readAboutDialog.bind(this)),
						preventCancel: false
					}
				);
				break;
		}
	}
}

AlbumsAssistant.prototype.readAboutDialog = function()
{
	
}

AlbumsAssistant.prototype.choosestylesdialogCallbackFunc = function()
{
	var lBGAlbumsElement = this.controller.get("background");
	if (DB.myGalleryDB.currentStyleName == 'positivefilm')
	{
		lBGAlbumsElement.src = "images/greyBG.png";
	}
	else
	{
		lBGAlbumsElement.src = "images/blackBG.png";
	}
	
	this.albums.each
    (
        function(aEl)
        {
            var lAlbumElement = this.controller.get("albumID_" + aEl.albumID);
            lAlbumElement.className = "album " + DB.myGalleryDB.currentStyleName;
        }.bind(this)
    );
}

AlbumsAssistant.prototype.activate = function(event){}

AlbumsAssistant.prototype.deactivate = function(event){}

AlbumsAssistant.prototype.cleanup = function(event)
{
	this.albums.each
    (
        function(aEl)
        {
            Mojo.Event.stopListening
            (
                this.controller.get("albumID_" + aEl.albumID),
                Mojo.Event.tap,
                this.showIndividualAlbum.bind(this,aEl.albumID)
            );
        }.bind(this)
    );
}

AlbumsAssistant.prototype.buildAlbums = function()
{
    try
	{
		this.controller.serviceRequest
		(
			"palm://com.palm.mediadb/image",
			{
				method : 'listalbums',
				onSuccess : this.processAlbumList.bind(this)
			}
		);
	}
	catch (err)
	{
		this.controller.error(err);
	}
}

AlbumsAssistant.prototype.processAlbumList = function(response)
{
    this.albums = response.albums;
    
    var lHlmlString ="";
    
    this.albums.each
    (
        function(aEl)
        {
            lHlmlString = 
            (
                lHlmlString +
                "<div id='albumID_" +
                aEl.albumID +
                "' "+
                "class='album'>" +
                "<div class='albumName'>" +
                aEl.albumName +
                "</div>" +
                "<div id='thumbImages_"+
                aEl.albumID +
                "' class='albumThumbs'>"+
                "</div>" +
                "<div id='aID"+
                aEl.albumID +
                "_count' class='albumImagesCount'>" +
                "</div>"+
                "</div>"
            );
        }
    );
    
    //Update the HTML code in the scene
    this.controller.get("albums").update(lHlmlString);
    
    //Add events for new HTML div elements
    this.albums.each
    (
        function(aEl)
        {
            Mojo.Event.listen
            (
                this.controller.get("albumID_" + aEl.albumID),
                Mojo.Event.tap,
                this.showIndividualAlbum.bind(this,aEl)
            );
        }.bind(this)
    );
    
    this.waitingQueue.addTask
    (
    	this.isReadyChecking.bind(this)
    );
    this.waitingQueue.addTask(this.processingAlbumsGUI.bind(this));
    this.waitingQueue.runTasks();
}

AlbumsAssistant.prototype.isReadyChecking = function()
{
	var tryAgain = function()
	{
		this.isReadyChecking();
	};
	
	if (!DB.isLoaded)
	{
		if (this.totalWaitTime<2500)
		{
			setTimeout(tryAgain.bind(this),10);
			this.totalWaitTime = this.totalWaitTime + 10;
		}
		else
		{
			this.totalWaitTime = 0;
			DB = new createDB();
			setTimeout(tryAgain.bind(this),10);
		}
	}
	else
	{
		this.waitingQueue.taskDone = true;
	}
}

AlbumsAssistant.prototype.processingAlbumsGUI = function()
{
	var generateAlbumsGUI = function(aAlbum)
	{
		var lAlbum			= aAlbum;
		var lAlbumIndex		= getAlbumIndex(DB.myGalleryDB.albums,lAlbum.albumID);
		var lThumbImages	= DB.myGalleryDB.albums[lAlbumIndex].thumbImages;
		
		var lAlbumElementID	= "albumID_" + lAlbum.albumID;
		var lAlbumElement	= this.controller.get(lAlbumElementID);
		
		
		//Create the total images count
		var lCountStr	= "aID" + lAlbum.albumID + "_count";
		this.controller.get(lCountStr).update(lAlbum.albumCount);
		
		//Create HTML for thumbImages
		var lThumbStr	= "thumbImages_" + lAlbum.albumID;
		var lThumbHTML	= "";
		
		//update the class for the album
		lAlbumElement.className = "album " + DB.myGalleryDB.currentStyleName;
		
		var lBGAlbumsElement = this.controller.get("background");
		if (DB.myGalleryDB.currentStyleName == 'positivefilm')
		{
			lBGAlbumsElement.src = "images/greyBG.png";
		}
		else
		{
			lBGAlbumsElement.src = "images/blackBG.png";
		}
		
		for(var i=0; i < lThumbImages.length; ++i)
	    {
	        var thumbpath = this.extractfsPath + encodeURIComponent(lThumbImages[i].imagePictureUrl) + this.extractfsParams;
	        lThumbHTML = lThumbHTML + "<div id='image_" + lThumbImages.imageID +"' class='thumb_item'><img src='" + thumbpath + "'></img></div>";
	    }		
		this.controller.get(lThumbStr).update(lThumbHTML);
	}.bind(this);
	
	for (var i=0; i<this.albums.length;++i)
	{
		generateAlbumsGUI(this.albums[i]);
	}
	this.waitingQueue.taskDone = true;
}

AlbumsAssistant.prototype.showIndividualAlbum = function(aAlbum)
{
    this.controller.stageController.pushScene("images", aAlbum.albumID, aAlbum.albumName);
}

AlbumsAssistant.prototype.loadFail = function(msg)
{
    //FIXME hander onFail 
}