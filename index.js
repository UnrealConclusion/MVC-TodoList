/**
 * API Object
 */
const APIs = (() => {
    const baseURL = "http://localhost:3000/todos"; // Endpoint to interact with todo array
    // method gets all items in the todo array using the baseURL
    // note that we passed in options ~ details in documentation
    const getTodos = () => {
        return fetch(baseURL).then((res) => res.json());
      };

    // method places a new item in the todo array
    const createTodo = (newTodo) => {
        return fetch(baseURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTodo),
        }).then((res) => res.json());
    };

    // method deletes a new item in the todo array
    // note that we passed in options ~ details in documentation
    const deleteTodo = (id) => {
        return fetch(`${baseURL}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());
    };

    // return an Object with our API methods 
    return {
        getTodos,
        createTodo,
        deleteTodo,
    };
})();

/**
 * Model Object 
 * - handles database operations 
 * - maintains a state representing the todo list
 */
const Model = (() => {
    class state {
        #todos; // stores the current contents of the todo list
        #onChange; // callback function to be called everytime the state changes

        // constructor initializes an empty todo list
        constructor() {
            this.#todos = [];
        }

        // getter method for the todo list
        get todos() {
            return this.#todos;
        }

        // setter method for the todo list
        // note that the callback function is called everytime this method is called 
        set todos(newTodos) {
            this.#todos = newTodos;
            this.#onChange();
        }

        // sets the onChange callback function
        subscribe(cb) {
            this.#onChange = cb;
        }
    }

    // returns an object with the state and APIs 
    // note that we used the rest operator to place the contents of API in our object
    return({
        state,
        ...APIs
    });
})();

/**
 * View Object 
 * - handles the UI / direct DOM manipulation
 * - renders the todo list
 * - hold refrences to UI elements
 */
const View = (() => {
    const todolistEl = document.querySelector('#todo_list-container'); // select the todo list container
    const inputEl = document.querySelector("#todo_input"); // input field for the todo list
    const addBtnEl = document.querySelector("#todo_add-btn"); // add button for the todo list

    // method returns the value in the todo list input field
    const getInputValue = () => {
        return inputEl.value;
    };

    // method clears the todo list input field 
    const clearInput = () => {
        inputEl.value = "";
    };
    
    // method renders the contents of the todo list
    const renderTodos = (todos) => {
        let todosTemp = "";
    
        todos.forEach((todo) => {
          const todoItemTemp = 
            `
                <div id=${todo.id}>
                    ${todo.content}
                    <button class="todo_delete-btn">delete</button>
                </div>
            `;
          todosTemp += todoItemTemp;
        });
    
        todolistEl.innerHTML = todosTemp;
      };

    // return Object with properties and values for the controller 
    return {
        renderTodos,
        getInputValue,
        clearInput,
        addBtnEl,
        todolistEl,
      };
})();

/**
 * Controller Object
 * - performs event handling 
 * - handles application logic
 */
const Controller = ((view, model) => {
    const state = new model.state(); // create a new state for the todo list


    // function to setup event handler for the add button
    const setUpAddHandler = () => {

        // we add an onClick listener to the add button using the reference from view
        view.addBtnEl.addEventListener("click", (event) => {
          event.preventDefault(); // prevent the default form action 
          const inputValue = view.getInputValue(); // get the value from the input field
          // console.log(inputValue);

          // create a new todo object
          const newTodo = { 
            content: inputValue,
          };

          // use the model to post the new object to the database
          model.createTodo(newTodo).then((data) => {
            state.todos = [...state.todos, data]; // we update the current state
            view.clearInput(); // clear the input field 
          });
        });
    };

    // uses event delegation to take care of dynamically created objects
    // event bubbling - triggers events listeners on ancestors (bubble up) 
    view.todolistEl.addEventListener("click", (event) => {
        const element = event.target; // the element that triggered the event 

        // console.log(element.className);

        // if the element clicked was the delete button
        if (element.className === "todo_delete-btn") {
            const id = element.parentElement.getAttribute("id"); // get the parent elements id (the todo item)
            
            model
                .deleteTodo(id) // delete it from the database
                .then(() => {
                    return model.getTodos(); // fetch the new updated todo list from the database
                })
                .then((data) => {
                    state.todos = data; // update the state (which will rerender the todo list)
                });
        }
    });

    const init = () => {
        // set callback function to be called everytime the model (todo list) is updated 
        // the callback function calls the view's render method to re-render the todo list
        state.subscribe(() => {
          view.renderTodos(state.todos);
        });

        // fetch the current todo list from the database 
        // update the model to match the data from the database
        model.getTodos().then((data) => {
          state.todos = data;
        });

        setUpAddHandler(); // add the event handler for the add button
    };

    // return the init function 
    return {
        init,
    };
})(View, Model);

Controller.init();

console.log(View.todolistEl);
console.log(View.addBtnEl);

console.log(APIs);
console.log(Model);
console.log(Controller);