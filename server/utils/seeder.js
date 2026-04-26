require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const connectDB = require('../config/db');

const users = [
  {
    name: 'Admin User',
    email: 'admin@prepforge.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Test Student',
    email: 'student@example.com',
    password: 'password123',
    role: 'user',
    stats: {
      totalSolved: 2,
      easySolved: 2,
      mediumSolved: 0,
      hardSolved: 0,
      totalSubmissions: 5,
      acceptedSubmissions: 2,
    },
    score: 20,
    streak: { current: 3, longest: 5, lastActiveDate: new Date() },
  },
];

const questions = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'easy',
    tags: ['arrays', 'hashing'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
    ],
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}',
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};'
    },
    points: 10,
    isDailyChallenge: true,
    dailyChallengeDate: new Date()
  },
  {
    title: 'Reverse Linked List',
    description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'easy',
    tags: ['linked-list', 'recursion'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: '' }
    ],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    \n};',
      python: '# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass',
      cpp: '/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};'
    },
    points: 10
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    difficulty: 'medium',
    tags: ['strings', 'sliding-window', 'hashing'],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' }
    ],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { input: '"pwwkew"', expectedOutput: '3', isHidden: false },
      { input: '""', expectedOutput: '0', isHidden: true },
      { input: '"au"', expectedOutput: '2', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};',
      python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};'
    },
    points: 25
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets, and in the correct order.',
    difficulty: 'easy',
    tags: ['stack', 'strings'],
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'The brackets close perfectly.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched bracket types.' }
    ],
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"([)]"', expectedOutput: 'false', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};',
      python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        pass',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};'
    },
    points: 10
  },
  {
    title: 'Merge Intervals',
    description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    difficulty: 'medium',
    tags: ['arrays', 'sorting'],
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merge them into [1,6].' }
    ],
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: false },
      { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nvar merge = function(intervals) {\n    \n};',
      python: 'class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        pass',
      cpp: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        \n    }\n};'
    },
    points: 20
  },
  {
    title: 'Trapping Rain Water',
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
    difficulty: 'hard',
    tags: ['arrays', 'two-pointers', 'dynamic-programming'],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' }
    ],
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
      { input: '[4,2,3]', expectedOutput: '1', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {number[]} height\n * @return {number}\n */\nvar trap = function(height) {\n    \n};',
      python: 'class Solution:\n    def trap(self, height: List[int]) -> int:\n        pass',
      cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        \n    }\n};'
    },
    points: 40
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?',
    difficulty: 'easy',
    tags: ['dynamic-programming', 'math'],
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps' }
    ],
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '5', expectedOutput: '8', isHidden: true }
    ],
    starterCode: {
      javascript: '/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    \n};',
      python: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass',
      cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};'
    },
    points: 10
  }
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Question.deleteMany();

    const createdUsers = await User.create(users);
    
    // Assign created questions to the admin user
    const adminUserId = createdUsers[0]._id;
    const questionsWithAdmin = questions.map(q => ({ ...q, createdBy: adminUserId }));
    
    const createdQuestions = await Question.create(questionsWithAdmin);
    
    // Give the student user some solved problems
    const studentUser = createdUsers[1];
    studentUser.solvedProblems = [createdQuestions[0]._id, createdQuestions[1]._id];
    await studentUser.save({ validateBeforeSave: false });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData();
} else {
  importData();
}
