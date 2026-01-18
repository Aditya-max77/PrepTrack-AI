
import { LearningPath, Domain, Level, Topic } from '../types';

export const DOMAIN_INFO = {
  DSA: {
    title: 'Data Structures & Algorithms',
    languages: ['C', 'C++', 'Python', 'JavaScript'],
    levels: ['Beginner', 'Intermediate', 'Expert'] as Level[],
    icon: '📊'
  },
  ML: {
    title: 'Machine Learning',
    languages: ['Python'],
    frameworks: ['Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch'],
    levels: ['Beginner', 'Intermediate', 'Expert'] as Level[],
    icon: '🤖'
  },
  DataScience: {
    title: 'Data Science',
    languages: ['Python', 'R', 'SQL'],
    levels: ['Beginner', 'Intermediate', 'Expert'] as Level[],
    icon: '📈'
  },
  CyberSecurity: {
    title: 'Cyber Security',
    languages: ['Python', 'Bash'],
    levels: ['Beginner', 'Intermediate', 'Expert'] as Level[],
    icon: '🛡️'
  },
  WebDev: {
    title: 'Web Development',
    languages: ['HTML', 'CSS', 'JavaScript'],
    levels: ['Beginner', 'Intermediate', 'Expert'] as Level[],
    icon: '🌐'
  }
};

