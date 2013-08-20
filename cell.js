
function Bundle($c,$i){
	this.$component = $c;
	this.$inject = $i;
}

var $quasar = function (){
	var bundles ={};
	
	var clone = (function(){ 
		return function (obj) { Clone.prototype=obj; return new Clone() };
		function Clone(){}
	}());

	return{
		import: function(name){
			var bundle = bundles[name];
			for(var i in bundle){
			}
		},
		/*Bundle will be injected with $component and $inject vars*/
		createBundle: function(name,bundle){
			bundles[name] = bundle(clone($component),clone($inject));
		}
	}
	
};

var Mediator = function() {

	var dMode = false;
        
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
					debug("Mediator calling: " + event + " on '" + c + "' module");
					source = source || components[c];
                    components[c][event].apply(source, args);
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

    var addComponent = function(name, component, replaceDuplicate) {    			
            if (name in components) {
                if (replaceDuplicate) {
                    removeComponent(name);
                } else {
                    throw new Error('Mediator name conflict: ' + name);
                }
            }
            components[name] = component;
            components[name]['state']='stopped';
        };
//* removeComponent function delete the modules from the component's array      
  
    var removeComponent = function(name) {
            if (name in components) {
                delete components[name];
            }
        };

//*	registerToComponent function registers a new function to an existing module on the Mediator.	
	var registerToComponent = function(name,event,registeredFunction,overwrite){
		debugger;
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
		debugger;
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
    	if(contains(name)){
			if(components[name]['state'] === "started"){
				debug("Module: '" + name + " 'Already Started ");
				return;
			}
    		components[name] = $inject.process(components[name]);    	
    		components[name]['state']='started';
            debug("Module: '" + name + "' Started ");
            if(typeof components[name]["init"] == "function"){
           	 	debug(["Module: '" + name + "' calling init method"].join(' '));
           	 	components[name].init.apply(components[name], args);
            }
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
  
  
var $inject = function(){
	function newApply(constructor, argsArray) {
		  function DummyObject(){};
		  DummyObject.prototype = constructor.prototype;
		  var object = new DummyObject();
		  var sndObject = constructor.apply(object, argsArray);
		  return (typeof sndObject == "object" ? sndObject : object);
	}
	
	var dependencies = {}; //dependencies to inject: {}
	
	/*
	 * get the dependencies of the registered component
	 */
	var getDependencies = function(arr) {
	    var self = this;
	    return arr.map(function(value) {
			var dependency = dependencies[value];
			if(typeof dependency == "function"){
				dependency = instanciateObjects(dependency);
				dependencies[value] = dependency;
			}
	        return dependency;
	    });
	}
	
	var instanciateObjects = function(target) {
			var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
			var text = target.toString();
			var args = text.match(FN_ARGS)[1].split(',');
			var deps = getDependencies(args);
			return target.apply(target, deps) || newApply(target,deps);
	}
	
	return {
		/*
		 * Process the component passed and injects their dependencies
		 */
		process : instanciateObjects,
	  	/*
		 * get a dependency by name
		 */
		get: function(name) {
			var dep = dependencies[name];
			if(typeof dep == "object" || typeof dep == "string"
				|| typeof dep == "boolean" || typeof dep == "number"){
				return dep;
			}else if(typeof dependencies[name] == "function"){
				dependencies[name] = instanciateObjects(dep);
			}
		    return dependencies[name];
		},
		
		/*
		 * register a component to be injected in other components 
		 */
		register: function(name, dependency) {
			
		    dependencies[name] = dependency;
		}
	}	
}();


var $component = function(){
	function newApply(constructor, argsArray) {
		  function DummyObject(){};
		  DummyObject.prototype = constructor.prototype;
		  var object = new DummyObject();
		  var sndObject = constructor.apply(object, argsArray);
		  return (typeof sndObject == "object" ? sndObject : object);
	}
	
	return {
		/*
		* Registers a component(class,service,DAO etc) to to the application, also this component will be available to be injected
		*/
		register: function(name,comp){
			$inject.register(name,comp);
		},
		jqGUI:function(name,comp){
			$inject.register(name,comp);
			
					
		},
		loadConfig: function(json){
			$(document).ready(function(){
				for(var i in json){
					console.log(window[json[i].class]);
					console.log(i);
					var comp = newApply(window[json[i].class],json[i].constructor);
					
					for(var prop in json[i].props){
						console.log(1);
						var setter = "set"+prop.substr(0,1).toUpperCase()+prop.substr(1);
						comp[setter](json[i].props[prop]);
					}
					
					$inject.register(i,comp);
				}
			});
			
		},
		loadJSONFile: function(url){
			
		}
	}
}();