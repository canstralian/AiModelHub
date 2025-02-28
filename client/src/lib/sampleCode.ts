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
  
  'llama-cpp-agent': 
`Review this code for security vulnerabilities:

function authenticateUser(username, password) {
  if (username === 'admin' && password === 'admin123') {
    const token = createToken({ username });
    return { success: true, token };
  }
  return { success: false, message: 'Invalid credentials' };
}`,
  
  'code-review-chains': 
`// Please review this code for performance issues and suggest improvements
function fibonacciSequence(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];
  
  const result = [0, 1];
  for (let i = 2; i < n; i++) {
    result.push(result[i-1] + result[i-2]);
  }
  return result;
}

// This is used in a web application that needs to calculate large Fibonacci sequences frequently`,
  
  'autocoder': 
`# Complete this Python class for a bank account system
class BankAccount:
    def __init__(self, account_number, owner_name, balance=0):
        self.account_number = account_number
        self.owner_name = owner_name
        self.balance = balance
    
    def deposit(self, amount):
        # TODO: Implement deposit functionality
        
    def withdraw(self, amount):
        # TODO: Implement withdrawal with validation
        
    def get_balance(self):
        # TODO: Return current balance with formatted string`,
  
  'codestral-22b': 
`/* 
Create a function that fetches data from an API and handles errors properly.
The function should:
1. Accept a URL parameter
2. Use fetch to get data
3. Implement proper error handling
4. Return the data as JSON
5. Include timeout functionality
*/

async function fetchDataFromApi(url) {
  // Your implementation here
}`,
  
  'codeqwen-7b': 
`# Implement a machine learning pipeline that:
# 1. Loads a dataset
# 2. Preprocesses the data (handling missing values, encoding categorical features)
# 3. Splits data into training and testing sets
# 4. Trains a model (your choice of algorithm)
# 5. Evaluates performance
# 6. Includes cross-validation

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
# Add more imports as needed

def ml_pipeline(dataset_path):
    # Your implementation here
    pass`,
  
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