// --- DATA SOURCE: C++ INTERMEDIATE DSA ---
const rawCppDsaData = [
  { id: 1, title: "Flowchart & Pseudocode + Installation", videoId: "VTLCoHnyACE" },
  { id: 2, title: "Variable, Data Types & Operators", videoId: "Dxu7GKtdbnA" },
  { id: 3, title: "Conditional Statements & Loops", videoId: "qR9U6bKxJ7g" },
  { id: 4, title: "Patterns", videoId: "rga_q2N7vU8" },
  { id: 5, title: "Functions", videoId: "P08Z_NC8GuY" },
  { id: 6, title: "Binary Number System", videoId: "xpy5NXiBFvA" },
  { id: 7, title: "Bitwise Operators, Data Type Modifiers & more", videoId: "r-u4uh3QvsQ" },
  { id: 8, title: "Array Data Structure - Part 1", videoId: "8wmn7k1TTcI" },
  { id: 9, title: "Vectors in C++ | Arrays Part 2", videoId: "NWg38xWYzEg" },
  { id: 10, title: "Kadane's Algorithm | Maximum Subarray Sum", videoId: "9IZYqostl2M" },
  { id: 11, title: "Majority Element | Moore's Voting Algorithm", videoId: "_xqIp2rj8bo" },
  { id: 12, title: "Time & Space Complexity", videoId: "PwKv8fOcriM" },
  { id: 13, title: "Buy/Sell Stock & Pow(X,N) - Leetcode", videoId: "WBzZCm46mFo" },
  { id: 14, title: "Container with Most Water | Two Pointer", videoId: "EbkMABpP52U" },
  { id: 15, title: "Product of Array Except Self | Leetcode 238", videoId: "TW2m8m_FNJE" },
  { id: 16, title: "Pointers in C++ | In Detail", videoId: "qYEjR6M0wSk" },
  { id: 17, title: "Binary Search Algorithm | Iterative & Recursive", videoId: "TbbSJrY5GqQ" },
  { id: 18, title: "Search in Rotated Sorted Array | Leetcode 33", videoId: "6WNZQBHWQJs" },
  { id: 19, title: "Peak Index in Mountain Array | Leetcode 852", videoId: "RjxD6UXGlhc" },
  { id: 20, title: "Single Element in Sorted Array | Binary Search", videoId: "qsbCBduIs40" },
  { id: 21, title: "Book Allocation Problem | Binary Search", videoId: "JRAByolWqhw" },
  { id: 22, title: "Painter's Partition Problem | Binary Search", videoId: "srsFN5OHBgw" },
  { id: 23, title: "Aggressive Cows Problem | Binary Search", videoId: "7wOzDqsfXy0" },
  { id: 24, title: "Sorting Algorithms | Bubble, Selection, Insertion", videoId: "1jCFUv-Xlqo" },
  { id: 25, title: "Sort 0s, 1s & 2s | DNF Sorting Algorithm", videoId: "J48aGjfjYTI" },
  { id: 26, title: "Merge Sorted Arrays & Next Permutation", videoId: "-1cLK6PaLsQ" },
  { id: 27, title: "C++ STL Complete Tutorial | One Shot", videoId: "okhdtEk1iKk" },
  { id: 28, title: "Setup C++ compiler on Mac", videoId: "varXreLWPRo" },
  { id: 29, title: "Strings & Character Arrays - Part 1", videoId: "MOSjYaVymcU" },
  { id: 30, title: "Valid Palindrome & Remove Occurrences", videoId: "dSRFgEs3a6A" },
  { id: 31, title: "Permutation in String", videoId: "VXewy91P0S4" },
  { id: 32, title: "Reverse Words in String", videoId: "RitppzIdMCo" },
  { id: 33, title: "String Compression | Leetcode 443", videoId: "cAB15h6-sWA" },
  { id: 34, title: "Maths for DSA | Sieve & Euclid's Algorithm", videoId: "Y4KdgqV1IqA" },
  { id: 35, title: "2D Arrays in C++ | Part 1", videoId: "lBL8327gq8I" },
  { id: 36, title: "Search a 2D Matrix - Variation I & II", videoId: "LEFFjgt5i6w" },
  { id: 37, title: "Spiral Matrix | Leetcode 54", videoId: "XMpdvwUObho" },
  { id: 38, title: "Two Sum, Duplicate, Repeating/Missing Values", videoId: "0Fxc_jKj2vo" },
  { id: 39, title: "3 Sum | Brute to Optimal | Leetcode 15", videoId: "K-RsltkN63w" },
  { id: 40, title: "4 Sum Problem | Optimal Approach", videoId: "X6sL8JTROLY" },
  { id: 41, title: "Subarray Sum Equals K", videoId: "KDH4mhFVvHw" },
  { id: 42, title: "Recursion Tutorial | Part 1", videoId: "9OsMG4fI4OY" },
  { id: 43, title: "Recursion Part 2 : Fibonacci, Binary Search", videoId: "4iT-GhvSKzc" },
  { id: 44, title: "Recursion Part 3 : Backtracking & Subsets", videoId: "pNzljlzDCiI" },
  { id: 45, title: "Permutations of Array/String | Backtracking", videoId: "N4gJDGdhpLw" },
  { id: 46, title: "N-Queens Problem | Backtracking", videoId: "BdSJnIdR-4s" },
  { id: 47, title: "Sudoku Solver | Backtracking", videoId: "70cP3qtJp-s" },
  { id: 48, title: "Rat in a Maze Problem", videoId: "D8Yze9CDDAw" },
  { id: 49, title: "Combination Sum | Backtracking", videoId: "jkgZw2WEaqA" },
  { id: 50, title: "Palindrome Partitioning", videoId: "aZ0B1eWkSVU" },
  { id: 51, title: "Merge Sort Algorithm", videoId: "cQDtOBTy7_Y" },
  { id: 52, title: "Major update & 1000M views celebration", videoId: "SBQfXK7q5K4" },
  { id: 53, title: "Quick Sort Algorithm", videoId: "8MNB0Mba_Dc" },
  { id: 54, title: "Count Inversions Problem", videoId: "ynnWDBTdVi0" },
  { id: 55, title: "KNIGHTS TOUR Problem", videoId: "Sp1jzttFVdE" },
  { id: 56, title: "OOPs Tutorial in One Shot", videoId: "mlIUKyZIUUU" },
  { id: 57, title: "Introduction to Linked List", videoId: "LyuuqCVkP5I" },
  { id: 58, title: "Reverse a Linked List", videoId: "R-CKBYnOv1U" },
  { id: 59, title: "Middle of a Linked List", videoId: "nzaHG0dme4g" },
  { id: 60, title: "Detect & Remove Cycle in Linked List", videoId: "-1E8ZMS0gSs" },
  { id: 61, title: "Merge Two Sorted Lists", videoId: "f8RPIb-0DDE" },
  { id: 62, title: "Copy List with Random Pointer", videoId: "8ze7Zopdsaw" },
  { id: 63, title: "Doubly Linked List Tutorial", videoId: "bO5DasTsaRQ" },
  { id: 64, title: "Circular Linked List", videoId: "e6lZY5Yha8U" },
  { id: 65, title: "Flatten a Doubly Linked List", videoId: "I8b0rff5F9M" },
  { id: 66, title: "Reverse Nodes in K-Group", videoId: "-swgIiMIlJo" },
  { id: 67, title: "Swap Nodes in Pairs", videoId: "wwbTMNVlFHQ" },
  { id: 68, title: "Introduction to STACKS", videoId: "0X-fV-1ir9c" },
  { id: 69, title: "Valid Parentheses | Stack", videoId: "NlHupEeDXzY" },
  { id: 70, title: "Stock Span Problem", videoId: "01vBuZyMfqk" },
  { id: 71, title: "Next Greater Element", videoId: "NKbExYwvjb0" },
  { id: 72, title: "Previous Smaller Element", videoId: "WnjUfBn9nZM" },
  { id: 73, title: "Design a Min Stack", videoId: "wHDm-N2m2XY" },
  { id: 74, title: "Largest Rectangle in Histogram", videoId: "ysy1o-QEj3k" },
  { id: 75, title: "Next Greater Element - II", videoId: "If--3pm9K3U" },
  { id: 76, title: "Trapping Rainwater Problem", videoId: "UHHp8USwx4M" },
  { id: 77, title: "The Celebrity Problem", videoId: "OZPmEA_8FM8" },
  { id: 78, title: "Implement LRU Cache", videoId: "GsY6y0iPaHw" },
  { id: 79, title: "Queue Data Structure Basics", videoId: "Khf9v67Ya30" },
  { id: 80, title: "Circular Queue in C++", videoId: "4mKKolshFD0" },
  { id: 81, title: "Implement Queue using Stack & vice versa", videoId: "sFvP5Ois0CE" },
  { id: 82, title: "First Unique Character in String", videoId: "sqyCBvEQN9c" },
  { id: 83, title: "Sliding Window Maximum", videoId: "XwG5cozqfaM" },
  { id: 84, title: "Gas Station | Greedy Approach", videoId: "SmTow5Ht4iU" },
  { id: 85, title: "Binary Trees & Traversal", videoId: "eKJrXBCRuNQ" },
  { id: 86, title: "Height & Node Count of Binary Tree", videoId: "7tzHzN_Ehus" },
  { id: 87, title: "Identical Tree & Subtree of another Tree", videoId: "tumW7jsjv68" },
  { id: 88, title: "Diameter of Binary Tree", videoId: "aPyDPImR5UM" },
  { id: 89, title: "Top View of a Binary Tree", videoId: "FGr-syrhvOA" },
  { id: 90, title: "Kth Level of a Binary Tree", videoId: "ze4JO_ODl3w" },
  { id: 91, title: "Lowest Common Ancestor in Binary Tree", videoId: "oX5D0uKOMck" },
  { id: 92, title: "Build Tree from Preorder & Inorder", videoId: "33b1M980cCA" },
  { id: 93, title: "Transform to Sum Tree", videoId: "TY6kEejJEM0" },
  { id: 94, title: "Binary Tree Paths", videoId: "AWJD__CfM6A" },
  { id: 95, title: "Maximum Width of Binary Tree", videoId: "rhz-csskg_A" },
  { id: 96, title: "Morris Inorder Traversal", videoId: "PUfADhkq1LI" },
  { id: 97, title: "Flatten Binary Tree to Linked List", videoId: "dU2Z5HWSGM0" },
  { id: 98, title: "Binary Search Trees (BSTs)", videoId: "RuF7dPfj27Q" },
  { id: 99, title: "Sorted Array to Balanced BST", videoId: "0s6sCjs_4g0" },
  { id: 100, title: "Validate Binary Search Tree", videoId: "dSBcCynP1nA" },
  { id: 101, title: "Min Distance between BST Nodes", videoId: "WZmjRXF_Zi4" },
  { id: 102, title: "Kth Smallest in BST", videoId: "Kq4BbvIhj44" },
  { id: 103, title: "Lowest Common Ancestor in BST", videoId: "ORxkZ12FrU4" },
  { id: 104, title: "Construct BST from Preorder", videoId: "-n5Ur1wE5Jc" },
  { id: 105, title: "Merge Two Binary Search Trees", videoId: "AiKZjCuy2k4" },
  { id: 106, title: "Recover BST", videoId: "0KGzfij_SCk" },
  { id: 107, title: "Largest BST in Binary Tree", videoId: "Pr-HFxp7npk" },
  { id: 108, title: "Populate Next Right Pointers", videoId: "a8VKpW1DsD8" },
  { id: 109, title: "BST Iterator", videoId: "dS1bKglre3A" },
  { id: 110, title: "Inorder Predecessor & Successor in BST", videoId: "IHNkql1tAnk" },
  { id: 111, title: "Introduction to Graphs", videoId: "RpgyCJBbl5E" },
  { id: 112, title: "BFS Traversal in Graphs", videoId: "scQITTLgFJo" },
  { id: 113, title: "DFS Traversal in Graphs", videoId: "3czYbhac160" },
  { id: 114, title: "Detect Cycle in Undirected Graph (DFS)", videoId: "OZClCpPQDR4" },
  { id: 115, title: "Detect Cycle in Undirected Graph (BFS)", videoId: "MIjOkApZ39g" },
  { id: 116, title: "Number of Islands Problem", videoId: "AME6baBpswY" },
  { id: 117, title: "Rotting Oranges Problem", videoId: "RmXo5SWkhCs" },
  { id: 118, title: "Detect Cycle in Directed Graph (DFS)", videoId: "AcppN5XFt24" },
  { id: 119, title: "Topological Sorting (DFS)", videoId: "0WIINUY12Yg" },
  { id: 120, title: "Course Schedule Problem", videoId: "37cJ38HadM4" },
  { id: 121, title: "Course Schedule II Problem", videoId: "rZsgWxodGmM" },
  { id: 122, title: "Flood Fill Algorithm", videoId: "JI_e2RzARbM" },
  { id: 123, title: "Topological Sorting (Kahn's Algorithm)", videoId: "BnQpaTZg6Sc" },
  { id: 124, title: "Dijkstra's Algorithm", videoId: "8gYBHjtjWBI" },
  { id: 125, title: "Bellman Ford Algorithm", videoId: "3rFHlbJ7qKc" },
  { id: 126, title: "New DSA Sheet | Advanced DP/Heaps preview", videoId: "YlmU4gBgePA" }
];

