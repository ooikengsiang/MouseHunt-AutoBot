// ==UserScript==
// @name        MouseHunt AutoBot
// @author      Ooi Keng Siang
// @version    	2.04
// @namespace   http://ooiks.com/blog/mousehunt-autobot
// @description A simple user script to automate sounding the hunter horn in MouseHunt game / application in Facebook.
// @include		http://mousehuntgame.com/*
// @include		https://mousehuntgame.com/*
// @include		http://www.mousehuntgame.com/*
// @include		https://www.mousehuntgame.com/*
// @include		http://apps.facebook.com/mousehunt/*
// @include		https://apps.facebook.com/mousehunt/*
// @include		http://hi5.com/friend/games/MouseHunt*
// @include		http://mousehunt.hi5.hitgrab.com/*
// ==/UserScript==





// == Basic User Preference Setting (Begin) ==
// // The variable in this section contain basic option will normally edit by most user to suit their own preference
// // Reload MouseHunt page manually if edit this script while running it for immediate effect.

// // Extra delay time before sounding the horn. (in seconds)
// // Default: 5 - 180
var hornTimeDelayMin = 5;
var hornTimeDelayMax = 180;

// // Bot aggressively by ignore all safety measure such as check horn image visible before sounding it. (true/false)
// // Note: Highly recommanded to turn off because it increase the chances of getting caugh in botting.
// // Note: It will ignore the hornTimeDelayMin and hornTimeDelayMax.
// // Note: It may take a little bit extra of CPU processing power.
var aggressiveMode = false;

// // Enable trap check once an hour. (true/false)
var enableTrapCheck = false;

// // Trap check time different value (00 minutes - 45 minutes)
// // Note: Every player had different trap check time, set your trap check time here. It only take effect if enableTrapCheck = true;
// // Example: If you have XX:00 trap check time then set 00. If you have XX:45 trap check time, then set 45.
var trapCheckTimeDiff = 45;

// // Extra delay time to trap check. (in seconds)
// // Note: It only take effect if enableTrapCheck = true;
var checkTimeDelayMin = 15;
var checkTimeDelayMax = 120;

// // Play sound when encounter king's reward (true/false)
var isKingWarningSound = true;

// // Reload the the page according to kingPauseTimeMax when encount King Reward. (true/false)
// // Note: No matter how many time you refresh, the King's Reward won't go away unless you resolve it manually.
var reloadKingReward = false;

// // Duration of pausing the script before reload the King's Reward page (in seconds)
// // Note: It only take effect if reloadKingReward = true;
var kingPauseTimeMax = 18000;

// // The script will pause if player at different location that hunt location set before. (true/false)
// // Note: Make sure you set showTimerInPage to true in order to know what is happening.
var pauseAtInvalidLocation = false;

// == Basic User Preference Setting (End) ==





// == Advance User Preference Setting (Begin) ==
// // The variable in this section contain some advance option that will change the script behavior.
// // Edit this variable only if you know what you are doing 
// // Reload MouseHunt page manually if edit this script while running it for immediate effect.

// // Display timer and message in page title. (true/false)
var showTimerInTitle = true;

// // Embed a timer in page to show next hunter horn timer, highly recommanded to turn on. (true/false)
// // Note: You may not access some option like pause at invalid location if you turn this off.
var showTimerInPage = true;

// // Display the last time the page did a refresh or reload. (true/false)
var showLastPageLoadTime = true;

// // Default time to reload the page when bot encounter error. (in seconds)
var errorReloadTime = 60;

// // Time interval for script timer to update the time. May affact timer accuracy if set too high value. (in seconds)
var timerRefreshInterval = 1;

// == Advance User Preference Setting (End) ==





// WARNING - Do not modify the code below unless you know how to read and write the script.

// All global variable declaration and default value
var scriptVersion = "2.04";
var fbPlatform = false;
var hiFivePlatform = false;
var mhPlatform = false;
var mhMobilePlatform = false;
var secureConnection = false;
var lastDateRecorded = new Date();
var hornTime = 900;
var hornTimeDelay = 0;
var checkTimeDelay = 0;
var isKingReward = false;
var isKingRewardInformed = false;
var lastKingRewardSumTime;
var kingPauseTime;
var baitQuantity = -1;
var huntLocation;
var currentLocation;
var today = new Date();
var checkTime = (today.getMinutes() >= trapCheckTimeDiff) ? 3600 + (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds()) : (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds());
today = undefined;
var hornRetryMax = 10;
var hornRetry = 0;
var nextActiveTime = 900;
var timerInterval = 2;

// element in page
var titleElement;
var nextHornTimeElement;
var checkTimeElement;
var kingTimeElement;
var lastKingRewardSumTimeElement;
var optionElement;
var travelElement;

// start executing script
exeScript();

function exeScript()
{
	// check the trap check setting first
	if (trapCheckTimeDiff == 60)
	{
		trapCheckTimeDiff = 00;
	}
	else if (trapCheckTimeDiff < 0 || trapCheckTimeDiff > 60)
	{
		// invalid value, just disable the trap check
		enableTrapCheck = false;
	}
	
	if (showTimerInTitle)
	{
		// check if they are running in iFrame
		if (window.location.href.indexOf("apps.facebook.com/mousehunt/") != -1)
		{
			var contentElement = document.getElementById('pagelet_canvas_content');
			if (contentElement)
			{
				var breakFrameDivElement = document.createElement('div');
				breakFrameDivElement.setAttribute('id', 'breakFrameDivElement');
				breakFrameDivElement.innerHTML = "Timer in title no longer can show in Facebook, if you need it, then you must run in <a href='http://www.mousehuntgame.com/'> MouseHunt official website instead</a>";
				contentElement.parentNode.insertBefore(breakFrameDivElement, contentElement);
			}
			contentElement = undefined;
		}
		else if (window.location.href.indexOf("hi5.com/friend/games/MouseHunt") != -1)
		{
			var contentElement = document.getElementById('apps-canvas-body');
			if (contentElement)
			{
				var breakFrameDivElement = document.createElement('div');
				breakFrameDivElement.setAttribute('id', 'breakFrameDivElement');
				breakFrameDivElement.innerHTML = "Timer in title no longer can show in Facebook, if you need it, then you must run in <a href='http://www.mousehuntgame.com/'> MouseHunt official website instead</a>";
				contentElement.parentNode.insertBefore(breakFrameDivElement, contentElement);
			}
			contentElement = undefined;
		}
	}
	
	// check user running this script from where
	if (window.location.href.indexOf("mousehuntgame.com/canvas/") != -1)
	{
		// from facebook
		fbPlatform = true;
	}
	else if (window.location.href.indexOf("mousehuntgame.com") != -1)
	{
		// need to check if it is running in mobile version
		var version = getCookie("switch_to");
		if (version != null && version == "mobile")
		{
			// from mousehunt game mobile version
			mhMobilePlatform = true;
		}
		else
		{
		// from mousehunt game standard version
			mhPlatform = true
		}
		version = undefined;
	}
	else if (window.location.href.indexOf("mousehunt.hi5.hitgrab.com") != -1)
	{
		// from hi5
		hiFivePlatform = true;
	}
	
	// check if user running in https secure connection
	if (window.location.href.indexOf("https://") != -1)
	{
		secureConnection = true;
	}
	else
	{
		secureConnection = false;
	}
	
	if (fbPlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// this is the page to execute the script
		if (!checkIntroContainer() && retrieveDataFirst())
		{
			// embed a place where timer show
			embedTimer(true);
			
			// embed script to horn button
			embedScript();
			
			// start script action
			action();
		}
		else
		{
			// fail to retrieve data, display error msg and reload the page
			document.title = "Fail to retrieve data from page. Reloading in " + timeformat(errorReloadTime);
			window.setTimeout(function () { reloadPage(false) }, errorReloadTime * 1000);
		}
	}
	else if (mhPlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// this is the page to execute the script
		if (!checkIntroContainer() && retrieveDataFirst())
		{
			// embed a place where timer show
			embedTimer(true);
				
			// embed script to horn button
			embedScript();
					
			// start script action
			action();
		}
		else
		{
			// fail to retrieve data, display error msg and reload the page
			document.title = "Fail to retrieve data from page. Reloading in " + timeformat(errorReloadTime);
			window.setTimeout(function () { reloadPage(false) }, errorReloadTime * 1000);
		}
	}
	else if (mhMobilePlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// embed a place where timer show
		embedTimer(false);
	}
	else if (hiFivePlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// this is the page to execute the script
		if (!checkIntroContainer() && retrieveDataFirst())
		{
			// embed a place where timer show
			embedTimer(true);
				
			// embed script to horn button
			embedScript();
					
			// start script action
			action();
		}
		else
		{
			// fail to retrieve data, display error msg and reload the page
			document.title = "Fail to retrieve data from page. Reloading in " + timeformat(errorReloadTime);
			window.setTimeout(function () { reloadPage(false) }, errorReloadTime * 1000);
		}
	}
}

function checkIntroContainer()
{
	var gotIntroContainerDiv = false;

	var introContainerDiv = document.getElementById('introContainer');
	if (introContainerDiv)
	{
		introContainerDiv = undefined;
		gotIntroContainerDiv = true;
	}
	else
	{
		gotIntroContainerDiv = false;
	}
	
	try
	{
		return (gotIntroContainerDiv);
	}
	finally
	{
		gotIntroContainerDiv = undefined;
	}
}

