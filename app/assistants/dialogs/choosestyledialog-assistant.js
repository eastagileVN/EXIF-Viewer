function ChoosestyledialogAssistant(aSceneAssistant,aCallBackFunc)
{
	this.sceneAssistant = aSceneAssistant;
	this.callbackFunc = aCallBackFunc;
	this.controller = aSceneAssistant.controller;
	//this.controller.get("styleSelector").update("it ok");
}

ChoosestyledialogAssistant.prototype.setup = function(widget)
{
	this.widget = widget;
	this.selectorChanged = this.selectorChanged.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('styleSelector'), Mojo.Event.propertyChange, this.selectorChanged);
	Mojo.Event.listen(this.controller.get('exitsBtn'), Mojo.Event.tap, this.closeDialog.bind(this));
	
	//this.controller.get("styleSelector").update("it ok");
	
	//this.controller.get("tester").update("it ok");
	
	this.setupChoices();
	
	this.controller.setupWidget('exitsBtn', {}, {buttonLabel: 'Close'});
	this.controller.setupWidget
	(
		'styleSelector',
		{
			label: $L('Change'),
			choices: this.styles,
			modelProperty:'currentStyle'
		},
		this.selectorsModel
	);
	
}

ChoosestyledialogAssistant.prototype.closeDialog = function(event)
{
	this.widget.mojo.close();
}

ChoosestyledialogAssistant.prototype.selectorChanged = function(event)
{
	//this.controller.get("tester").update("it ok");
	//this.widget.mojo.close();
	
	DB.myGalleryDB.currentStyleName = this.selectorsModel.currentStyle;
	
	DB.depot.add
	(
		"albums",
		DB.myGalleryDB,
		function()
		{	
			this.callbackFunc();
			this.widget.mojo.close();
			//this.waitingQueue.taskDone = true;
    	}.bind(this),
		function()
		{
		}.bind(this)
	);
}

ChoosestyledialogAssistant.prototype.setupChoices = function()
{
	
	//this.controller.get("styleSelector").update("it ok alibaba");

	this.selectorsModel =
	{
		currentStyle: DB.myGalleryDB.currentStyleName
	};
	
	this.styles =
	[
	 	{label:$L('Positive Film'), value:"positivefilm",secondaryIcon:''},
	 	{label:$L('Negative Film'), value:"negativefilm",secondaryIcon:''}
	];
}

ChoosestyledialogAssistant.prototype.activate = function(event)
{
}


ChoosestyledialogAssistant.prototype.deactivate = function(event)
{
}

ChoosestyledialogAssistant.prototype.cleanup = function(event)
{
}
