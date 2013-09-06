cell
====

Cell Modular

Cell is a module pattern mediator plugin that allows the user to control javascript
functions by modules and call them by broadcasting a Mediator component.

It allows to inject dependencies on the functions, it gives the user total control over
the modules allowing the user to start or stop modules if it's desired.

Also the user can set filters for the modules, if we broadcast one function with
some arguments  first those arguments are tested against the filter to be able to execute the function 
inside the module.

Register a module

```javascript
Mediator.add('TestModule',function(){
				return{
					doSomething:function(something){
						alert("Do " + something);
					}
			}
		});
```
