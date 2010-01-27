function AboutdialogAssistant(aSceneAssistant,aCallBackFunc)
{
	this.sceneAssistant = aSceneAssistant;
	this.callbackFunc = aCallBackFunc;
	this.controller = aSceneAssistant.controller;
}

AboutdialogAssistant.prototype.setup = function(widget)
{
	this.widget = widget;
	Mojo.Event.listen(this.controller.get('exitsBtn'), Mojo.Event.tap, this.closeDialog.bind(this));
	this.controller.setupWidget('exitsBtn', {}, {buttonLabel: 'Close'});
}

AboutdialogAssistant.prototype.closeDialog = function(event)
{
	this.widget.mojo.close();
}

AboutdialogAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


AboutdialogAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

AboutdialogAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
