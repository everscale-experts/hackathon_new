<<<<<<< HEAD
# Install

yarn

# Код контракта на Ligo

/declaring type of numbers containing a tuple
type numbers is (int * int)

//declaring types of action that contain tuples
type action is
| Addition of numbers

//declaring data type in the smart contract’s storage
type storage is int

//declaring mathematical functions

//(const a : int ; const b : int) — function parameters
//: int — function result type
//is a + b — result of function execution

function add (const a : int ; const b : int) : int is a + b

//declaring the main function
//assign the type action to the first parameter, storage type to the parameter storе
//the function returns data of list(operation) and int types, a tuple of a list and a number
//function execution result follows “is”:
//1) empty list nil : list(operation).
//2) const result : int = recording the function execution result in the constant “result”
//2) case parameter of — it’s the result of action-type parameter’s execution,
//whose name is the same as the incoming transaction’s name.
function main (const parameter : action ; const store : storage) :
  (list(operation) * int) is block {
    const result : int =
    case parameter of
  | Addition(n1, n2) -> add(n1, n2)
  end;

  //displaying the result of the main function’s execution: empty list of operations      and the value of result
  } with ((nil : list(operation)), result)
=======
# Install  
  
yarn  
  
  
# Links  
  
- https://ide.ligolang.org  
  
  
  
>>>>>>> e69c7e2df7d6bc94de10ff347ca990def50d2aec
