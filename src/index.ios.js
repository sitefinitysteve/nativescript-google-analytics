/// https://developers.google.com/analytics/devguides/collection/ios/v3

var settings = {
    logging: null
};

exports.initalize = function (config) {
    console.log('Google Analytics config', config);
    if (config.trackingId) {
       
        console.log('Google Analytics GAI', GAI);
        if (typeof GAI !== "undefined") {
            var gai = GAI.sharedInstance();
            gai.trackUncaughtExceptions = true;
            var defaultTracker = gai.trackerWithTrackingId(config.trackingId);
            console.log('Google Analytics defaultTracker', defaultTracker);
            if (config.enableDemographics) {
                defaultTracker.allowIDFACollection = true;
            }

            if (config.dispatchInterval) {
                gai.dispatchInterval = config.dispatchInterval;
            }

            if (config.userId) {
                var gAIUserId = "&uid"; //kGAIUserId
                GAITracker.prototype.setValue.call(defaultTracker, gAIUserId, config.userId);
            }

            if (config.logging) {
                settings.logging = config.logging;

                if (config.logging.native) {
                    var logLevel = 4; //kGAILogLevelVerbose
                    gai.logger.logLevel = logLevel;
                }
            }

            global.gaTracker = defaultTracker;
            global.gaInstance = gai;

            //setup timers
            global.gaTimers = [];
        } else {
            console.log("UNABLE TO FIND GOOGLE ANALYTICS COCOAPOD OBJECTS!")
        }
    } else {
        throw "Sup boss, how do you plan on tracking with no trackingId?  Please add it to the config";
    }
};

exports.logView = function (viewname) {
    logToConsole("Analytics Event: Log Screen View: " + viewname + " at " + new Date());

    var gAIScreenName =  "&cd"; //kGAIScreenName
    var event = GAIDictionaryBuilder.createScreenView().setForKey(viewname, gAIScreenName);
    var builtEvent = event.build();

    if (global.gaTracker) {
        GAITracker.prototype.send.call(global.gaTracker, builtEvent);
    } else {
        logToConsole("Unable to locate tracker to log view");
    }
};

exports.logEvent = function (data) {
    logToConsole("Analytics Event:" + JSON.stringify(data) + " at " + new Date());
    var builtEvent = GAIDictionaryBuilder.createEventWithCategoryActionLabelValue(
        data.category,
        data.action,
        data.label,
        data.value
    ).build();

    if (global.gaTracker) {
        GAITracker.prototype.send.call(global.gaTracker, builtEvent);
    } else {
        logToConsole("Unable to locate tracker to log event");
    }
};

exports.logException = function (data) {
    var description = "";
    var fatal = "";

    if (typeof data === "object") {
        description = data.description;
        fatal = (data.fatal) ? data.fatal : false;
    } else {
        //not object
        description = data;
        fatal = false;
    }

    if (description.length > 100) {
        console.log("GA Limits descriptions to 100 characters https://developers.google.com/analytics/devguides/collection/ios/v3/exceptions");
    }

    logToConsole("Analytics Logging Exception: " + description);

    var event = GAIDictionaryBuilder.createExceptionWithDescriptionWithFatal(description, fatal);
    var builtEvent = event.build();

    GAITracker.prototype.send.call(global.gaTracker, builtEvent);
};


exports.dispatch = function (args) {
    logToConsole("Analytics Flushing dispatch event queue");
    GAI.sharedInstance().dispatch();
};


exports.getTracker = function () {
    return global.gaTracker;
};


//## TIMING FUNCTIONS ##
//Raw Timer
exports.logTimingEvent = function (data) {
    logTiming(data);
};

//Start
exports.startTimer = function (timerName, data) {
    global.gaTimers.push({
        name: timerName,
        value: new Date(),
        data: data
    })
};

//End
exports.stopTimer = function (timerName) {
    var endTime = new Date();
    var foundTimer = false;

    //Find the timer
    for (var i = 0; i < global.gaTimers.length; i++) {
        var timer = global.gaTimers[i];
        if (timer.name === timerName) {
            foundTimer = true;

            //set timer
            timer.data.value = endTime.getTime() - timer.value.getTime();

            //Process event
            logTiming(timer.data);
            global.gaTimers.splice(i, 1);
            break;
        }
    }

    if (!foundTimer) {
        logToConsole("Unable to find timer start event named " + timerName);
    }
};

function logTiming(data) {
    var event = GAIDictionaryBuilder.createTimingWithCategoryIntervalNameLabel(
        data.category,
        data.value,
        data.name,
        data.label
    );

    var builtEvent = event.build();

    if (global.gaTracker) {
        GAITracker.prototype.send.call(global.gaTracker, builtEvent);
        logToConsole("Analytics Timing Event:" + JSON.stringify(data) + " at " + new Date());
    }
    else
        logToConsole("Unable to locate tracker to log event");
}

function logToConsole(message) {
    if (settings.logging) {
        if (settings.logging.console) {
            console.log(message);
        }
    }
}
