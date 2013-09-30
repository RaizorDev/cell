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

##Webworker
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

###Instantiating a Worker

In the previous example we created a web worker from an external file called `worker.js`
but it is possible to create a web worker from a `string` containing all the code for our
web worker.

Consider the following example:

```javascript
var code = "var i=0;var speed = 500;function timedCount(){i=i+1;"+
     	   "postMessage(i);setTimeout('timedCount()',speed);}"+
	   "self.addEventListener('message',function(e){debugger;"+
	   "switch(e.data){case '-':speed -= 100;break;case '+':"+
	   "speed+= 100;break;/*default:if(typeof e.data === "+
	   "'number'){i = e.data;}break;*/}});timedCount();";
```

That string contains all the code that must be in our webworker for the job desired, this is the
code in a more human readable presentation.

```javascript

	var i=0;
	var speed = 500;
	function timedCount(){
		i=i+1;
		postMessage(i);
		setTimeout("timedCount()",speed);
	}
	self.addEventListener("message",function(e){
		switch(e.data){
			case "-":
				speed -= 100;
				break;
			case "+":
				speed += 100;
				break;
		}
	});
	timedCount();
```

As you can see the worker is nothing more than a simple counter were we can increase or decrease
the time interval between the iterations.

**Cell** offers us the posibility to create a web worker from the string.

```javascript
	Mediator.addWorker("count",code,function(event){
			document.getElementById("result").innerHTML=event.data;
	});
```


Also it is possible to create a web worker from a self contained script tag in our page,
without having an external javascript file.

```javascript
<script type="javascript/worker">
	var i=0;
	var speed = 500;
	function timedCount(){
		i=i+1;
		postMessage(i);
		setTimeout("timedCount()",speed);
	}
	self.addEventListener("message",function(e){
		switch(e.data){
			case "-":
				speed -= 100;
				break;
			case "+":
				speed += 100;
				break;
		}
	});
	timedCount();
</script>
```

We can also instantiate the web worker sending to it a valid script tag.

```javascript

var scriptTag = $("script[type='javascript/worker']");	
		Mediator.addWorker("count",scriptTag,function(event){
			document.getElementById("result").innerHTML=event.data;
		  });
		});
```