// Retrieve data from source code first when the page is first loaded.
// Variable data might not be available because the game might not fully loaded at this point.
function retrieveDataFirst()
{
	var gotHornTime = false;
	var gotPuzzle = false;
	var gotBaitQuantity = false;
	var retrieveSuccess = false;
	
	var scriptElementList = document.getElementsByTagName('script');
	if (scriptElementList)
	{
		var i;
		for (i = 0; i < scriptElementList.length; ++i)
		{
			var scriptString = scriptElementList[i].innerHTML;
			
			// get next horn time
			var hornTimeStartIndex = scriptString.indexOf("next_activeturn_seconds");
			if (hornTimeStartIndex >= 0)
			{
				var nextActiveTime = 900;
				hornTimeStartIndex += 25;
				var hornTimeEndIndex = scriptString.indexOf(",", hornTimeStartIndex);
				var hornTimerString = scriptString.substring(hornTimeStartIndex, hornTimeEndIndex);
				nextActiveTime = parseInt(hornTimerString);
				
				hornTimeDelay = hornTimeDelayMin + Math.round(Math.random() * (hornTimeDelayMax - hornTimeDelayMin));
				
				if (!aggressiveMode)
				{
					// calculation base on the js in Mousehunt
					var additionalDelayTime = Math.ceil(nextActiveTime * 0.1);
				
					// need to found out the mousehunt provided timer interval to determine the additional delay
					var timerIntervalStartIndex = scriptString.indexOf("next_activeturn_seconds");
					if (timerIntervalStartIndex >= 0)
					{
						timerIntervalStartIndex += 21;
						var timerIntervalEndIndex = scriptString.indexOf(";", timerIntervalStartIndex);
						var timerIntervalString = scriptString.substring(timerIntervalStartIndex, timerIntervalEndIndex);
						var timerInterval = parseInt(timerIntervalString);
						
						// calculation base on the js in Mousehunt
						if (timerInterval == 1)
						{
							additionalDelayTime = 2;
						}
						
						timerIntervalStartIndex = undefined;
						timerIntervalEndIndex = undefined;
						timerIntervalString = undefined;
						timerInterval = undefined;
					}
					
					// safety mode, include extra delay like time in horn image appear
					//hornTime = nextActiveTime + additionalDelayTime + hornTimeDelay;
					hornTime = nextActiveTime + hornTimeDelay;
					lastDateRecorded = undefined;
					lastDateRecorded = new Date();
					
					additionalDelayTime = undefined;
				}
				else
				{
					// aggressive mode, no extra delay like time in horn image appear
					hornTime = nextActiveTime;
					lastDateRecorded = undefined;
					lastDateRecorded = new Date();
				}
				
				gotHornTime = true;
				
				hornTimeStartIndex = undefined;
				hornTimeEndIndex = undefined;
				hornTimerString = undefined;
				nextActiveTime = undefined;
			}
			
			// get is king's reward or not
			var hasPuzzleStartIndex = scriptString.indexOf("has_puzzle");
			if (hasPuzzleStartIndex >= 0)
			{
				hasPuzzleStartIndex += 12;
				var hasPuzzleEndIndex = scriptString.indexOf(",", hasPuzzleStartIndex);
				var hasPuzzleString = scriptString.substring(hasPuzzleStartIndex, hasPuzzleEndIndex);
				isKingReward = (hasPuzzleString == 'false') ? false : true;
				
				gotPuzzle = true;
				
				hasPuzzleStartIndex = undefined;
				hasPuzzleEndIndex = undefined;
				hasPuzzleString = undefined;
			}
			
			// get cheese quantity
			var baitQuantityStartIndex = scriptString.indexOf("bait_quantity");
			if (baitQuantityStartIndex >= 0)
			{
				baitQuantityStartIndex += 15;
				var baitQuantityEndIndex = scriptString.indexOf(",", baitQuantityStartIndex);
				var baitQuantityString = scriptString.substring(baitQuantityStartIndex, baitQuantityEndIndex);
				baitQuantity = parseInt(baitQuantityString);
				
				gotBaitQuantity = true;
				
				baitQuantityStartIndex = undefined;
				baitQuantityEndIndex = undefined;
				baitQuantityString = undefined;
			}
			
			var locationStartIndex;
			var locationEndIndex;
			locationStartIndex = scriptString.indexOf("location\":\"");
			if (locationStartIndex >= 0)
			{
				locationStartIndex += 11;
				locationEndIndex = scriptString.indexOf("\"", locationStartIndex);
				var locationString = scriptString.substring(locationStartIndex, locationEndIndex);
				currentLocation = locationString;
				
				locationStartIndex = undefined;
				locationEndIndex = undefined;
				locationString = undefined;
			}
			
			scriptString = undefined;
		}
		i = undefined;
	}
	scriptElementList = undefined;
	
	if (gotHornTime && gotPuzzle && gotBaitQuantity)
	{
		// get trap check time
		if (enableTrapCheck)
		{
			var today = new Date();
			checkTimeDelay = checkTimeDelayMin + Math.round(Math.random() * (checkTimeDelayMax - checkTimeDelayMin));
			checkTime = (today.getMinutes() >= trapCheckTimeDiff) ? 3600 + (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds()) : (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds());
			checkTime += checkTimeDelay;
			today = undefined;
		}
		
		// get last location
		var huntLocationCookie = getStorage("huntLocation");
		if (huntLocationCookie == undefined || huntLocationCookie == null)
		{
			huntLocation = currentLocation;
			setStorage("huntLocation", currentLocation);
		}
		else
		{
			huntLocation = huntLocationCookie;
			setStorage("huntLocation", huntLocation);
		}
		huntLocationCookie = undefined;
		
		// get last king reward time
		var lastKingRewardDate = getStorage("lastKingRewardDate");
		if (lastKingRewardDate == undefined || lastKingRewardDate == null)
		{
			lastKingRewardSumTime = -1;
		}
		else
		{
			var lastDate = new Date(lastKingRewardDate);
			lastKingRewardSumTime = parseInt((new Date() - lastDate) / 1000);
			lastDate = undefined;
		}
		lastKingRewardDate = undefined;
		
		retrieveSuccess = true;
	}
	else
	{
		retrieveSuccess = false;
	}
	
	// clean up
	gotHornTime = undefined;
	gotPuzzle = undefined;
	gotBaitQuantity = undefined;
	
	try
	{
		return (retrieveSuccess);
	}
	finally
	{
		retrieveSuccess = undefined;
	}
}

// Retrieve data from variable set by MouseHunt game for the most accurate reading.
function retrieveData()
{
	var browser = browserDetection();
	
	// get next horn time
	if (browser == "firefox")
	{
		nextActiveTime = unsafeWindow.user.next_activeturn_seconds;
		isKingReward = unsafeWindow.user.has_puzzle;
		baitQuantity = unsafeWindow.user.bait_quantity;
		currentLocation = unsafeWindow.user.location;
	}
	else if (browser == "opera")
	{
		nextActiveTime = user.next_activeturn_seconds;
		isKingReward = user.has_puzzle;
		baitQuantity = user.bait_quantity;
		currentLocation = user.location;
	}
	else if (browser == "chrome")
	{
		nextActiveTime = parseInt(getPageVariableForChrome("user.next_activeturn_seconds"));
		isKingReward = (getPageVariableForChrome("user.has_puzzle").toString() == "false") ? false : true;
		baitQuantity = parseInt(getPageVariableForChrome("user.bait_quantity"));
		currentLocation = getPageVariableForChrome("user.location");
	}
	else
	{
		window.setTimeout(function () { reloadWithMessage("Browser not supported. Reloading...", false); }, 60000);
	}
	
	browser = undefined;
	
	if (nextActiveTime == "" || isNaN(nextActiveTime))
	{
		// fail to retrieve data, might be due to slow network
		
		// reload the page to see it fix the problem
		window.setTimeout(function () { reloadWithMessage("Fail to retrieve data. Reloading...", false); }, 5000);
	}
	else
	{
		// got the timer right!
	
		// calculate the delay
		hornTimeDelay = hornTimeDelayMin + Math.round(Math.random() * (hornTimeDelayMax - hornTimeDelayMin));
	
		if (!aggressiveMode)
		{
			// calculation base on the js in Mousehunt
			var additionalDelayTime = Math.ceil(nextActiveTime * 0.1);
			if (timerInterval != "" && !isNaN(timerInterval) && timerInterval == 1)
			{
				additionalDelayTime = 2;
			}
			
			// safety mode, include extra delay like time in horn image appear
			//hornTime = nextActiveTime + additionalDelayTime + hornTimeDelay;
			hornTime = nextActiveTime + hornTimeDelay;
			lastDateRecorded = undefined;
			lastDateRecorded = new Date();
			
			additionalDelayTime = undefined;
		}
		else
		{
			// aggressive mode, no extra delay like time in horn image appear
			hornTime = nextActiveTime;
			lastDateRecorded = undefined;
			lastDateRecorded = new Date();
		}
	}
	
	// get trap check time
	if (enableTrapCheck)
	{
		var today = new Date();
		checkTimeDelay = checkTimeDelayMin + Math.round(Math.random() * (checkTimeDelayMax - checkTimeDelayMin));
		checkTime = (today.getMinutes() >= trapCheckTimeDiff) ? 3600 + (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds()) : (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds());
		checkTime += checkTimeDelay;
		today = undefined;
	}
}

function getPageVariable(name, value)
{
	if (name == "user.next_activeturn_seconds")
	{
		nextActiveTime = parseInt(value);
	}
	else if (name == "hud.timer_interval")
	{
		timerInterval = parseInt(value);
	}
	else if (name == "user.has_puzzle")
	{
		isKingReward = (value.toString() == true) ? true : false;
	}
	else if (name == "user.bait_quantity")
	{
		baitQuantity = parseInt(value);
	}
	else if (name == "user.location")
	{
		currentLocation = value.toString();
	}
	
	name = undefined;
	value = undefined;
}