// --- DATA SOURCE: ML PANDAS BEGINNER ---
const rawMlPandasData = [
  { id: 1, title: "What is Data Analysis - Complete Introduction", videoId: "76H-8-mi1Cc" },
  { id: 2, title: "Data Structure - Series Explained", videoId: "JjuLJ3Sb_9U" },
  { id: 3, title: "Basics of DataFrames in Pandas", videoId: "U5njTAS1Oqw" },
  { id: 4, title: "Arithmetic Operators in Python Pandas", videoId: "mb8n9FgfbPI" },
  { id: 5, title: "How to Delete and Insert Data in Pandas", videoId: "Lbqj-wyBYsI" },
  { id: 6, title: "Python Pandas CSV Files - Complete Tutorial", videoId: "fl3ig6KtEQQ" },
  { id: 7, title: "Read Python CSV files with PANDAS", videoId: "ahNqJ6-FR5o" },
  { id: 8, title: "Pandas Functions - CSV Reading/Writing", videoId: "cD4Hw8_bdMc" },
  { id: 9, title: "Handling Missing Data (Dropna and Fillna)", videoId: "rnL312mXb2I" },
  { id: 10, title: "Handling Missing Data (Replace and Interpolate)", videoId: "Qanri0bWR3M" },
  { id: 11, title: "Merge and Concat DataFrames", videoId: "bRC3p_OZfgo" },
  { id: 12, title: "Pandas GroupBy Guide", videoId: "iCP7inz73vE" },
  { id: 13, title: "Join and Append DataFrames", videoId: "OQd34oUjmR0" },
  { id: 14, title: "Pivot Table and Melt Function", videoId: "SHrNHqJKBQc" }
];

