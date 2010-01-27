/* Developed by East Agile Limited, http://eastagile.com, October 2009 */

/*
 * This is a queue for javascript
 */

function Queue ()
{
	var queue = [];
	var queueSpace = 0;
	
	//Return the size of the Queue
	this.getSize = function ()
	{
		return queue.length - queueSpace;
	};
	
	//Is the Queue empty or not
	this.isEmpty = function()
	{
		return (queue.length == 0);
	};
	
	//Add an element to the queue
	this.enqueue = function(element)
	{
		queue.push(element);
	};
	
	//Return (as take out) the first element in the Queue with FIFO order
	this.dequeue = function()
	{
		var element = undefined;
		if (queue.length)
		{
			element = queue[queueSpace];
			if (++queueSpace * 2 >= queue.length)
			{
				queue = queue.slice(queueSpace);
				queueSpace=0;
			}
		}
		return element;
	};
	
	//Return (as peek) the first element in the Queue 
	this.getOldestElement = function()
	{
		var element = undefined;
		if (queue.length) element = queue[queueSpace];
		return element;
	};
}


function myWqueue()
{
	this.q = new Queue();
	this.taskDone = false;
	
	this.addTask = function(aTask,aParametersArray)
	{
		var lTask =
		{
			fn : aTask,
			parameters: aParametersArray
		};
		this.q.enqueue(lTask);
	};
	
	this.wait = function()
	{
		var tryAgain = function()
		{
			this.wait();
		};
		
		if (this.taskDone == false)
		{
			var timmer = setTimeout(tryAgain.bind(this),10);
		}
		else
		{
			this.q.dequeue();
			this.taskDone = false;
			this.runTasks();
		}
	};
	
	this.runTasks = function()
	{
		if (this.q.getOldestElement())
		{
			var lCurrenTask = this.q.getOldestElement();
			lCurrenTask.fn(lCurrenTask.parameters);
			this.wait();
		}
		else
		{
			return;
		}
	}
}