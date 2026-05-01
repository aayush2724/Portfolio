// Story chapters and scenes data
export const storyChapters = [
  {
    id: 1,
    title: "The Beginning",
    subtitle: "Where it all started",
    description: "Discover the origin story - when curiosity met code",
    color: "from-amber-500 to-orange-600",
    scenes: [
      {
        id: 1,
        text: "It all began with a simple question: 'What if I could build things?'",
        challenge: null,
      },
      {
        id: 2,
        text: "First line of code written. First error encountered. First lesson learned.",
        challenge: "challengeHelloWorld",
      },
    ],
  },
  {
    id: 2,
    title: "The Grind",
    subtitle: "Deep dive into fundamentals",
    description: "Data Structures, Algorithms, and countless 'Eureka!' moments",
    color: "from-cyan-500 to-blue-600",
    scenes: [
      {
        id: 1,
        text: "DSA (Data Structures & Algorithms) became the playground for problem-solving",
        challenge: "challengeDSA",
      },
      {
        id: 2,
        text: "Hundreds of problems. Hundreds of solutions. One growing confidence.",
        challenge: null,
      },
    ],
  },
  {
    id: 3,
    title: "Full Stack Rising",
    subtitle: "Frontend meets Backend",
    description: "Building complete applications - from pixels to databases",
    color: "from-purple-500 to-pink-600",
    scenes: [
      {
        id: 1,
        text: "Frontend: Turning ideas into beautiful, interactive interfaces",
        challenge: "challengeFrontend",
      },
      {
        id: 2,
        text: "Backend: Making sure everything works reliably behind the scenes",
        challenge: "challengeBackend",
      },
    ],
  },
  {
    id: 4,
    title: "Beyond Code",
    subtitle: "The developer who plays guitar",
    description: "Because code isn't everything - creativity is everywhere",
    color: "from-green-500 to-emerald-600",
    scenes: [
      {
        id: 1,
        text: "By day, a developer. By night, a Bollywood guitarist exploring rhythm and melody",
        challenge: null,
      },
      {
        id: 2,
        text: "Life is about balance - logic and art, algorithms and emotions",
        challenge: null,
      },
    ],
  },
  {
    id: 5,
    title: "Projects Showcase",
    subtitle: "Ideas turned into reality",
    description: "A collection of projects that shaped the journey",
    color: "from-yellow-500 to-amber-600",
    scenes: [
      {
        id: 1,
        text: "Each project tells a story of learning, experimentation, and growth",
        challenge: null,
      },
    ],
  },
];

// Challenges data
export const challenges = {
  challengeHelloWorld: {
    id: "challengeHelloWorld",
    title: "Hello, World!",
    difficulty: "Easy",
    description:
      "Your first challenge. Complete the function to return 'Hello, World!'",
    prompt: "function greet() {\n  // Return 'Hello, World!'\n}",
    testCases: [{ input: "", expected: "Hello, World!" }],
    solution: 'function greet() {\n  return "Hello, World!";\n}',
    xp: 50,
  },
  challengeDSA: {
    id: "challengeDSA",
    title: "Two Sum",
    difficulty: "Medium",
    description:
      "Given an array of numbers, find two numbers that add up to a target sum",
    prompt: `function twoSum(nums, target) {
  // Return indices of two numbers that add up to target
  // Example: twoSum([2, 7, 11, 15], 9) => [0, 1]
}`,
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    ],
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    xp: 100,
  },
  challengeFrontend: {
    id: "challengeFrontend",
    title: "React Component",
    difficulty: "Medium",
    description:
      "Create a React component that displays a button and counts clicks",
    prompt: `export default function Counter() {
  // Create a counter component that tracks button clicks
  // Display current count and increment on click
}`,
    testCases: [{ description: "Should render button and track clicks" }],
    solution: `export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  );
}`,
    xp: 100,
  },
  challengeBackend: {
    id: "challengeBackend",
    title: "API Endpoint",
    difficulty: "Medium",
    description: "Create an Express endpoint that returns user data",
    prompt: `app.get('/api/user/:id', (req, res) => {
  // Return user data based on ID
  // User data: { id, name, email }
})`,
    testCases: [{ description: "Should return correct user data" }],
    solution: `app.get('/api/user/:id', (req, res) => {
  const users = {
    1: { id: 1, name: 'Aayush', email: 'aayush@example.com' },
  };
  res.json(users[req.params.id] || { error: 'Not found' });
})`,
    xp: 100,
  },
};

// Achievements
export const achievements = [
  {
    id: "firstChallenge",
    title: "First Step",
    description: "Complete your first challenge",
    icon: "🎯",
  },
  {
    id: "dsa",
    title: "Algorithm Master",
    description: "Complete DSA challenges",
    icon: "🧠",
  },
  {
    id: "fullStack",
    title: "Full Stack Developer",
    description: "Complete frontend and backend challenges",
    icon: "🔗",
  },
  {
    id: "allChallenges",
    title: "Challenge Completed",
    description: "Complete all challenges",
    icon: "👑",
  },
];
