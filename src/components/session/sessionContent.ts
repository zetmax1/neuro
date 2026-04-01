// Lesson content for each topic used in Study Sessions
// Kept in a separate file so Session.tsx stays clean

export interface LessonContent {
  topic: string;
  title: string;
  duration: string; // e.g. "~12 min"
  summary: string;  // 2–3 sentence intro
  keyPoints: string[];
  codeExample?: {
    label: string;
    code: string;
  };
  quizTopicKey: string; // maps to topicConfig key in Assessment.tsx
}

export const sessionContent: Record<string, LessonContent> = {
  loops: {
    topic: "Loops Basics",
    title: "How loops work in programming",
    duration: "~10 min",
    summary:
      "Loops let you repeat a block of code multiple times without writing it out manually. They're one of the most fundamental tools in programming — you'll use them in almost every program you write.",
    keyPoints: [
      "A for loop runs a fixed number of times — great when you know the count upfront",
      "A while loop runs as long as a condition stays true — useful when the end point is unknown",
      "do…while always runs the body at least once before checking the condition",
      "break exits a loop immediately; continue skips to the next iteration",
      "Nested loops multiply iterations — a 3×3 nested loop runs the inner body 9 times",
    ],
    codeExample: {
      label: "for loop vs while loop — same result",
      code: `// using a for loop
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}

// same thing with a while loop
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}`,
    },
    quizTopicKey: "loops",
  },

  "data-structures": {
    topic: "Data Structures",
    title: "Organising data efficiently",
    duration: "~15 min",
    summary:
      "Data structures are ways of organising information so that a computer can use it efficiently. Choosing the right structure for the job makes your code faster and simpler.",
    keyPoints: [
      "Arrays store elements in order with fast index access — O(1)",
      "Linked lists allow fast insertion/deletion but slow lookup — O(n)",
      "Stacks follow LIFO (Last In, First Out) — think of a pile of plates",
      "Queues follow FIFO (First In, First Out) — think of a queue at a counter",
      "Hash tables give O(1) average lookup using a hash function",
      "Trees are hierarchical — binary trees have at most 2 children per node",
    ],
    codeExample: {
      label: "A simple stack using an array",
      code: `const stack = [];

stack.push('first');   // add to top
stack.push('second');
stack.push('third');

console.log(stack.pop()); // 'third'  ← LIFO
console.log(stack.pop()); // 'second'`,
    },
    quizTopicKey: "data-structures",
  },

  algorithms: {
    topic: "Algorithms",
    title: "Step-by-step problem solving",
    duration: "~12 min",
    summary:
      "An algorithm is a precise set of steps to solve a problem. Good algorithms are correct, efficient, and clear. Understanding how to measure and improve efficiency is the core skill of algorithmic thinking.",
    keyPoints: [
      "Time complexity measures how runtime grows with input size — we use Big O notation",
      "O(1) = constant, O(log n) = logarithmic, O(n) = linear, O(n²) = quadratic",
      "Binary search finds an element in O(log n) by halving the search space each step",
      "Divide and conquer splits a problem, solves each part, then merges results",
      "Dynamic programming stores sub-problem solutions to avoid repeating work",
    ],
    codeExample: {
      label: "Binary search — O(log n)",
      code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid; // found
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // not found
}`,
    },
    quizTopicKey: "algorithms",
  },
};

export const nextTopicMap: Record<string, { key: string; label: string; reason: string }> = {
  loops: {
    key: "data-structures",
    label: "Data Structures",
    reason: "Loops are used constantly when working with arrays and linked lists.",
  },
  "data-structures": {
    key: "algorithms",
    label: "Algorithms",
    reason: "Once you know the structures, you're ready to explore how to process them efficiently.",
  },
  algorithms: {
    key: "loops",
    label: "Loops – Advanced Patterns",
    reason: "Advanced loop patterns appear in almost every algorithm you'll implement.",
  },
};
