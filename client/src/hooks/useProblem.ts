import { useState, useCallback } from "react";

interface SolveCommand {
  command: "solve";
  problem: string;
  steps: string[];
  final_answer: string;
  streaming: boolean;
}

interface UseProblemDetectionReturn {
  isScratchpadOpen: boolean;
  currentProblem: string;
  currentSteps: string[];
  currentAnswer: string;
  isStreaming: boolean;
  openScratchpad: (solveData: SolveCommand) => void;
  closeScratchpad: () => void;
  detectProblemSolving: (message: string) => boolean;
}

export const useProblemDetection = (): UseProblemDetectionReturn => {
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [currentProblem, setCurrentProblem] = useState("");
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Problem-solving keywords and patterns
  const problemPatterns = [
    /solve.*problem/i,
    /calculate.*equation/i,
    /find.*solution/i,
    /work.*through/i,
    /step.*by.*step/i,
    /show.*work/i,
    /explain.*solution/i,
    /demonstrate.*solving/i,
    /walk.*through/i,
    /solve.*example/i,
    /help.*solve/i,
    /can.*you.*solve/i,
    /show.*how.*to/i,
    /work.*out/i,
    /figure.*out/i,
  ];

  const mathPatterns = [
    /\d+\s*[\+\-\*\/\^\%]\s*\d+/,
    /equation/i,
    /formula/i,
    /calculate/i,
    /integrate/i,
    /derivative/i,
    /algebra/i,
    /geometry/i,
    /trigonometry/i,
    /\b(sin|cos|tan|log|ln)\b/i,
  ];

  const codingPatterns = [
    /write.*code/i,
    /programming.*problem/i,
    /algorithm/i,
    /debug.*code/i,
    /fix.*bug/i,
    /implement.*function/i,
    /create.*program/i,
    /code.*example/i,
    /function.*that/i,
    /write.*script/i,
  ];

  const detectProblemSolving = useCallback((message: string): boolean => {
    const text = message.toLowerCase().trim();

    // Check for explicit problem-solving requests
    const hasProblemKeywords = problemPatterns.some((pattern) =>
      pattern.test(text)
    );

    // Check for math-related content
    const hasMathContent = mathPatterns.some((pattern) => pattern.test(text));

    // Check for coding requests
    const hasCodingContent = codingPatterns.some((pattern) =>
      pattern.test(text)
    );

    // Check for question format with numbers or technical terms
    const hasQuestionFormat =
      text.includes("?") &&
      (text.includes("how") ||
        text.includes("what") ||
        text.includes("calculate") ||
        text.includes("find"));

    return (
      hasProblemKeywords || hasMathContent || hasCodingContent || hasQuestionFormat
    );
  }, []);

  const openScratchpad = useCallback((solveData: SolveCommand) => {
    setCurrentProblem(solveData.problem);
    setCurrentSteps(solveData.steps);
    setCurrentAnswer(solveData.final_answer);
    setIsStreaming(solveData.streaming);
    setIsScratchpadOpen(true);
  }, []);

  const closeScratchpad = useCallback(() => {
    setIsScratchpadOpen(false);
    setCurrentProblem("");
    setCurrentSteps([]);
    setCurrentAnswer("");
    setIsStreaming(false);
  }, []);

  return {
    isScratchpadOpen,
    currentProblem,
    currentSteps,
    currentAnswer,
    isStreaming,
    openScratchpad,
    closeScratchpad,
    detectProblemSolving,
  };
};