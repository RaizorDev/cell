 /*
 Added filter function to work properly.
 Fixed bug when a module was started, stopped and started again.
 Changed valitation if a module has a filter.
 Proposed to separe $component $inject in another file to work with them.
 */ 


var Mediator = function() {

	var dMode = true;
        
    var debug = function(msg) {
        if(dMode){
            console.log(msg);
		}
    };
	
 var components = {};
      


//* The broadcast function sends a broadcast to the mediator and it search in their modules
//If there is a function listening to that event and executes it. If a module have a coding 
//error the javascript keeps still working.	 

    var broadcast = function(event, args, source) {
		if (!event) {
			return;
		}
		args = args || [];
		debug(["Mediator broadcasting:", event, args].join(' ')); 
		for (var c in components) {
			if (typeof components[c][event] == "function" && components[c]['state'] != 'stopped') {
				try {
				//Added Still uncomplete we need to trigger first the filter before the broadcast function
					if(typeof components[c]["filter"] === "function"){
						source = components[c]["filter"];
						if(!components[c]["filter"].apply(source,args)){
							debug("Filter for \""+c+"\" failed with args: [" + args+"]");
						}else{
							debug("Mediator calling: " + event + " on '" + c + "' module");
							source = source || components[c];
							components[c][event].apply(source, args);
						}
					}else{
						debug("Mediator calling: " + event + " on '" + c + "' module");
						source = source || components[c];
						components[c][event].apply(source, args);
					}
				} catch (error) {                    	
                 	var url = error.stack.split('\n')[1].match(/\(.+\)/g)[0];
				   debug(["Mediator error. Module '", c +"', Function: "+ event +", Args:"+args+", "+  error,  url].join(' '));
				}
            }else{
                	console.log('No listener for '+event + ' on ' + c);
                	console.log(components[c]);
            }
        }
    };
//* addComponent function creates a new module and add's it to the component array,
//all the new components start with a 'stopped' state. If it is stopped it won't listen
//to broadcast events.     

//Added options object
    var addComponent = function(name, component, options) {    			
            if (name in components) {
                if(options){
					if(options["replace"]) {
						removeComponent(name);
					}
				}else {
                    throw new Error('Mediator name conflict: ' + name);
                }
            }
            components[name] = component;
            components[name]['state']='stopped';
			//Added to receive a filter function for all the functions on a module.
			if(options && options["filter"] && typeof options["filter"] === "function"){
						components[name]["filter"] = options["filter"];
			}
        };

//* removeComponent function delete the modules from the component's array      
    var removeComponent = function(name) {
            if (name in components) {
                delete components[name];
            }
        };

//*	registerToComponent function registers a new function to an existing module on the Mediator.	
	var registerToComponent = function(name,event,registeredFunction,overwrite){
		if(components[name]){
			if(!components[name][event] || overwrite === true){
				components[name][event] = registeredFunction;
			}else{
				debug("Event already exists on component \"" + name + "\"");
			}
		}else{
			debug("This component \""+name+"\" doesn't exists");
		}
	}	
	
//*	unregisterFromComponent function unregisters a function from an existing module on the Mediator.
	var unregisterFromComponent = function(name,event){
		if(components[name]){
			if(components[name][event]){
				delete components[name][event];
			}else{
				debug("Event doesn't exists on component \"" + name + "\"");
			}
		}else{
			debug("This component \""+name+"\" doesn't exists");
		}
	}

//* getComponent function returns the component object for a established name if it exist in the array 
    var getComponent = function(name) {
            return components[name]; // undefined if component has not been added
        };

//* contains function return a value if a certain component is in the array   
    var contains = function(name) {
            return (name in components);
        };

//* startModule function changes the default stopped value of a component to started  
    var startModule = function(name,args){
			if(components[name]['state'] === "started"){
				debug("Module: '" + name + " 'Already Started ");
				return;
			}
			
			var filter;
			if(typeof components[name]["filter"] === "function"){
				filter = components[name]["filter"];
			}
			if(components[name].toString() !== "[object Object]"){
				components[name] = $inject.process(components[name]);
			}
			components[name]['state']='started';
			if(filter){
				components[name]["filter"] = filter;
			}
            debug("Module: '" + name + "' Started ");
            if(typeof components[name]["init"] == "function"){
           	 	debug(["Module: '" + name + "' calling init method"].join(' '));
           	 	components[name].init.apply(components[name], args);
            }
     };

//* stopModule functions changes the state of the component to stopped 
      var stopModule = function(name){
        components[name]['state']='stopped';
		debug(["Module: '" + name + "' Stopped"].join(' '));
    };
	
//* startDebug enables log notifications from the Mediator
	var startDebug = function(){
		if(dMode){
			dMode = false;
		}else{
			dMode = true;
		}
	};
	
//*	Returns the current state for a certain Module
	var getState = function(name){
		return components[name]['state'];
	}
        
        return {
            name      : "Mediator",
            broadcast : broadcast,
            add       : addComponent,
            rem       : removeComponent,
			register  : registerToComponent,
			unregister: unregisterFromComponent,
            get       : getComponent,
            has       : contains,
            start     : startModule,
            stop      : stopModule,
			debugMode : startDebug,
			state     : getState
          };
}();
  
