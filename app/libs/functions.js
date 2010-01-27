/* Developed by East Agile Limited, http://eastagile.com, October 2009 */

function getAlbumIndex (aInputArray,aAlbumID)
{
	var lReturnValue = -1;
	
	for (var i=0; i<aInputArray.length;i++)
	{
		if (aInputArray[i].albumID == aAlbumID)
		{
			lReturnValue = i;
		}
	}
	
	return lReturnValue;
}