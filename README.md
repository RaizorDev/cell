#Cell


**Cell** is a module pattern mediator plugin that allows users to control JavaScript
functions by using modules which can be called by broadcasting a Mediator component. It allows the injection of dependencies on the functions, giving the user total control over
the modules (modules can be started and/or stopped at will).

Besides, the user can set filters for the modules; if a function is broadcast with one or more
arguments, those arguments are first tested against the filter to determine if the function 
inside the module will be executed.

##Registering a module

```javascript
Mediator.add('TestModule',function(){
				return{
					doSomething:function(something){
						alert("Do " + something);
					}
			}
		});
```

In this case, to call the function `doSomething` inside the module you just need to broadcast a message to the
Mediator component.

```javascript
Mediator.broadcast("doSomething",["Homework"])
```

However, before broadcasting the Mediator component the previously registered module needs to be started.

```javascript
Mediator.start("TestModule");
```

Setting a special function called `init` will execute some code you specify when the module is started.

```javascript
Mediator.add('TestModule',function(){
				return{
					init:function(){
					   console.log("Init Function")
					},
					doSomething:function(something){
						alert("Do " + something);
					}
			}
		});
```

###Filters

As mentioned previously, filter functions can be incorporated on your modules to control valid data
passed to a function through the `broadcast` method.


```javascript
Mediator.add('TestModule',function(){
		return{
			doSomething:function(something){
				alert("Do " + something);
			}
		}
	},{filter:function(data){
		return data === "some tasks";
	  }
      });
```

It's important to note that `filter` must be a function that returns a boolean value of either `true` or `false`.

In this case, by executing:

```javascript
Mediator.broadcast("doSomething",["some taskss"])
```

A filter exception will be show for that module.


##Dependency Injection for modules

**Cell** allows the injection of dependencies into the modules you create.

```javascript
$component.register('data',"Injected data");
```

This `'data'` would be injected on all the modules that receive a data object as a parameter.

```javascript
Mediator.add("Dependency",function(data){
	return {
		doSomething :  function(){
			alert(data);
		}
	   }
	});
```

##Register a webworker
**Cell** provides web worker registration. A worker javascript can be added with an identifier
and it defines the `onmessage` function for us, requesting the name to set, the url of our web
worker and the `onmessage` function.

```javascript
Mediator.addWorker("count","worker.js",function(event){
			document.getElementById("result").innerHTML=event.data;
		  });
```


A message can be then posted to the web worker using the `postWorker` command.

```javascript
Mediator.postWorker('count',"Text")
```