const getDsaModule = (id: number) => {
  if (id <= 7) return "1. Basics & Environment";
  if (id <= 15) return "2. Arrays & Complexity";
  if (id <= 16) return "3. Pointers";
  if (id <= 23) return "4. Binary Search";
  if (id <= 26) return "5. Sorting Algorithms";
  if (id === 27) return "6. STL (Standard Template Library)";
  if (id <= 33) return "7. Strings & Characters";
  if (id === 34) return "8. Mathematical DSA";
  if (id <= 37) return "9. 2D Arrays";
  if (id <= 41) return "10. Hashing & Advanced Array Problems";
  if (id <= 55) return "11. Recursion & Backtracking";
  if (id === 56) return "12. Object Oriented Programming";
  if (id <= 67) return "13. Linked Lists";
  if (id <= 78) return "14. Stacks";
  if (id <= 84) return "15. Queues";
  if (id <= 97) return "16. Binary Trees";
  if (id <= 110) return "17. Binary Search Trees (BST)";
  return "18. Graphs";
};

const getMlModule = (id: number) => {
  if (id <= 3) return "1. Fundamentals & Structures";
  if (id <= 5) return "2. Data Operations";
  if (id <= 8) return "3. File Management";
  if (id <= 10) return "4. Data Cleaning";
  if (id <= 13) return "5. Combining Datasets";
  return "6. Advanced Reshaping";
};

