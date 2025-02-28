export const sampleCodes: Record<string, string> = {
  'deepseek-coder': 
`# Create a function to find prime numbers up to n
def find_primes(n):
    # Your implementation here`,
  
  'codellama': 
`// Create a React component for a todo list
import React from 'react';

function TodoList() {
  // Your implementation here
}`,
  
  'python-reviewer': 
`def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

# This function sometimes crashes when given an empty list
# Please review and fix any issues`,
  
  'chatbot': 
`Can you explain how transformers work in machine learning, particularly for natural language processing tasks?`,
  
  'custom': 
`# Custom prompt for your specified model
# Replace this with appropriate input for your model`,

  // Default sample in case model doesn't match
  'default': 
`# Write a function to solve this problem
def solve(input_data):
    # Your implementation here
    pass`
};
