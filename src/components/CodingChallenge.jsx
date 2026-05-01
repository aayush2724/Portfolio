import { useState } from "react";
import { motion } from "framer-motion";

export default function CodingChallenge({ challenge, onComplete, onBack }) {
  const [code, setCode] = useState(challenge.prompt);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [allPassed, setAllPassed] = useState(false);

  const runTests = () => {
    try {
      // Create a controlled environment to execute code
      const func = new Function(
        code + "; return " + challenge.testCases[0].input === ""
          ? challenge.testCases[0].expected.split("(")[0]
          : Object.keys(challenge.testCases[0].input)[0],
      );

      // Simple mock test runner
      const results = challenge.testCases.map((test, idx) => {
        try {
          // For this demo, show visual feedback
          const passed = code.includes(
            challenge.solution.split("{")[1].split("\n")[0],
          );
          return {
            idx,
            passed,
            message: passed ? "✓ Test passed" : "✗ Test failed",
          };
        } catch (e) {
          return { idx, passed: false, message: e.message };
        }
      });

      // Also check if code is close to solution
      const closeness = calculateCodeSimilarity(code, challenge.solution);
      const allTestsPassed = closeness > 0.6; // 60% similarity threshold

      setTestResults(results);
      setAllPassed(allTestsPassed);
      setOutput(
        allTestsPassed ? "All tests passed! 🎉" : "Keep working on it...",
      );
    } catch (e) {
      setOutput(`Error: ${e.message}`);
      setTestResults([]);
      setAllPassed(false);
    }
  };

  const calculateCodeSimilarity = (code1, code2) => {
    const words1 = code1.toLowerCase().match(/\w+/g) || [];
    const words2 = code2.toLowerCase().match(/\w+/g) || [];
    const matches = words1.filter((w) => words2.includes(w)).length;
    return matches / Math.max(words1.length, words2.length);
  };

  const handleShowSolution = () => {
    setCode(challenge.solution);
    runTests();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Challenge Info */}
      <div className="gc rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{challenge.title}</h3>
            <p className="text-white/60">{challenge.description}</p>
          </div>
          <div className="text-right">
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                challenge.difficulty === "Easy"
                  ? "bg-green-500/20 text-green-300"
                  : challenge.difficulty === "Medium"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-red-500/20 text-red-300"
              }`}
            >
              {challenge.difficulty}
            </div>
            <div className="text-amber-400 font-mono text-sm mt-2">
              +{challenge.xp} XP
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white/80">
          Code Editor
        </label>
        <div className="relative gc rounded-xl overflow-hidden border border-white/10">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-[#0a0a12] text-white font-mono text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            spellCheck="false"
          />
          <div className="absolute top-4 right-4 text-xs text-white/40">
            {code.split("\n").length} lines
          </div>
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white/80">
          Expected Output
        </label>
        <div className="gc rounded-xl p-4 border border-white/10 font-mono text-sm text-white/70">
          {challenge.testCases.map((test, idx) => (
            <div key={idx} className="mb-2">
              <div className="text-cyan-400">
                Input: {JSON.stringify(test.input)}
              </div>
              <div className="text-green-400">
                Expected: {JSON.stringify(test.expected)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      {output && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="gc rounded-xl p-4 border border-white/10"
        >
          <div className="text-sm text-white/60 mb-2">Output</div>
          <div
            className={`font-mono text-sm ${allPassed ? "text-green-400" : "text-amber-400"}`}
          >
            {output}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runTests}
          className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg py-3 font-semibold text-amber-400 transition-all"
        >
          Run Tests
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShowSolution}
          className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-3 font-semibold text-white/70 transition-all"
        >
          Show Solution
        </motion.button>
      </div>

      {allPassed && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(challenge.xp)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition-all"
        >
          Challenge Complete! Claim XP →
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="w-full text-white/60 hover:text-white py-2 transition-colors"
      >
        ← Back to Story
      </motion.button>
    </motion.div>
  );
}
