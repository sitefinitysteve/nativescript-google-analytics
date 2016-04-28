var application = require("application");


exports.initalize = function (config) {
    if(config.trackingId){
        var configureError = new interop.Reference();
        GGLContext.sharedInstance().configureWithError(configureError);

        var gai = GAI.sharedInstance();
        gai.trackUncaughtExceptions = true;
        var defaultTracker = gai.trackerWithTrackingId(config.trackingId);

        
        if(config.dispatchInterval){
            gai.dispatchInterval = config.dispatchInterval;
        } 

        /*
        if(config.userId){
            var gAIUserId = "&uid"; //kGAIUserId
            global.gaTracker.setValueForKey(gAIUserId, config.userId);
        }
        */

        if(config.logging){
            var logLevel = 4; //kGAILogLevelVerbose
            gai.logger.logLevel = logLevel;
        }

        if (config.consoleLogging == false)
        {
            global.consoleLogging = false;
        }
        else
        {
            global.consoleLogging = true;
        }
        
        global.gaTracker = defaultTracker;
        global.gaInstance = gai;
        
        //setup timers
        global.gaTimers = [];
    }else{
        throw "Sup boss, how do you plan on tracking with no trackingId?  Please add it to the config";
    }
}

exports.logView = function(viewname){
    if (global.consoleLogging) { console.log("Analytics Event: Log Screen View: " + viewname + " at " + new Date()); }
    
    var gAIScreenName =  "&cd"; //kGAIScreenName
    var event = GAIDictionaryBuilder.createScreenView().setForKey(viewname, gAIScreenName);
    var builtEvent = event.build();

    if(global.gaTracker)
        GAITracker.prototype.send.call(global.gaTracker, builtEvent);
    else
        if (global.consoleLogging) { console.log("Unable to locate tracker to log view"); }
}

exports.logEvent = function(data){
    if (global.consoleLogging) { console.log("Analytics Event:" + JSON.stringify(data) + " at " + new Date()); }
    var event = GAIDictionaryBuilder.createEventWithCategoryActionLabelValue(
      data.category,
      data.action,
      data.label,
      data.value  
    );
    var builtEvent = event.build();
    
    if(global.gaTracker)
        GAITracker.prototype.send.call(global.gaTracker, builtEvent);
    else
        if (global.consoleLogging) { console.log("Unable to locate tracker to log event"); }
}

exports.logException = function (data) {
    var description = "";
    var fatal = "";
    
    if( typeof data === 'object') {
        description = data.description;
        fatal = (data.fatal) ? data.fatal : false;
    }
    else {
        //not object
        description = data;
        fatal = false;
    }
    
    if (global.consoleLogging) { console.log("Analytics Logging Exception: " + description); }

    var event = GAIDictionaryBuilder.createExceptionWithDescriptionWithFatal(description, fatal);
    var builtEvent = event.build();
    
    GAITracker.prototype.send.call(global.gaTracker, builtEvent);
}



exports.dispatch = function (args){
    if (global.consoleLogging) { console.log("Analytics Flushing dispatch event queue"); }
    GAI.sharedInstance().dispatch();
};


exports.getTracker = function () {
    return global.gaTracker;
}



//## TIMING FUNCTIONS ##
//Raw Timer
exports.logTimingEvent = function(data){
    logTiming(data);
}

//Start
exports.startTimer = function (timerName, data) {
    global.gaTimers.push({ 
        name: timerName,
        value: new Date(),
        data: data
    })
}

//End
exports.stopTimer = function (timerName) {
    var endTime = new Date();
    var foundTimer = false;

    //Find the timer
    for(var i = 0; i < global.gaTimers.length; i++){
        var timer = global.gaTimers[i];
        if(timer.name == timerName){
            foundTimer = true;

            //set timer
            timer.data.value = endTime.getTime() - timer.value.getTime();

            //Process event
            logTiming(timer.data);
            global.gaTimers.splice(i,1);
            break;
        }
    }   
    
    if(!foundTimer && global.consoleLogging){
        console.log("Unable to find timer start event named " + timerName);
    }
}

function logTiming(data){
    var event = GAIDictionaryBuilder.createTimingWithCategoryIntervalNameLabel(
      data.category,
      data.value,
      data.name,
      data.label
    );

    var builtEvent = event.build();

    if(global.gaTracker){
        GAITracker.prototype.send.call(global.gaTracker, builtEvent);
        if (global.consoleLogging) { console.log("Analytics Timing Event:" + JSON.stringify(data) + " at " + new Date()); }
    }
    else
        if (global.consoleLogging) { console.log("Unable to locate tracker to log event"); }
}
