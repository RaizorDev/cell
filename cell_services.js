function Bundle($c,$i){
	this.$component = $c;
	this.$inject = $i;
}

var $cell = function (){
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
	/*Jesus is going to verify the process because it seems that the filter function disappears*/
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
			if(typeof dep == "object" || typeof dep == "string"	|| typeof dep == "boolean" || typeof dep == "number"){
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