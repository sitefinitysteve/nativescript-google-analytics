var application = require("application");


exports.initalize = function (config) {
    if(config.trackingId){
        var context = application.android.context;
        var gai = com.google.android.gms.analytics.GoogleAnalytics.getInstance(context);
        var tracker = gai.newTracker(config.trackingId);
        tracker.enableExceptionReporting(true);
        
        if(config.dispatchInterval){
            gai.setLocalDispatchPeriod(config.dispatchInterval);
        }
        
        /*
        if(config.userId){
            tracker.setClientId(config.userId);
        }
        */
        
        if(config.logging){
            console.log("To enable debug logging use: adb shell setprop log.tag.GAv4 DEBUG");
        }

        if (config.consoleLogging == false)
        {
            global.consoleLogging = false;
        }
        else
        {
            global.consoleLogging = true;
        }
        
        global.gaInstance = gai;
        global.gaTracker = tracker;
        
        //setup timers
        global.gaTimers = [];
    }else{
        throw "Sup boss, how do you plan on tracking with no trackingId?  Please add it to the config";
    }
}

exports.logView = function(viewname){
    if (global.consoleLogging) { console.log("Analytics Event: Log Screen View: " + viewname + " at " + new Date()); }
    global.gaTracker.setScreenName(viewname);
    var builtEvent = new com.google.android.gms.analytics.HitBuilders.ScreenViewBuilder().build();
    global.gaTracker.send(builtEvent);
}

exports.logEvent = function(data){
    if (global.consoleLogging) { console.log("Analytics Event:" + JSON.stringify(data) + " at " + new Date()); }
    var event = new com.google.android.gms.analytics.HitBuilders.EventBuilder().setCategory(data.category).setAction(data.action);

    if(data.label && data.label !== "" && data.label !== null)
        event.setLabel(data.label);
     
    if(data.value && data.value !== "" && data.value !== null)
        event.setValue(data.value);   
    
    var builtEvent = event.build();
    
    global.gaTracker.send(builtEvent);    
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
    
    if (global.consoleLogging) { console.log("Logging GA Exception: " + description); }

    var event = new com.google.android.gms.analytics.HitBuilders.ExceptionBuilder().setDescription(description).setFatal(fatal);
    var builtEvent = event.build();
    
    global.gaTracker.send(builtEvent);
}


exports.dispatch = function (args){
    if (global.consoleLogging) { console.log("Flushing dispatch event queue"); }
    global.gaInstance.dispatchLocalHits();
};


exports.getTracker = function () {
    return global.gaTracker;
}


//## TIMING FUNCTIONS ##
//Raw Timer
exports.logTimingEvent = function (data) {
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
    if (global.consoleLogging) { console.log("Analytics Timing Event:" + JSON.stringify(data) + " at " + new Date()); }
    var event = new com.google.android.gms.analytics.HitBuilders.TimingBuilder().setCategory(data.category).setValue(data.value);
 
    if(data.name && data.name !== "" && data.name !== null)
        event.setVariable(data.name);   
    
    if(data.label && data.label !== "" && data.label !== null)
        event.setLabel(data.label);
    
    var builtEvent = event.build();
    
    global.gaTracker.send(builtEvent); 
}
