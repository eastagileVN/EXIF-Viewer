/* Developed by East Agile Limited, http://eastagile.com, October 2009 */

function ShowinfoAssistant(aImage)
{
    this.image = aImage;
}

ShowinfoAssistant.prototype.setup = function()
{
    this.controller.get("imageinfoheader").update(this.image.imageName);
    this.loadImageInfo();
}

ShowinfoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ShowinfoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ShowinfoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}


ShowinfoAssistant.prototype.loadImageInfo = function(event)
{
    var request = new Ajax.Request
    (
        this.image.imagePath,
        {
            method: 'get',
            onCreate: this.createRequest.bind(this),
            onSuccess: this.gotImage.bind(this)
        }
    );
}

ShowinfoAssistant.prototype.createRequest = function(resp)
{
    resp.transport.overrideMimeType('text/plain; charset=x-user-defined');
}

ShowinfoAssistant.prototype.gotImage = function(transport)
{
    var binary_file = new BinaryFile(transport.responseText, 0, 0);
	var str = "";
    var oEXIF = findEXIFinJPEG(binary_file);
    
    if (!oEXIF)
    {
        str = "No Information";
    }
    else
    {
        if (oEXIF["ExposureTime"] != null)
        {
            /*
        	var t = parseFloat(oEXIF["ExposureTime"]);
            t = 1/t;
            oEXIF["ExposureTime"] = "1/" + t.toString() + " sec";
        	*/
        	oEXIF["ExposureTime"] = "n/a"
        }
        
        if ((oEXIF["XResolution"] != null) && (oEXIF["YResolution"]))
        {
            oEXIF["XResolution"] = oEXIF["XResolution"] + "dpi";
            oEXIF["YResolution"] = oEXIF["YResolution"] + "dpi";
        }
        
        
        if (oEXIF["GPSLatitude"] != null)
        {
            var lat = oEXIF["GPSLatitude"];
            var lng = oEXIF["GPSLatitude"];
            
            oEXIF["GPSLatitude"] = lat[0] + " deg " + lat[1] + "' " + lat[2] + '" ' + oEXIF["GPSLatitudeRef"];
            
            oEXIF["GPSLatitudeRef"] = null;
            
            oEXIF["GPSLongitude"] = lng[0] + " deg " + lng[1] + "' " + lng[2] + '" ' + oEXIF["GPSLongitudeRef"];
            
            oEXIF["GPSLongitudeRef"] = null;
        }
        
        for (var tag in oEXIF)
        {
            if (oEXIF[tag] != null)
            {
                str = str + "<div>" + tag + ": " + oEXIF[tag] + "</div>";
            }
        }
    }
    
    this.controller.get("show_exif_div").update(str);
}