function checkJournalDate()
{
	var reload = false;

	var journalDateDiv = document.getElementsByClassName('journaldate');
	if (journalDateDiv)
	{
		var journalDateStr = journalDateDiv[0].innerHTML.toString();
		var midIndex = journalDateStr.indexOf(":", 0);
		var spaceIndex = journalDateStr.indexOf(" ", midIndex);
		
		if (midIndex >= 1)
		{
			var hrStr = journalDateStr.substring(0, midIndex);
			var minStr = journalDateStr.substring(midIndex + 1, 2);
			var hourSysStr = journalDateStr.substring(spaceIndex + 1, 2);
			
			var nowDate = new Date();
			var lastHuntDate = new Date();
			if (hourSysStr == "am")
			{
				lastHuntDate.setHours(parseInt(hrStr), parseInt(minStr), 0, 0);
			}
			else
			{
				lastHuntDate.setHours(parseInt(hrStr) + 12, parseInt(minStr), 0, 0);
			}
			if (parseInt(nowDate - lastHuntDate) / 1000 > 900)
			{
				reload = true;
			}
			hrStr = undefined;
			minStr = undefined;
			nowDate = undefined;
			lastHuntDate = undefined;
		}
		else
		{
			reload = true;
		}
		
		journalDateStr = undefined;
		midIndex = undefined;
		spaceIndex = undefined;
	}
	journalDateDiv = undefined;
	
	if (reload)
	{
		reloadWithMessage("Timer error. Try reload to fix.", true);
	}
	
	try
	{
		return (reload);
	}
	finally
	{
		reload = undefined;
	}
}

