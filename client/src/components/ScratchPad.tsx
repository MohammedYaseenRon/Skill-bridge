"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Copy,
  CheckCircle,
} from "lucide-react";

interface SolvingStep {
  id: string;
  content: string;
  type: "problem" | "step" | "calculation" | "answer";
  timestamp: Date;
}

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  problem: string;
  steps: string[];
  finalAnswer: string;
  isStreaming: boolean;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  isOpen,
  onClose,
  problem,
  steps,
  finalAnswer,
  isStreaming,
}) => {
  const [solvingSteps, setSolvingSteps] = useState<SolvingStep[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with problem when opened
  useEffect(() => {
    if (isOpen && problem) {
      setSolvingSteps([
        {
          id: "problem",
          content: problem,
          type: "problem",
          timestamp: new Date(),
        },
      ]);
      setCurrentStepIndex(0);
      setIsAnimating(true);
    }
  }, [isOpen, problem]);

  // Stream steps one by one with animation
  useEffect(() => {
    if (!isStreaming || currentStepIndex >= steps.length) return;

    const timer = setTimeout(() => {
      const stepContent = steps[currentStepIndex];
      const newStep: SolvingStep = {
        id: `step-${currentStepIndex}`,
        content: stepContent,
        type: "step",
        timestamp: new Date(),
      };

      setSolvingSteps((prev) => [...prev, newStep]);
      setCurrentStepIndex((prev) => prev + 1);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, 1500); // 1.5 second delay between steps

    return () => clearTimeout(timer);
  }, [isStreaming, currentStepIndex, steps]);

  // Add final answer when all steps are done
  useEffect(() => {
    if (
      !isStreaming &&
      finalAnswer &&
      currentStepIndex >= steps.length &&
      steps.length > 0
    ) {
      const timer = setTimeout(() => {
        setSolvingSteps((prev) => [
          ...prev,
          {
            id: "final-answer",
            content: finalAnswer,
            type: "answer",
            timestamp: new Date(),
          },
        ]);
        setIsAnimating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isStreaming, finalAnswer, currentStepIndex, steps.length]);

  const handleReset = () => {
    setSolvingSteps([]);
    setCurrentStepIndex(0);
    setIsAnimating(false);
  };

  const handleCopy = () => {
    const content = solvingSteps.map((step) => step.content).join("\n\n");
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const content = solvingSteps
      .map((step) => {
        const prefix =
          step.type === "problem"
            ? "PROBLEM: "
            : step.type === "answer"
            ? "FINAL ANSWER: "
            : `STEP ${step.id.split("-")[1]}: `;
        return prefix + step.content;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${
        isMaximized ? "p-0" : ""
      }`}
    >
      <Card
        className={`shadow-2xl transition-all duration-300 ${
          isMaximized
            ? "w-full h-full rounded-none"
            : "w-full max-w-4xl h-[90vh] rounded-lg"
        } flex flex-col`}
      >
        {/* Header */}
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="font-serif text-lg text-blue-900">
                  AI Problem Solver
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={isAnimating ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isAnimating ? "Solving..." : "Complete"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Steps: {solvingSteps.length - 1}/{steps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="hover:bg-blue-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="hover:bg-blue-100"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="hover:bg-yellow-100"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                className="hover:bg-gray-100"
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full p-6" ref={scrollRef}>
            <div className="space-y-6 max-w-none">
              {solvingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`animate-in slide-in-from-bottom-2 duration-500 ${
                    step.type === "problem"
                      ? "border-l-4 border-l-blue-500 pl-4 bg-blue-50/50 rounded-r-lg p-4"
                      : step.type === "answer"
                      ? "border-l-4 border-l-green-500 pl-4 bg-green-50/50 rounded-r-lg p-4"
                      : "border-l-4 border-l-gray-300 pl-4 bg-gray-50/50 rounded-r-lg p-4"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        step.type === "problem"
                          ? "border-blue-300 text-blue-700"
                          : step.type === "answer"
                          ? "border-green-300 text-green-700"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      {step.type === "problem"
                        ? "PROBLEM"
                        : step.type === "answer"
                        ? "FINAL ANSWER"
                        : `STEP ${index}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {step.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`whitespace-pre-wrap leading-relaxed font-mono text-sm ${
                      step.type === "problem"
                        ? "text-blue-900 font-semibold text-base"
                        : step.type === "answer"
                        ? "text-green-900 font-bold text-base"
                        : "text-gray-800"
                    }`}
                  >
                    {step.content}
                  </div>

                  {/* Show streaming indicator for current step */}
                  {isAnimating &&
                    index === solvingSteps.length - 1 &&
                    step.type === "step" && (
                      <div className="flex items-center mt-3 space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span className="text-xs text-blue-600">
                          Working on next step...
                        </span>
                      </div>
                    )}
                </div>
              ))}

              {/* Show completion indicator */}
              {!isAnimating && solvingSteps.length > 1 && (
                <div className="text-center py-4">
                  <Badge variant="default" className="bg-green-500">
                    ✅ Solution Complete
                  </Badge>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};