const getQuestionsForTitle = (title: string): string[] => {
  return [
    `Implement the core concept of ${title.split('|')[0].trim()} from scratch.`,
    `Analyze the time and space complexity for your implementation of ${title}.`,
    `Solve 2 related challenges on LeetCode/CodeStudio for ${title.split(':')[0].trim()}.`
  ];
};

const generateTopicsFromData = (data: any[], domain: Domain): Topic[] => {
  return data.map(lec => ({
    id: `${domain.toLowerCase()}-lec-${lec.id}`,
    title: lec.title,
    moduleName: domain === 'DSA' ? getDsaModule(lec.id) : getMlModule(lec.id),
    description: `Professional session on ${lec.title}. Essential for technical placement preparation.`,
    resources: [
      { 
        title: `Video: ${lec.title}`, 
        url: `https://www.youtube.com/watch?v=${lec.videoId}`, 
        videoId: lec.videoId, 
        type: 'video' 
      },
      { title: `Reference Notes: ${lec.title}`, url: "#", type: 'notes' }
    ],
    practiceProblems: getQuestionsForTitle(lec.title)
  }));
};

const generateGenericTopics = (count: number, prefix: string, moduleName: string): Topic[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix.toLowerCase()}-${i + 1}`,
    title: `${prefix} Session ${i + 1}`,
    moduleName: moduleName,
    description: `Comprehensive training on ${prefix} concepts for placement excellence.`,
    resources: [
      { title: "Lecture: Yet to be Launched", url: "#", type: 'video' },
      { title: "Technical Documentation", url: "#", type: 'notes' }
    ],
    practiceProblems: [
      `Implement core ${prefix} logic from this session.`,
      `Solve 3 domain-specific coding challenges.`
    ]
  }));
};

const allCurriculumPaths: LearningPath[] = [];

// Helper to add paths
const addPath = (domain: Domain, tech: string, level: string, topics: Topic[]) => {
  allCurriculumPaths.push({
    id: `${domain.toLowerCase()}-${tech.toLowerCase()}-${level.toLowerCase()}`,
    domain,
    languageOrTech: tech,
    level,
    topics
  });
};

// --- POPULATE REQUESTED SPECIFIC TRACKS ---
// 1. C++ Intermediate DSA
addPath('DSA', 'C++', 'Intermediate', generateTopicsFromData(rawCppDsaData, 'DSA'));

// 2. Pandas Beginner ML
addPath('ML', 'Pandas', 'Beginner', generateTopicsFromData(rawMlPandasData, 'ML'));

// --- POPULATE OTHER TRACKS WITH PLACEHOLDERS ---
['C', 'Python', 'JavaScript'].forEach(lang => {
  ['Beginner', 'Intermediate', 'Expert'].forEach(lvl => {
    addPath('DSA', lang, lvl, generateGenericTopics(10, `${lang} DSA`, 'Algorithms Core'));
  });
});
addPath('DSA', 'C++', 'Beginner', generateGenericTopics(5, `C++ Basics`, 'Basics'));
addPath('DSA', 'C++', 'Expert', generateGenericTopics(15, `C++ Advanced`, 'Hard Core'));

['HTML', 'CSS', 'JavaScript'].forEach(tech => {
  ['Beginner', 'Intermediate', 'Expert'].forEach(lvl => {
    addPath('WebDev', tech, lvl, generateGenericTopics(8, tech, 'Frontend Engine'));
  });
});

['Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch'].forEach(framework => {
  ['Beginner', 'Intermediate', 'Expert'].forEach(lvl => {
    // Only skip the one we specifically populated above
    if (framework === 'Pandas' && lvl === 'Beginner') return;
    addPath('ML', framework, lvl, generateGenericTopics(12, framework, 'ML Architect'));
  });
});

['Python', 'R', 'SQL'].forEach(lang => {
  ['Beginner', 'Intermediate', 'Expert'].forEach(lvl => {
    addPath('DataScience', lang, lvl, generateGenericTopics(10, lang, 'Data Insights'));
  });
});

['Python', 'Bash'].forEach(tech => {
  ['Beginner', 'Intermediate', 'Expert'].forEach(lvl => {
    addPath('CyberSecurity', tech, lvl, generateGenericTopics(10, tech, 'Security Ops'));
  });
});

export const CURRICULUM: LearningPath[] = allCurriculumPaths;

export const MOCK_QUESTIONS: Record<Domain, any[]> = {
  DSA: [{ id: 'q1', text: 'Binary Search complexity?', options: ['O(n)', 'O(log n)', 'O(1)'], correctAnswer: 1 }],
  ML: [{ id: 'm1', text: 'What is pandas used for?', options: ['Data manipulation', 'Game dev'], correctAnswer: 0 }],
  DataScience: [{ id: 'ds1', text: 'What is SQL?', options: ['Query language', 'Coffee'], correctAnswer: 0 }],
  CyberSecurity: [{ id: 'c1', text: 'What is Nmap?', options: ['Scanner', 'Map'], correctAnswer: 0 }],
  WebDev: [{ id: 'w1', text: 'What is HTML?', options: ['Markup', 'Programming'], correctAnswer: 0 }]
};