function action()
{
	if (isKingReward)
	{
		kingRewardAction();
	}
	else if (pauseAtInvalidLocation && (huntLocation != currentLocation))
	{
		// update timer
		displayTimer("Out of pre-defined hunting location...", "Out of pre-defined hunting location...", "Out of pre-defined hunting location...");
		
		if (fbPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (hiFivePlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (mhPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		
		displayKingRewardSumTime(null);
		
		// pause script
	}
	else if (baitQuantity == 0)
	{
		// update timer
		displayTimer("No more cheese!", "Cannot hunt without the cheese...", "Cannot hunt without the cheese...");
		displayLocation(huntLocation);
		displayKingRewardSumTime(null);
		
		// pause the script
	}
	else
	{
		// update location
		displayLocation(huntLocation);
	
		var isHornSounding = false;
	
		// check if the horn image is visible
		var headerElement;
		headerElement = document.getElementById('header');
		if (headerElement)
		{
			var headerStatus = headerElement.getAttribute('class');
			if (headerStatus.indexOf("hornready") != -1)
			{
				// if the horn image is visible, why do we need to wait any more, sound the horn!
				soundHorn();
				
				// make sure the timer don't run twice!
				isHornSounding = true;
			}
			headerStatus = undefined;
		}
		headerElement = undefined;
	
		if (isHornSounding == false)
		{
			// start timer
			window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
		}
		
		isHornSounding = undefined;
	}
}

function countdownTimer()
{
	if (isKingReward)
	{
		// update timer
		displayTimer("King's Reward!", "King's Reward!", "King's Reward");
		displayKingRewardSumTime("Now");
		
		// record last king's reward time
		var nowDate = new Date();
		setStorage("lastKingRewardDate", nowDate.toString());
		nowDate = undefined;
		lastKingRewardSumTime = 0;
		
		// reload the page so that the sound can be play
		gotoCamp(true);

		// don't continue
		return;
	}

	// check if king reward is happening


	// check if player is in camp
	if (checkIsInCamp())
	{
		// player in camp
	}
	else
	{
		// player in camp
	}

	if (pauseAtInvalidLocation && (huntLocation != currentLocation))
	{
		// update timer
		displayTimer("Out of pre-defined hunting location...", "Out of pre-defined hunting location...", "Out of pre-defined hunting location...");
		if (fbPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (hiFivePlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (mhPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		displayKingRewardSumTime(null);
		
		// pause script
	}
	else if (baitQuantity == 0)
	{
		// update timer
		displayTimer("No more cheese!", "Cannot hunt without the cheese...", "Cannot hunt without the cheese...");
		displayLocation(huntLocation);
		displayKingRewardSumTime(null);
		
		// pause the script
	}
	else
	{
		var dateNow = new Date();
		var intervalTime = timeElapsed(lastDateRecorded, dateNow);
		lastDateRecorded = undefined;
		lastDateRecorded = dateNow;
		dateNow = undefined;
	
		if (enableTrapCheck)
		{
			// update time
			hornTime -= intervalTime;
			checkTime -= intervalTime;
			if (lastKingRewardSumTime != -1)
			{
				lastKingRewardSumTime += intervalTime;
			}
		}
		else
		{
			// update time
			hornTime -= intervalTime;
			if (lastKingRewardSumTime != -1)
			{
				lastKingRewardSumTime += intervalTime;
			}
		}
		
		intervalTime = undefined;
	
		if (hornTime <= 0)
		{
			// blow the horn!
			soundHorn();
		}
		else if (enableTrapCheck && checkTime <= 0)
		{
			// trap check!
			trapCheck();
		}
		else
		{
			if (enableTrapCheck)
			{
				// update timer
				if (!aggressiveMode)
				{
					displayTimer("Horn: " + timeformat(hornTime) + " | Check: " + timeformat(checkTime), 
						timeformat(hornTime) + "  <i>(included extra " + timeformat(hornTimeDelay) + " delay & +/- 5 seconds different from MouseHunt timer)</i>", 
						timeformat(checkTime) + "  <i>(included extra " + timeformat(checkTimeDelay) + " delay)</i>");
				}
				else
				{
					displayTimer("Horn: " + timeformat(hornTime) + " | Check: " + timeformat(checkTime), 
						timeformat(hornTime) + "  <i>(lot faster than MouseHunt timer)</i>", 
						timeformat(checkTime) + "  <i>(included extra " + timeformat(checkTimeDelay) + " delay)</i>");
				}
			}
			else
			{
				// update timer
				if (!aggressiveMode)
				{
					displayTimer("Horn: " + timeformat(hornTime), 
						timeformat(hornTime) + "  <i>(included extra " + timeformat(hornTimeDelay) + " delay & +/- 5 seconds different from MouseHunt timer)</i>", 
						"-");
					
					// check if user manaually sounded the horn
					var scriptNode = document.getElementById("scriptNode");
					if (scriptNode)
					{
						var isHornSounded = scriptNode.getAttribute("soundedHornAtt");
						if (isHornSounded == "true")
						{
							// sound horn function do the rest
							soundHorn();
							
							// stop loopping
							return;
						}
						isHornSounded = undefined;
					}		
					scriptNode = undefined;
				}
				else
				{
					displayTimer("Horn: " + timeformat(hornTime), 
						timeformat(hornTime) + "  <i>(lot faster than MouseHunt timer)</i>", 
						"-");
					
					// agressive mode should sound the horn whenever it is possible to do so.
					var headerElement = document.getElementById('header');
					if (headerElement)
					{
						// the horn image appear before the timer end
						if (headerElement.getAttribute('class').indexOf("hornready") != -1)
						{
							// who care, blow the horn first!
							soundHorn();
							
							headerElement = undefined;
							
							// skip all the code below
							return;
						}
					}
					headerElement = undefined;
				}
			}
			
			// set king reward sum time
			displayKingRewardSumTime(timeFormatLong(lastKingRewardSumTime));
			
			window.setTimeout(function () { (countdownTimer)() }, timerRefreshInterval * 1000);
		}
	}
}

function checkIsInCamp()
{
	var isInCamp = false;

	var containerNode = document.getElementById("mousehuntContainer");
	if (containerNode)
	{
		var containerClass = containerNode.getAttribute('class');
		isInCamp = containerClass.indexOf("PageCamp") == 0;
	}

	return isInCamp;
}

function gotoCamp(reloadIfFail)
{
	// simulate mouse click on the camp button
	var campElement = document.getElementsByClassName('camp  ')[0].firstChild;
	if (campElement)
	{
		fireEvent(campElement, 'click');
		campElement = null;
	}

	if (reloadIfFail)
	{
		// reload the page if click on the camp button fail
		window.setTimeout(function () { (confirmGotoCamp)() }, 5000);
	}
}

function confirmGotoCamp()
{
	if (!checkIsInCamp())
	{
		reloadWithMessage("Fail to click on camp button. Reloading...", false);
	}
}




function reloadPage(soundHorn)
{
	// reload the page
	if (fbPlatform)
	{
		// for Facebook only

		if (secureConnection)
		{
			if (soundHorn)
			{
				window.location.href = "https://www.mousehuntgame.com/canvas/turn.php";
			}
			else
			{
				window.location.href = "https://www.mousehuntgame.com/canvas/";
			}
		}
		else
		{
			if (soundHorn)
			{
				window.location.href = "http://www.mousehuntgame.com/canvas/turn.php";
			}
			else
			{
				window.location.href = "http://www.mousehuntgame.com/canvas/";
			}
		}
	}
	else if (hiFivePlatform)
	{
		// for Hi5 only
	
		if (secureConnection)
		{
			if (soundHorn)
			{
				window.location.href = "https://mousehunt.hi5.hitgrab.com/turn.php";
			}
			else
			{
				window.location.href = "https://mousehunt.hi5.hitgrab.com/";
			}
		}
		else
		{
			if (soundHorn)
			{
				window.location.href = "http://mousehunt.hi5.hitgrab.com/turn.php";
			}
			else
			{
				window.location.href = "http://mousehunt.hi5.hitgrab.com/";
			}
		}
	}
	else if (mhPlatform)
	{
		// for mousehunt game only
		
		if (secureConnection)
		{
			if (soundHorn)
			{
				window.location.href = "https://mousehuntgame.com/turn.php";
			}
			else
			{
				window.location.href = "https://mousehuntgame.com/";
			}
		}
		else
		{
			if (soundHorn)
			{
				window.location.href = "http://mousehuntgame.com/turn.php";
			}
			else
			{
				window.location.href = "http://mousehuntgame.com/";
			}
		}
	}
	
	soundHorn = undefined;
}

function reloadWithMessage(msg, soundHorn)
{
	// display the message
	displayTimer(msg, msg, msg, msg);
	
	// reload the page
	reloadPage(soundHorn);
	
	msg = undefined;
	soundHorn = undefined;
}

// ################################################################################################
//   Timer Function - Start
// ################################################################################################

function embedTimer(targetPage)
{
	if (showTimerInPage)
	{
		var headerElement;
		if (fbPlatform || hiFivePlatform || mhPlatform)
		{
			headerElement = document.getElementById('noscript');
		}
		else if (mhMobilePlatform)
		{
			headerElement = document.getElementById('mobileHorn');
		}
		
		if (headerElement)
		{
			var timerDivElement = document.createElement('div');
			
			var hr1Element = document.createElement('hr');
			timerDivElement.appendChild(hr1Element);
			hr1Element = null;
			
			// show bot title and version
			var titleElement = document.createElement('div');
			titleElement.setAttribute('id', 'titleElement');
			if (targetPage && aggressiveMode)
			{
				titleElement.innerHTML = "<a href=\"http://ooiks.com/blog/category/mousehunt-autobot\" target=\"_blank\"><b>MouseHunt AutoBot (version " + scriptVersion + ")</b></a> - <font color='red'>Aggressive Mode</font>";
			}
			else
			{
				titleElement.innerHTML = "<a href=\"http://ooiks.com/blog/category/mousehunt-autobot\" target=\"_blank\"><b>MouseHunt AutoBot (version " + scriptVersion + ")</b></a>";
			}
			timerDivElement.appendChild(titleElement);
			titleElement = null;
			
			if (targetPage)
			{
				nextHornTimeElement = document.createElement('div');
				nextHornTimeElement.setAttribute('id', 'nextHornTimeElement');
				nextHornTimeElement.innerHTML = "<b>Next Hunter Horn Time:</b> Loading...";
				timerDivElement.appendChild(nextHornTimeElement);
				
				checkTimeElement = document.createElement('div');
				checkTimeElement.setAttribute('id', 'checkTimeElement');
				checkTimeElement.innerHTML = "<b>Next Trap Check Time:</b> Loading...";
				timerDivElement.appendChild(checkTimeElement);
				
				if (pauseAtInvalidLocation)
				{
					// location information only display when enable this feature
					travelElement = document.createElement('div');
					travelElement.setAttribute('id', 'travelElement');
					travelElement.innerHTML = "<b>Target Hunt Location:</b> Loading...";
					timerDivElement.appendChild(travelElement);
				}
				
				var lastKingRewardDate = getStorage("lastKingRewardDate");
				var lastDateStr;
				if (lastKingRewardDate == undefined || lastKingRewardDate == null)
				{
					lastDateStr = "-";
				}
				else
				{
					var lastDate = new Date(lastKingRewardDate);
					lastDateStr = lastDate.toDateString() + " " + lastDate.toTimeString().substring(0, 8);
					lastDate = null;
				}
				
				kingTimeElement = document.createElement('div');
				kingTimeElement.setAttribute('id', 'kingTimeElement');
				kingTimeElement.innerHTML = "<b>Last King's Reward:</b> " + lastDateStr + " ";
				timerDivElement.appendChild(kingTimeElement);
				
				lastKingRewardSumTimeElement = document.createElement('font');
				lastKingRewardSumTimeElement.setAttribute('id', 'lastKingRewardSumTimeElement');
				lastKingRewardSumTimeElement.innerHTML = "(Loading...)";
				kingTimeElement.appendChild(lastKingRewardSumTimeElement);
				
				lastKingRewardDate = null;
				lastDateStr = null;
				
				if (showLastPageLoadTime)
				{
					var nowDate = new Date();
				
					// last page load time
					var loadTimeElement = document.createElement('div');
					loadTimeElement.setAttribute('id', 'loadTimeElement');
					loadTimeElement.innerHTML = "<b>Last Page Load: </b>" + nowDate.toDateString() + " " + nowDate.toTimeString().substring(0, 8);
					timerDivElement.appendChild(loadTimeElement);
					
					loadTimeElement = null;
					nowDate = null;
				}
			}
			else
			{
				// player currently navigating other page instead of hunter camp
				var helpTextElement = document.createElement('div');
				helpTextElement.setAttribute('id', 'helpTextElement');
				if (fbPlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='https://www.mousehuntgame.com/canvas/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='http://www.mousehuntgame.com/canvas/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
				}
				else if (hiFivePlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='https://mousehunt.hi5.hitgrab.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='http://mousehunt.hi5.hitgrab.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
				}
				else if (mhPlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='https://mousehuntgame.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='http://mousehuntgame.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
				}
				else if (mhMobilePlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> Mobile version of Mousehunt is not supported currently. Please use the <a href='https://www.mousehuntgame.com/?switch_to=standard'>standard version of MouseHunt</a>.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> Mobile version of Mousehunt is not supported currently. Please use the <a href='http://www.mousehuntgame.com/?switch_to=standard'>standard version of MouseHunt</a>.";
					}
				}
				timerDivElement.appendChild(helpTextElement);
				
				helpTextElement = null;
			}
			
			var showPreference = getStorage('showPreference');
			if (showPreference == undefined || showPreference == null)
			{
				showPreference = false;
				setStorage("showPreference", showPreference);
			}

			var buyDevCheeseLink = document.createElement('a');
			buyDevCheeseLink.setAttribute('id', 'buyDevCheeseLink');
			buyDevCheeseLink.setAttribute('href', 'http://ooiks.com/donate');
			buyDevCheeseLink.setAttribute('target', '_blank');
			buyDevCheeseLink.innerHTML = 'Buy some cheeses for developer';
			timerDivElement.appendChild(buyDevCheeseLink);
			buyDevCheeseLink = null;
			
			var showPreferenceLinkDiv = document.createElement('div');
			showPreferenceLinkDiv.setAttribute('id', 'showPreferenceLinkDiv');
			showPreferenceLinkDiv.setAttribute('style', 'text-align:right');
			timerDivElement.appendChild(showPreferenceLinkDiv);
			
			var showPreferenceSpan = document.createElement('span');
			var showPreferenceLinkStr = '<a id="showPreferenceLink" name="showPreferenceLink" onclick="if (document.getElementById(\'showPreferenceLink\').innerHTML == \'<b>[Hide Preference]</b>\') { document.getElementById(\'preferenceDiv\').style.display=\'none\';  document.getElementById(\'showPreferenceLink\').innerHTML=\'<b>[Show Preference]</b>\'; } else { document.getElementById(\'preferenceDiv\').style.display=\'block\'; document.getElementById(\'showPreferenceLink\').innerHTML=\'<b>[Hide Preference]</b>\'; }">';
			if (showPreference == true)
				showPreferenceLinkStr += '<b>[Hide Preference]</b>';
			else
				showPreferenceLinkStr += '<b>[Show Preference]</b>';
			showPreferenceLinkStr += '</a>';
			showPreferenceLinkStr += '&nbsp;&nbsp;&nbsp;';
			showPreferenceSpan.innerHTML = showPreferenceLinkStr;
			showPreferenceLinkDiv.appendChild(showPreferenceSpan);
			showPreferenceLinkStr = null;
			showPreferenceSpan = null;
			showPreferenceLinkDiv = null;
			
			var hr2Element = document.createElement('hr');
			timerDivElement.appendChild(hr2Element);
			hr2Element = null;
			
			var preferenceHTMLStr = '<table border="0" width="100%">';
			if (aggressiveMode)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Bot aggressively by ignore all safety measure such as check horn image visible before sounding it">';
				preferenceHTMLStr += '<b>Aggressive Mode</b>';
				preferenceHTMLStr += '</a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputTrue" name="AggressiveModeInput" value="true" onchange="if (document.getElementById(\'AggressiveModeInputTrue\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'disabled\';}" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputFalse" name="AggressiveModeInput" value="false" onchange="if (document.getElementById(\'AggressiveModeInputFalse\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'\';}"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time before sounding the horn (in seconds)">';
				preferenceHTMLStr += '<b>Horn Time Delay</b>';
				preferenceHTMLStr += '</a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMinInput" name="HornTimeDelayMinInput" disabled="disabled" value="' + hornTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMaxInput" name="HornTimeDelayMaxInput" disabled="disabled" value="' + hornTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Bot aggressively by ignore all safety measure such as check horn image visible before sounding it">';
				preferenceHTMLStr += '<b>Aggressive Mode</b>';
				preferenceHTMLStr += '</a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputTrue" name="AggressiveModeInput" value="true" onchange="if (document.getElementById(\'AggressiveModeInputTrue\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'disabled\';}"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputFalse" name="AggressiveModeInput" value="false" onchange="if (document.getElementById(\'AggressiveModeInputFalse\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'\';}" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time before sounding the horn (in seconds)">';
				preferenceHTMLStr += '<b>Horn Time Delay</b>';
				preferenceHTMLStr += '</a>&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMinInput" name="HornTimeDelayMinInput" value="' + hornTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMaxInput" name="HornTimeDelayMaxInput" value="' + hornTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (enableTrapCheck)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Enable trap check once an hour"><b>Trap Check</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputTrue" name="TrapCheckInput" value="true" onchange="if (document.getElementById(\'TrapCheckInputTrue\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'\';}" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputFalse" name="TrapCheckInput" value="false" onchange="if (document.getElementById(\'TrapCheckInputFalse\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'disabled\';}"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Trap check time different value (00 minutes / 15 minutes / 30 minutes / 45 minutes)"><b>Trap Check Time Offset</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeOffsetInput" name="TrapCheckTimeOffsetInput" value="' + trapCheckTimeDiff.toString() + '"/> minutes';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time to trap check (in seconds)"><b>Trap Check Time Delay</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMinInput" name="TrapCheckTimeDelayMinInput" value="' + checkTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMaxInput" name="TrapCheckTimeDelayMaxInput" value="' + checkTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Enable trap check once an hour"><b>Trap Check</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputTrue" name="TrapCheckInput" value="true" onchange="if (document.getElementById(\'TrapCheckInputTrue\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'\';}"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputFalse" name="TrapCheckInput" value="false" onchange="if (document.getElementById(\'TrapCheckInputFalse\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'disabled\';}" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Trap check time different value (00 minutes - 45 minutes)"><b>Trap Check Time Offset</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeOffsetInput" name="TrapCheckTimeOffsetInput" disabled="disabled" value="' + trapCheckTimeDiff.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time to trap check (in seconds)"><b>Trap Check Time Delay</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMinInput" name="TrapCheckTimeDelayMinInput" disabled="disabled" value="' + checkTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMaxInput" name="TrapCheckTimeDelayMaxInput" disabled="disabled" value="' + checkTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (isKingWarningSound)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Play sound when encounter king\'s reward"><b>Play King Reward Sound</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputTrue" name="PlayKingRewardSoundInput" value="true" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputFalse" name="PlayKingRewardSoundInput" value="false" /> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Play sound when encounter king\'s reward"><b>Play King Reward Sound</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputTrue" name="PlayKingRewardSoundInput" value="true" /> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputFalse" name="PlayKingRewardSoundInput" value="false" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (reloadKingReward)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Reload the the page according to King Reward Resume Time when encount King Reward"><b>King Reward Resume</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputTrue" name="KingRewardResumeInput" value="true" onchange="if (document.getElementById(\'KingRewardResumeInputTrue\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'\'; }" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputFalse" name="KingRewardResumeInput" value="false" onchange="if (document.getElementById(\'KingRewardResumeInputFalse\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'disabled\'; }"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Duration of pausing the script before reload the King\'s Reward page (in seconds)"><b>King Reward Resume Time</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="KingRewardResumeTimeInput" name="KingRewardResumeTimeInput" value="' + kingPauseTimeMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Reload the the page according to King Reward Resume Time when encounter King Reward"><b>King Reward Resume</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputTrue" name="KingRewardResumeInput" value="true" onchange="if (document.getElementById(\'KingRewardResumeInputTrue\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'\'; }"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputFalse" name="KingRewardResumeInput" value="false" onchange="if (document.getElementById(\'KingRewardResumeInputFalse\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'disabled\'; }" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Duration of pausing the script before reload the King\'s Reward page (in seconds)"><b>King Reward Resume Time</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="KingRewardResumeTimeInput" name="KingRewardResumeTimeInput" disabled="disabled" value="' + kingPauseTimeMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (pauseAtInvalidLocation)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="The script will pause if player at different location that hunt location set before"><b>Remember Location</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputTrue" name="PauseLocationInput" value="true" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputFalse" name="PauseLocationInput" value="false" /> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="The script will pause if player at different location that hunt location set before"><b>Remember Location</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputTrue" name="PauseLocationInput" value="true"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputFalse" name="PauseLocationInput" value="false" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			
			preferenceHTMLStr += '<tr>';
			preferenceHTMLStr += '<td style="height:24px; text-align:right;" colspan="2">';
			preferenceHTMLStr += '(Changes only take place after user save the preference) ';
			preferenceHTMLStr += '<input type="button" id="PreferenceSaveInput" value="Save" onclick="	\
				if (document.getElementById(\'AggressiveModeInputTrue\').checked == true) { window.localStorage.setItem(\'AggressiveMode\', \'true\'); } else { window.localStorage.setItem(\'AggressiveMode\', \'false\'); }	\
				window.localStorage.setItem(\'HornTimeDelayMin\', document.getElementById(\'HornTimeDelayMinInput\').value); window.localStorage.setItem(\'HornTimeDelayMax\', document.getElementById(\'HornTimeDelayMaxInput\').value);	\
				if (document.getElementById(\'TrapCheckInputTrue\').checked == true) { window.localStorage.setItem(\'TrapCheck\', \'true\'); } else { window.localStorage.setItem(\'TrapCheck\', \'false\'); }	\
				window.localStorage.setItem(\'TrapCheckTimeOffset\', document.getElementById(\'TrapCheckTimeOffsetInput\').value);	\
				window.localStorage.setItem(\'TrapCheckTimeDelayMin\', document.getElementById(\'TrapCheckTimeDelayMinInput\').value); window.localStorage.setItem(\'TrapCheckTimeDelayMax\', document.getElementById(\'TrapCheckTimeDelayMaxInput\').value);	\
				if (document.getElementById(\'PlayKingRewardSoundInputTrue\').checked == true) { window.localStorage.setItem(\'PlayKingRewardSound\', \'true\'); } else { window.localStorage.setItem(\'PlayKingRewardSound\', \'false\'); }	\
				if (document.getElementById(\'KingRewardResumeInputTrue\').checked == true) { window.localStorage.setItem(\'KingRewardResume\', \'true\'); } else { window.localStorage.setItem(\'KingRewardResume\', \'false\'); }	\
				window.localStorage.setItem(\'KingRewardResumeTime\', document.getElementById(\'KingRewardResumeTimeInput\').value);	\
				if (document.getElementById(\'PauseLocationInputTrue\').checked == true) { window.localStorage.setItem(\'PauseLocation\', \'true\'); } else { window.localStorage.setItem(\'PauseLocation\', \'false\'); }	\
				';
			if (fbPlatform)
			{
				if (secureConnection)
					preferenceHTMLStr += 'window.location.href=\'https://www.mousehuntgame.com/canvas/\';"/>';
				else
					preferenceHTMLStr += 'window.location.href=\'http://www.mousehuntgame.com/canvas/\';"/>';
			}
			else if (hiFivePlatform)
			{
				if (secureConnection)
					preferenceHTMLStr += 'window.location.href=\'https://mousehunt.hi5.hitgrab.com/\';"/>';
				else
					preferenceHTMLStr += 'window.location.href=\'http://mousehunt.hi5.hitgrab.com/\';"/>';
			}
			else if (mhPlatform)
			{
				if (secureConnection)
					preferenceHTMLStr += 'window.location.href=\'https://mousehuntgame.com/\';"/>';
				else
					preferenceHTMLStr += 'window.location.href=\'http://mousehuntgame.com/\';"/>';
			}
			preferenceHTMLStr += '&nbsp;&nbsp;&nbsp;</td>';
			preferenceHTMLStr += '</tr>';
			preferenceHTMLStr += '</table>';

			var preferenceDiv = document.createElement('div');
			preferenceDiv.setAttribute('id', 'preferenceDiv');
			if (showPreference == true)
				preferenceDiv.setAttribute('style', 'display: block');
			else
				preferenceDiv.setAttribute('style', 'display: none');
			preferenceDiv.innerHTML = preferenceHTMLStr;
			timerDivElement.appendChild(preferenceDiv);
			preferenceHTMLStr = null;
			showPreference = null;

			var hr3Element = document.createElement('hr');
			preferenceDiv.appendChild(hr3Element);
			hr3Element = null;
			preferenceDiv = null;
			
			// embed all msg to the page
			headerElement.parentNode.insertBefore(timerDivElement, headerElement);
			
			timerDivElement = null;
		}
		headerElement = null;
	}
	
	targetPage = null;
}

function loadPreferenceSettingFromStorage()
{
	var aggressiveModeTemp = getStorage("AggressiveMode");
	if (aggressiveModeTemp == undefined || aggressiveModeTemp == null)
	{
		setStorage("AggressiveMode", aggressiveMode.toString());
	}
	else if (aggressiveModeTemp == true || aggressiveModeTemp.toLowerCase() == "true")
	{
		aggressiveMode = true;
	}
	else
	{
		aggressiveMode = false;
	}
	aggressiveModeTemp = undefined;
	
	var hornTimeDelayMinTemp = getStorage("HornTimeDelayMin");
	var hornTimeDelayMaxTemp = getStorage("HornTimeDelayMax");
	if (hornTimeDelayMinTemp == undefined || hornTimeDelayMinTemp == null || hornTimeDelayMaxTemp == undefined || hornTimeDelayMaxTemp == null)
	{
		setStorage("HornTimeDelayMin", hornTimeDelayMin);
		setStorage("HornTimeDelayMax", hornTimeDelayMax);
	}
	else
	{
		hornTimeDelayMin = parseInt(hornTimeDelayMinTemp);
		hornTimeDelayMax = parseInt(hornTimeDelayMaxTemp);
	}
	hornTimeDelayMinTemp = undefined;
	hornTimeDelayMaxTemp = undefined;
	
	var trapCheckTemp = getStorage("TrapCheck");
	if (trapCheckTemp == undefined || trapCheckTemp == null)
	{
		setStorage("TrapCheck", enableTrapCheck.toString());
	}
	else if (trapCheckTemp == true || trapCheckTemp.toLowerCase() == "true")
	{
		enableTrapCheck = true;
	}
	else
	{
		enableTrapCheck = false;
	}
	trapCheckTemp = undefined;
	
	var trapCheckTimeOffsetTemp = getStorage("TrapCheckTimeOffset");
	if (trapCheckTimeOffsetTemp == undefined || trapCheckTimeOffsetTemp == null)
	{
		setStorage("TrapCheckTimeOffset", trapCheckTimeDiff);
	}
	else
	{
		trapCheckTimeDiff = parseInt(trapCheckTimeOffsetTemp);
	}
	trapCheckTimeOffsetTemp = undefined;
	
	var trapCheckTimeDelayMinTemp = getStorage("TrapCheckTimeDelayMin");
	var trapCheckTimeDelayMaxTemp = getStorage("TrapCheckTimeDelayMax");
	if (trapCheckTimeDelayMinTemp == undefined || trapCheckTimeDelayMinTemp == null || trapCheckTimeDelayMaxTemp == undefined || trapCheckTimeDelayMaxTemp == null)
	{
		setStorage("TrapCheckTimeDelayMin", checkTimeDelayMin);
		setStorage("TrapCheckTimeDelayMax", checkTimeDelayMax);
	}
	else
	{
		checkTimeDelayMin = parseInt(trapCheckTimeDelayMinTemp);
		checkTimeDelayMax = parseInt(trapCheckTimeDelayMaxTemp);
	}
	trapCheckTimeDelayMinTemp = undefined;
	trapCheckTimeDelayMaxTemp = undefined;
	
	var playKingRewardSoundTemp = getStorage("PlayKingRewardSound");
	if (playKingRewardSoundTemp == undefined || playKingRewardSoundTemp == null)
	{
		setStorage("PlayKingRewardSound", isKingWarningSound.toString());
	}
	else if (playKingRewardSoundTemp == true || playKingRewardSoundTemp.toLowerCase() == "true")
	{
		isKingWarningSound = true;
	}
	else
	{
		isKingWarningSound = false;
	}
	playKingRewardSoundTemp = undefined;
	
	var kingRewardResumeTemp = getStorage("KingRewardResume");
	if (kingRewardResumeTemp == undefined || kingRewardResumeTemp == null)
	{
		setStorage("KingRewardResume", reloadKingReward.toString());
	}
	else if (kingRewardResumeTemp == true || kingRewardResumeTemp.toLowerCase() == "true")
	{
		reloadKingReward = true;
	}
	else
	{
		reloadKingReward = false;
	}
	kingRewardResumeTemp = undefined;
	
	var kingRewardResumeTimeTemp = getStorage("KingRewardResumeTime");
	if (kingRewardResumeTimeTemp == undefined || kingRewardResumeTimeTemp == null)
	{
		setStorage("KingRewardResumeTime", kingPauseTimeMax);
	}
	else
	{
		kingPauseTimeMax = parseInt(kingRewardResumeTimeTemp);
	}
	kingRewardResumeTimeTemp = undefined;
	
	var pauseLocationTemp = getStorage("PauseLocation");
	if (pauseLocationTemp == undefined || pauseLocationTemp == null)
	{
		setStorage("PauseLocation", pauseAtInvalidLocation.toString());
	}
	else if (pauseLocationTemp == true || pauseLocationTemp.toLowerCase() == "true")
	{
		pauseAtInvalidLocation = true;
	}
	else
	{
		pauseAtInvalidLocation = false;
	}
	pauseLocationTemp = undefined;
}

function displayTimer(title, nextHornTime, checkTime)
{
	if (showTimerInTitle)
	{
		document.title = title;
	}
	
	if (showTimerInPage)
	{
		nextHornTimeElement.innerHTML = "<b>Next Hunter Horn Time:</b> " + nextHornTime;
		checkTimeElement.innerHTML = "<b>Next Trap Check Time:</b> " + checkTime;
	}
	
	title = null;
	nextHornTime = null;
	checkTime = null;
}

function displayLocation(locStr)
{
	if (showTimerInPage && pauseAtInvalidLocation)
	{
		travelElement.innerHTML = "<b>Hunt Location:</b> " + locStr;
	}
	
	locStr = null;
}

function displayKingRewardSumTime(timeStr)
{
	if (showTimerInPage)
	{
		if (timeStr)
		{
			lastKingRewardSumTimeElement.innerHTML = "(" + timeStr + ")";
		}
		else
		{
			lastKingRewardSumTimeElement.innerHTML = "";
		}
	}
	
	timeStr = null;
}

// ################################################################################################
//   Timer Function - End
// ################################################################################################



// ################################################################################################
//   Horn Function - Start
// ################################################################################################

function soundHorn()
{
	// update timer
	displayTimer("Ready to Blow The Horn...", "Ready to Blow The Horn...", "Ready to Blow The Horn...");
	
	var scriptNode = document.getElementById("scriptNode");
	if (scriptNode)
	{
		// reset the attribute that we use to keep track if user sounded the horn
		scriptNode.setAttribute("soundedHornAtt", "false");
	}		
	scriptNode = null;
	
	if (!aggressiveMode)
	{
		// safety mode, check the horn image is there or not before sound the horn
		var headerElement = document.getElementById('envHeaderImg');
		if (headerElement)
		{
			// need to make sure that the horn image is ready before we can click on it
			var headerStatus = headerElement.getAttribute('class');
			if (headerStatus.indexOf("hornReady") != -1)
			{
				// found the horn image, let's sound the horn!
				
				// update timer
				displayTimer("Blowing The Horn...", "Blowing The Horn...", "Blowing The Horn...");
				
				// simulate mouse click on the horn
				var hornElement = document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild;
				fireEvent(hornElement, 'click');
				hornElement = null;
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// double check if the horn was already sounded
				window.setTimeout(function () { afterSoundingHorn() }, 5000);
			}
			else if (headerStatus.indexOf("hornsounding") != -1 || headerStatus.indexOf("hornsounded") != -1)
			{
				// some one just sound the horn...
				
				// update timer
				displayTimer("Synchronizing Data...", "Someone had just sound the horn. Synchronizing data...", "Someone had just sound the horn. Synchronizing data...");
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// load the new data
				window.setTimeout(function () { afterSoundingHorn() }, 5000);
			}
			else if (headerStatus.indexOf("hornwaiting") != -1)
			{
				// the horn is not appearing, let check the time again
				
				// update timer
				displayTimer("Synchronizing Data...", "Hunter horn is not ready yet. Synchronizing data...", "Hunter horn is not ready yet. Synchronizing data...");
				
				// sync the time again, maybe user already click the horn
				retrieveData();
				
				checkJournalDate();
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// loop again
				window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
			}
			else
			{
				// some one steal the horn!
				
				// update timer
				displayTimer("Synchronizing Data...", "Hunter horn is missing. Synchronizing data...", "Hunter horn is missing. Synchronizing data...");
				
				// try to click on the horn
				var hornElement = document.getElementsByClassName('hornbutton')[0].firstChild;
				fireEvent(hornElement, 'click');
				hornElement = null;
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// double check if the horn was already sounded
				window.setTimeout(function () { afterSoundingHorn() }, 5000);
			}
		}
		else
		{
			// something wrong, can't even found the header...
			
			// clean up
			headerElement = null;
			
			// reload the page see if thing get fixed
			reloadWithMessage("Fail to find the horn header. Reloading...", false);
		}
		
	}
	else
	{
		// aggressive mode, ignore whatever horn image is there or not, just sound the horn!
		
		// simulate mouse click on the horn
		fireEvent(document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild, 'click');
		
		// double check if the horn was already sounded
		window.setTimeout(function () { afterSoundingHorn() }, 3000);
	}
}

function afterSoundingHorn()
{
	var scriptNode = document.getElementById("scriptNode");
	if (scriptNode)
	{
		// reset the attribute that we use to keep track if user sounded the horn
		scriptNode.setAttribute("soundedHornAtt", "false");
	}		
	scriptNode = null;

	var headerElement = document.getElementById('envHeaderImg');
	if (headerElement)
	{
		// double check if the horn image is still visible after the script already sound it
		var headerStatus = headerElement.getAttribute('class');
		if (headerStatus.indexOf("hornReady") != -1)
		{
			// seen like the horn is not functioning well
			
			// update timer
			displayTimer("Blowing The Horn Again...", "Blowing The Horn Again...", "Blowing The Horn Again...");
			
			// simulate mouse click on the horn again
			var hornElement = document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild;
			fireEvent(hornElement, 'click');
			hornElement = null;
			
			// clean up
			headerElement = null;
			headerStatus = null;
			
			// increase the horn retry counter and check if the script is caugh in loop
			++hornRetry;
			if (hornRetry > hornRetryMax)
			{
				// reload the page see if thing get fixed
				reloadWithMessage("Detected script caught in loop. Reloading...", true);
				
				// reset the horn retry counter
				hornRetry = 0;
			}
			else
			{
				// check again later
				window.setTimeout(function () { afterSoundingHorn() }, 1000);
			}
		}
		else if (headerStatus.indexOf("hornsounding") != -1)
		{
			// the horn is already sound, but the network seen to slow on fetching the data
			
			// update timer
			displayTimer("The horn sounding taken extra longer than normal...", "The horn sounding taken extra longer than normal...", "The horn sounding taken extra longer than normal...");
			
			// clean up
			headerElement = null;
			headerStatus = null;
			
			// increase the horn retry counter and check if the script is caugh in loop
			++hornRetry;
			if (hornRetry > hornRetryMax)
			{
				// reload the page see if thing get fixed
				reloadWithMessage("Detected script caught in loop. Reloading...", true);
				
				// reset the horn retry counter
				hornRetry = 0;
			}
			else
			{
				// check again later
				window.setTimeout(function () { afterSoundingHorn() }, 3000);
			}
		}
		else
		{
			// everything look ok
			
			// update timer
			displayTimer("Horn sounded. Synchronizing Data...", "Horn sounded. Synchronizing data...", "Horn sounded. Synchronizing data...");
			
			// reload data
			retrieveData();
			
			// clean up
			headerElement = null;
			headerStatus = null;
			
			// script continue as normal
			window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
			
			// reset the horn retry counter
			hornRetry = 0;
		}
	}
}

function embedScript()
{
    // create a javascript to detect if user click on the horn manually
    var scriptNode = document.createElement('script');
	scriptNode.setAttribute('id', 'scriptNode');
    scriptNode.setAttribute('type', 'text/javascript');
	scriptNode.setAttribute('soundedHornAtt', 'false');
    scriptNode.innerHTML = '														\
		function soundedHorn()														\
		{																			\
			var scriptNode = document.getElementById("scriptNode");					\
			if (scriptNode)															\
			{																		\
				scriptNode.setAttribute("soundedHornAtt", "true");					\
			}																		\
			scriptNode = null;														\
		}																			\
		';
	// find the head node and insert the script into it
	var headerElement;
	if (fbPlatform || hiFivePlatform || mhPlatform)
	{
		headerElement = document.getElementById('noscript');
	}
	else if (mhMobilePlatform)
	{
		headerElement = document.getElementById('mobileHorn');
	}
	headerElement.parentNode.insertBefore(scriptNode, headerElement);
	scriptNode = null;
	headerElement = null;
	
	// change the function call of horn
	var hornButtonLink = document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild;
	var oriStr = hornButtonLink.getAttribute('onclick').toString();
	var index = oriStr.indexOf('return false;');
	var modStr = oriStr.substring(0, index) + 'soundedHorn();' + oriStr.substring(index);
	hornButtonLink.setAttribute('onclick', modStr);
	
	hornButtonLink = null;
	oriStr = null;
	index = null;
	modStr = null;
}

// ################################################################################################
//   Horn Function - End
// ################################################################################################



// ################################################################################################
//   King's Reward Function - Start
// ################################################################################################

function isKingReward()
{
	
}

function kingRewardAction()
{
	// update timer
	displayTimer("King's Reward!", "King's Reward", "King's Reward!");
	displayLocation("-");
		
	// play music if needed
	playKingRewardSound();
		
	// focus on the answer input
	var inputElementList = document.getElementsByClassName('mousehuntPage-puzzle-form-code');
	if (inputElementList)
	{
		inputElementList[0].focus();
		inputElementList = null;
	}
	
	// record last king's reward time
	var nowDate = new Date();
	setStorage("lastKingRewardDate", nowDate.toString());
	nowDate = null;

	if (kingPauseTimeMax <= 0)
	{
		kingPauseTimeMax = 1;
	}
	
	kingPauseTime = kingPauseTimeMax;
	kingRewardCountdownTimer();
}

function playKingRewardSound()
{
	if (isKingWarningSound)
	{
		var browser = browserDetection();
		
		// music data file converted into base 64 string
		var AUDIO_DATA = 'data:audio/mp3;' + 'base64,' +
		'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BZhBiHCwABgXAEGpmf+ZmxFZhbgiGASAwgngYxhwJzEWDWLAD4sBQiO7BlM5GZAnFQSBMYEpzXp3ABhMYipCfAKgsYkdinOBH4xIWjBwnEg8zyajVqR3rcVnjBQeApHMhg0y+OTFhwrX3BiMhikopZfG6xEdTOgaMhmEweCg5ZmMhc4USk76ymxhh///WjoksH2/q61SSq53Hu8e//P/v+j8X4QDoOpRoAFhmosHq0G8qtjms////////Hu95UlSrbp7n/z+Zdy3vn/////////9jDfe/+8v5n/cMv///7o5Lf/+Z9X+zgYABgYLA4rGZTG4XAQiA36EoHOXm8eJRsvtHCVlzpjQNCSjNGnowMK8PNHLY1MSjFwnMRCfPR7O//viBBuAB+FeT+5zYAD4i9odzmwAIA2RQPnMgAv/MyirOYAAienjlzk1sMNnXqp6k0bovNaX0AQLvdeaYQGoioUEAUQGDhRfUwIDMCCd/hY2ZeemjpJoIua0jGdGSNyKSgUwrdn3D/8yoKM1Fy/b/jICYaIqmaSmKhJcJnWsP7n/gofMcGDFhIFDhi4WCgNS92quGVWMwzz/1+/56kHDddQBFRaiYbE37rRqNVccf////////+WYfnnnSUliN0/97////vH/////////+3Y/tSMSyH43L4cpLFsQiIKgrg0Jf/+HwQL/+deABQOF0sZjfNzuxwMhQa5BEXNwkkWExoGvGwUB/TJAkKGcZlLAADOHmmF4auKBhwLmEgvno+HTPRxwaCJJYYbN/Ozmmw0w6pmZFws7+HmXBwGWwAHAocAIEmiXJLO7/Cxsz1DNLSzQxk1xEM0LC5yCywz1F1s7eH78yQIMrDWnQIAQsxUXXc6K7VhYaf7WH97rwMTmRDBiggChgxUFQXaew7GVP9EWssN//////dVQNg6ARFRaiYbX4vWpqbfP/8f//////+KYfnXtxiMSyH7essv//1lvH//////////PGvbjEYlj/xuXyzDWqgSBrKiIKu//wfNf/KgABBAIBgQOGRm9BeBhgfqQBvNQmsTILJbBH80EaiguGIweYzAKnSagCQwKJJKAAUAFQQObkIhYAxie7uMEgMGpozjSC10AbMIvPUsPi0ZmkAAslIainw9bruvKOV6whMMUEygAgkBHL3gByGIQHLJBbwll0uCBCRgIEhr3HgYW48ck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qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//vgBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMYP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpBQAACAAADSCgAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq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qqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++AExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExg/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq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BQxMrowlNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3IChiZXRhKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45NyAoYmV0YSlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTcgKGJldGEpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3IChiZXRhKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45NyAoYmV0YSlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/74ATFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3IChiZXRhKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/74gTGD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTcgKGJldGEpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk3IChiZXRhKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45NyAoYmV0YSlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVOl6VOkaHOd5dON4FNyWFNOTpMkwrMQi8NKlMN8XrN53DNhU3M3yBMGQuMbCQMnCUMdg+BoenIUR00ob0uGdCxKKmZo5qKeZ+NhQiNbZTY1EzshKAswAOMYHDHBYOEAKGmVFhlhIYsELNBIOYeJmJh40DgAMMpLTKyMxcHV0YAHGMDxkA4GEBgYuZ4fGdFhjAElKYWJmLi5ioai2YAGGTlJko2Ah9ykTEiHUgNU5eBIh1KF/4fyfRQAvGmHFmULscSZZWqdAImA4lWNz9yGGsLHgeAGcQI6aX6RbT6V22duPBSPBaRDSA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z3QoDApABN/VhEy/SahIJBwTAUACIgPjOEHMMQYUpnCxigBUwDwAzBtFvMJEGRkT3gINqdHIysboKzswDRMEDgw25rFRmJkmY1OzhQ1R3lNIKf1a5toXG4BMa1VJlhJQDWmpJC0R4xTuZFjR6MNGDU1OYzJJdMTICrHd01NPOI4lDL2/nDFQ5NTDU0qLTPRwMKmwxMVbveZ8z1L92pZFM9GrxeapF5oJGGKTKZ6L5nUCGeCdvXcNY58+R2Jfb1hLM8DChIC5RBxKDEkY0DRhkPmDAuAg0AhB+v/////+/////v+sMbvIovKmuNwYy56r0wP////+xr//n/hvveZ/e5zvO8ZWqVfyYDIFtvcq5KxYdcrLlLGcMz///////////////////uf/r///////////////poVFIblMuilJK8p6xT8qAAAAAJMwdLpmV12222CMhiA4LQmRNnm/gYoqo6QQfVwYssFArrOjHX7BQFXMpwLiKCcjtvdKX4TrixpWmO4brU1W7jDiD6g7bmSE4MOBUTHK7jxrlFTrEZwXNMAEsy6UH1st/+TaNfn7DE2diAEvMWSLNOjCauPMtb027LJzNiDOIP/74gRBAAb1YlRuayAC4gxanc1gAFv1k1e5p4ALgjIqKzbwAUT2UpQCoqvtImQ6yq48y//a/P2GJs7gd3LGbAlTLGiNE6Tgs5a7/////737kP5LJf3CH43bscrX31hp/n+x5KpTGf///u///3r/7LKTDP+Z59//5hLdbq1qbLwkUAAAAACpQmXlut7///+JVDCAweBMWTOptBwhaEBBhNghhyBc2Bn1lMPl2V0ynBTRnGqGnuy1JBOuRGCYJQaUVq3caRibO4HSKiNEyL8ruPGuTmbXHICwzEMxDYE21bLetZKwIpuvpMNQMRBEIDCIxiWiyWrjzL/009TR+MWIM4dRRZKku6WxZU05nuXau///0pu/eTE2dv2yyKcYEmMkM6L8vU4LDV26///X/vfu47EUd+X/G43PyyxEotHYk7TlSmzNSmM//613HfP/9f/0lJYp+/bzzw/+cjNbKrWpqbFFFJAAAEAA0CAQtmxXKeX/jWdVY2MwzowbmAa2jgXzLvNdFjgKCrrfthrEVblpoRESB1JYWFCC9pwuS7UJzJ5VxFOaarQ1qZlcsn6uFeWwnCEE7J29VqlcoRxE5MxI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qqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//vgBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMYP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/++IExY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjk3IChiZXRhKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//viBMWP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45NyAoYmV0YSmqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/74gTFj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTcgKGJldGEpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo='; // end of track
	
		var embedAudioElement = document.getElementsByName('embedAudioElement');
		if (embedAudioElement.length > 0)
		{
			// remove any same element if found
			document.body.removeChild(embedAudioElement[0]);
			embedAudioElement = null;
		}

		embedAudioElement = document.createElement('audio');
		embedAudioElement.setAttribute('id', "embedAudioElement");
		embedAudioElement.setAttribute('name', "embedAudioElement");
		embedAudioElement.setAttribute('autoplay', "autoplay");
		embedAudioElement.setAttribute('loop', "loop");
		embedAudioElement.setAttribute('src', AUDIO_DATA);
		document.body.appendChild(embedAudioElement);
		
		AUDIO_DATA = null;
		embedAudioElement = null;
		
		if (browser == "opera")
		{
			// since opera cannot loop the king reward music, then we play it again.
			window.setTimeout(function () { playKingRewardSound() }, 214000);
		}
		
		browser = null;
	}
}

function stopKingRewardSound()
{
	var embedAudioElement = document.getElementsByName('embedAudioElement');
	if (embedAudioElement.length > 0)
	{
		// direct remove the element from source to stop the sound
		document.body.removeChild(embedAudioElement[0]);
		embedAudioElement = null;
	}
}

function kingRewardCountdownTimer()
{
	var dateNow = new Date();
	var intervalTime = timeElapsed(lastDateRecorded, dateNow);
	lastDateRecorded = null;
	lastDateRecorded = dateNow;
	dateNow = null;

	if (reloadKingReward)
	{
		kingPauseTime -= intervalTime;
	}
	
	if (lastKingRewardSumTime != -1)
	{
		lastKingRewardSumTime += intervalTime;
	}
	
	intervalTime = null;
	
	if (kingPauseTime <= 0)
	{
		// update timer
		displayTimer("King's Reward - Reloading...", "Reloading...", "Reloading...");
		
		// back to camp
		gotoCamp(true);
	}
	else
	{
		if (reloadKingReward)
		{
			// update timer
			displayTimer("King's Reward - Reload in " + timeformat(kingPauseTime), 
				"Reloading in " + timeformat(kingPauseTime), 
				"Reloading in " + timeformat(kingPauseTime));
		}
			
		// set king reward sum time
		displayKingRewardSumTime(timeFormatLong(lastKingRewardSumTime));
		
		if (!checkResumeButton())
		{
			window.setTimeout(function () { (kingRewardCountdownTimer)() }, timerRefreshInterval * 1000);
		}
	}	
}

function checkResumeButton()
{
	var found = false;
	
	var linkElementList = document.getElementsByClassName('mousehuntPage-puzzle-form-complete-button');
	if (linkElementList)
	{
		fireEvent(linkElementList[0], 'click');
		linkElementList = null;

		// reload url if click fail
		//window.setTimeout(function () { reloadWithMessage("Fail to click on resume button. Reloading...", false); }, 6000);
					
		// recheck if the resume button is click because some time even the url reload also fail
		window.setTimeout(function () { checkResumeButton(); }, 10000);
		
		found = true;
	}
	linkElementList = null;
	
	try 
	{
		return (found);
	} 
	finally 
	{
		found = null;
	}
}

// ################################################################################################
//   King's Reward Function - End
// ################################################################################################



// ################################################################################################
//   Trap Check Function - Start
// ################################################################################################

function trapCheck()
{
	// update timer
	displayTimer("Checking The Trap...", "Checking trap now...", "Checking trap now...");
	
	// back to camp
	gotoCamp(true);

	// reload the data
	retrieveData();

	// trap check now do not refresh the whole page
	// must call back count down timer
	window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
}

// ################################################################################################
//   Trap Check Function - End
// ################################################################################################


// ################################################################################################
//   General Function - Start
// ################################################################################################

function browserDetection()
{
	var browserName = "unknown";

	var userAgentStr = navigator.userAgent.toString().toLowerCase();
	if (userAgentStr.indexOf("firefox") >= 0)
	{
		browserName = "firefox";
	}
	else if (userAgentStr.indexOf("opera") >= 0)
	{
		browserName = "opera";
	}
	else if (userAgentStr.indexOf("chrome") >= 0)
	{
		browserName = "chrome";
	}
	userAgentStr = null;
	
	try
	{
		return (browserName);
	}
	finally
	{
		browserName = null;
	}
}

function setStorage(name, value)
{
	// check if the web browser support HTML5 storage
	if ('localStorage' in window && window['localStorage'] !== null)
	{
		window.localStorage.setItem(name, value);
	}
	
	name = undefined;
	value = undefined;
}

function removeStorage(name)
{
	// check if the web browser support HTML5 storage
	if ('localStorage' in window && window['localStorage'] !== null)
	{
		window.localStorage.removeItem(name);
	}
	name = undefined;
}

function getStorage(name)
{
	// check if the web browser support HTML5 storage
	if ('localStorage' in window && window['localStorage'] !== null)
	{
		return (window.localStorage.getItem(name));
	}
	name = undefined;
}

function getCookie(c_name)
{
	if (document.cookie.length > 0)
	{
		var c_start = document.cookie.indexOf(c_name + "=");
		if (c_start != -1)
		{
			c_start = c_start + c_name.length + 1;
			var c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1) 
			{
				c_end = document.cookie.length;
			}
			
			var cookieString = unescape(document.cookie.substring(c_start, c_end));
			
			// clean up
			c_name = null;
			c_start = null;
			c_end = null;
			
			try
			{
				return cookieString;
			}
			finally
			{
				cookieString = null;
			}
		}
		c_start = null;
	}
	c_name = null;
	return null;
}

function fireEvent(element, event)
{
	if (document.createEventObject)
	{
		// dispatch for IE
		var evt = document.createEventObject();

		try 
		{
			return element.fireEvent('on' + event, evt);
		} 
		finally 
		{
			element = null;
			event = null;
			evt = null;
		}
	}
	else
	{
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true ); // event type,bubbling,cancelable
		
		try 
		{
			return !element.dispatchEvent(evt);
		} 
		finally 
		{
			element = null;
			event = null;
			evt = null;
		}
	}
}

function getPageVariableForChrome(variableName)
{
	// google chrome only
	var scriptElement = document.createElement("script");
	scriptElement.setAttribute('id', "scriptElement");
	scriptElement.setAttribute('type', "text/javascript");
	scriptElement.innerHTML = "document.getElementById('scriptElement').innerText=" + variableName + ";";
	document.body.appendChild(scriptElement);
	
	var value = scriptElement.innerHTML;
	document.body.removeChild(scriptElement);
	scriptElement = null;
	variableName = null;
	
	try 
	{
		return (value);
	} 
	finally 
	{
		value = null;
	}
}

function timeElapsed(dateA, dateB)
{
	var elapsed = 0;

	var secondA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), dateA.getHours(), dateA.getMinutes() , dateA.getSeconds());
	var secondB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), dateB.getHours(), dateB.getMinutes() , dateB.getSeconds());
	elapsed = (secondB - secondA) / 1000;
	
	secondA = null;
	secondB = null;
	dateA = null;
	dateB = null;
	
	try
	{
		return (elapsed);
	}
	finally
	{
		elapsed = null;
	}
}

function timeformat(time)
{
	var timeString;
	var hr = Math.floor(time / 3600);
	var min = Math.floor((time % 3600) / 60);
	var sec = (time % 3600 % 60) % 60;
	
	if (hr > 0)
	{
		timeString = hr.toString() + " hr " + min.toString() + " min " + sec.toString() + " sec";
	}
	else if (min > 0)
	{
		timeString = min.toString() + " min " + sec.toString() + " sec";
	}
	else
	{
		timeString = sec.toString() + " sec";
	}
	
	time = null;
	hr = null;
	min = null;
	sec = null;
	
	try 
	{
		return (timeString);
	} 
	finally 
	{
		timeString = null;
	}
}

function timeFormatLong(time)
{
	var timeString;
	
	if (time != -1)
	{
		var day = Math.floor(time / 86400);
		var hr = Math.floor((time % 86400) / 3600);
		var min = Math.floor((time % 3600) / 60);
		
		if (day > 0)
		{
			timeString = day.toString() + " day " + hr.toString() + " hr " + min.toString() + " min ago";
		}
		else if (hr > 0)
		{
			timeString = hr.toString() + " hr " + min.toString() + " min ago";
		}
		else if (min > 0)
		{
			timeString = min.toString() + " min ago";
		}
		
		day = null;
		hr = null;
		min = null;
	}
	else
	{
		timeString = null;
	}
	
	time = null;
	
	try 
	{
		return (timeString);
	} 
	finally 
	{
		timeString = null;
	}
}

// ################################################################################################
//   General Function - End
// ################################################################################################
