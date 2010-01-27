/* Developed by East Agile Limited, http://eastagile.com, October 2009 */

function createDB()
{
	this.mediadb			= {};
	this.myGalleryDB		= {};
	this.isLoaded			= false;
	
	this.waitingQueue = new myWqueue();
	
	this.waitingQueue.addTask(this.getMediaAlbums.bind(this));
	this.waitingQueue.addTask(this.createDepotObj.bind(this));
	this.waitingQueue.addTask(this.synchonizeAlbumsDB.bind(this));
	this.waitingQueue.addTask(this.createThumbImages.bind(this));
	this.waitingQueue.runTasks();
}


createDB.prototype.createThumbImages = function()
{
	var lwaitingQueue		= new myWqueue();
	var lMyGalleryDBalbums	= this.myGalleryDB.albums;
	
	var addThumImages = function()
	{
		var lAlbumID	= arguments[0].albumID;
		var lAlbumIndex = getAlbumIndex(lMyGalleryDBalbums,lAlbumID);
		
		var serviceRequest = new Mojo.Service.Request
		(
			'palm://com.palm.mediadb/image',
			{
				method : 'listimages',
                parameters : { "albumID":  lAlbumID },
				onSuccess : function(response)
				{
                	lMyGalleryDBalbums[lAlbumIndex].thumbImages.push(response.images[0]);
                	lMyGalleryDBalbums[lAlbumIndex].thumbImages.push(response.images[1]);
                	lMyGalleryDBalbums[lAlbumIndex].thumbImages.push(response.images[2]);
                	lwaitingQueue.taskDone = true;
                }.bind(this),
                onFailure : function()
                {
					
                }.bind(this)
			}
		);
	};
	
	var doWhenLocalWaitingQueueComplete = function()
	{
		this.depot.add
		(
			"albums",
			this.myGalleryDB,
			function()
			{	
				this.isLoaded = true;
				this.waitingQueue.taskDone = true;
        	}.bind(this),
			function()
			{
			}.bind(this)
		);
	}.bind(this);
	
	var letWait = function()
	{
		var tryAgain = function()
		{
			letWait();
		}
		var isDone = lwaitingQueue.q.isEmpty();
		
		if (isDone)
		{
			doWhenLocalWaitingQueueComplete();
		}
		else
		{
			var lTimmer =  setTimeout(tryAgain.bind(this),10);
		}
	}.bind(this);
	
	//collection of myGalleryDB's element indexes which don't have the thumbImages object yet
	var lIndexes = [];
	for (var i=0;i<lMyGalleryDBalbums.length;i++)
	{
		if (typeof(lMyGalleryDBalbums[i].thumbImages) == "undefined")
		{
			lMyGalleryDBalbums[i].thumbImages = [];
			lIndexes.push(i);
		}
	}
	
	if (lIndexes.length !=0)
	{
		for (var counter=0;counter<lIndexes.length;counter++)
		{
			var lParamters = 
			{
				albumID : lMyGalleryDBalbums[lIndexes[counter]].albumID
			};
			lwaitingQueue.addTask
			(
				addThumImages.bind(this),
				lParamters
			);
		}
		lwaitingQueue.runTasks();
		letWait();
	}
	else
	{
		this.isLoaded = true;
		this.waitingQueue.taskDone = true;
	}
}

createDB.prototype.getMediaAlbums = function()
{
	try
	{
		var serviceRequest = new Mojo.Service.Request
		(
			'palm://com.palm.mediadb/image',
			{
				method : 'listalbums',
				onSuccess : function(aResponse)
				{
					this.mediadb.albums = aResponse.albums;
					this.waitingQueue.taskDone = true;
				}.bind(this),
				onFailure : function()
				{
				}.bind(this)
			}
		);
	}
	catch (aErrMsg)
	{
		this.test = aErrMsg;
	}
}

createDB.prototype.createDepotObj = function()
{
	var lOpts =
	{
		name			:"MyGallery",
		version			:1,
		estimatedSize	:25000,
		replace			:false	
	};
	
	var albumsProsessing = function(aTransPort)
	{
		var lTransPort = aTransPort;
		
		if (lTransPort == null)
		{
			this.mediadb.currentStyleName = "positivefilm";
			
			this.depot.add
			(
				"albums",
				this.mediadb.albums,
				function()
				{
					this.myGalleryDB = this.mediadb;
					this.waitingQueue.taskDone = true;
				}.bind(this),
				function()
				{
				}.bind(this)
			);
		}
		else
		{
			this.myGalleryDB = lTransPort;
			//this.depot.removeAll(function(){}.bind(this),function(){}.bind(this));
			this.waitingQueue.taskDone = true;
		}
	};
	var albumsDefaultCreate = function()
	{
		//FIXME implement the method to create default album
	};
	
	try
	{
		this.depot = new Mojo.Depot
		(
			lOpts,
			function()
			{
				this.depot.get("albums",albumsProsessing.bind(this),albumsDefaultCreate.bind(this));
			}.bind(this),
			function()
			{
				
			}.bind(this)
		);
	}
	catch (aErrMsg)
	{
		this.test = aErrMsg;
	}
}

createDB.prototype.synchonizeAlbumsDB = function()
{
	var lmediaDBalbums	= this.mediadb.albums;
	var lMyGalleryDBalbums	= this.myGalleryDB.albums;
	
	var updateAlbumsDB = function(aFirstCollection,aSecondCollection,aFn)
	{
		var lIndexes = [];
		
		for (var i=0; i<aFirstCollection.length;++i)
		{
			var lIndex = getAlbumIndex(aSecondCollection,aFirstCollection[i].albumID);
			if (lIndex == -1)
			{
				lIndexes.push(i);
			}
		}
		for (var count=0; count<lIndexes.length;++count)
		{
			aFn(lIndexes[count]);
		}
	}.bind(this);
	
	updateAlbumsDB
	(
		lMyGalleryDBalbums,
		lmediaDBalbums,	
		function(aIndex)
		{
			lMyGalleryDBalbums.splice(aIndex,1);	
		}.bind(this)
	);
	
	updateAlbumsDB
	(
		lmediaDBalbums,
		lMyGalleryDBalbums,	
		function(aIndex)
		{
			lMyGalleryDBalbums.push(lmediaDBalbums[aIndex]);
		}.bind(this)
	);
	this.waitingQueue.taskDone = true;	
}

createDB.prototype.createImagesSettings = function()
{
	
}

var DB = new createDB();