/* Developed by East Agile Limited, http://eastagile.com, October 2009 */

function ShowAssistant(aImage)
{
    this.image = aImage;
}

ShowAssistant.prototype.setup = function()
{
    this.controller.get("show_image_div").update("<img class='image_show' src='" + this.image.imagePath + "'></img>");
    
    this.controller.setupWidget('show_info_btn', {}, {buttonLabel: 'Show Pic Info'});
    Mojo.Event.listen(this.controller.get('show_info_btn'),Mojo.Event.tap, this.showPictureInformation.bind(this));
    Mojo.Event.listen(this.controller.get("show_image_div"), Mojo.Event.tap, this.toggleButtonsList.bind(this));
}

ShowAssistant.prototype.showPictureInformation = function()
{
    this.controller.stageController.pushScene("showinfo",this.image);

}

ShowAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ShowAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ShowAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    Mojo.Event.stopListening(this.controller.get('show_info_btn'),Mojo.Event.tap, this.showPictureInformation.bind(this));
    Mojo.Event.stopListening(this.controller.get("show_image_div"), Mojo.Event.tap, this.toggleButtonsList.bind(this));
}

ShowAssistant.prototype.toggleButtonsList = function()
{
    $("image_buttons_list").toggleClassName("hidden");
}