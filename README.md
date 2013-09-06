#Cell


Cell is a module pattern mediator plugin that allows the user to control javascript
functions by modules and call them by broadcasting a Mediator component.

It allows to inject dependencies on the functions, it gives the user total control over
the modules allowing the user to start or stop modules if it's desired.

Also the user can set filters for the modules, if we broadcast one function with
some arguments  first those arguments are tested against the filter to be able to execute the function 
inside the module.

##Register a module

```javascript
Mediator.add('TestModule',function(){
				return{
					doSomething:function(something){
						alert("Do " + something);
					}
			}
		});
```

In this case if we want to call the function doSomething inside the module we just broadcast a message to the
Mediator component.

```javascript
Mediator.broadcast("doSomething",["Homework"])
```

But first before broadcasting the Mediator component we need to start our previously registered module.

```javascript
Mediator.start("TestModule");
```

if we set a init function this function will be called when we start that module.

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

You can also add filter functions to your modules to control what does the module can 
accept as data passed to a function thru the broadcast method.


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

The filter must be a function that evaluates to boolean values `true` or `false`.

So in this case if we execute:

```javascript
Mediator.broadcast("doSomething",["some taskss"])
```

It will show us a Filter exception for that module.

##Dependency Injection for modules

Also Cell offers the posibility to inject dependencies into the modules we create.

```javascript
$component.register('data',"Injected data");
```

This data would be injected on all the modules that receive a data object as a parameter.

```javascript
Mediator.add("Dependency",function(data){
	return {
		doSomething :  function(){
			alert(data);
		}
	   }
	});
```

