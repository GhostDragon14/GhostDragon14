print("MathHomeWork.py")
problem = input("Enter a math problem, or 'q' to quit: ")
while (problem != "q"):
    print("the answer to ", problem, "is:", eval(problem) )
    problem = input("Enter another math problem, or 'q' to quit: ")
