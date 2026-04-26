"use client";

import { validateInput } from "@/lib/typing-logic";

export function TextDisplay({
  words,
  currentWordIndex,
  completedWords,
  currentInput,
}: {
  words: string[];
  currentWordIndex: number;
  completedWords: number;
  currentInput: string;
}) {
  return (
    <div
      className="p-6 bg-muted/30 rounded-lg border text-lg leading-relaxed font-mono"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {words.map((word, i) => {
        if (i < completedWords) {
          // Completed word — always green (all submitted words are correct)
          return (
            <span key={i} className="px-0.5 text-green-600 dark:text-green-400">
              {word}{" "}
            </span>
          );
        }

        if (i === currentWordIndex) {
          // Current word — show character-level coloring
          const charResults = validateInput(currentInput, word);
          return (
            <span key={i} className="px-0.5">
              {word.split("").map((char, ci) => {
                const result = charResults[ci];
                let className = "";
                if (result) {
                  className =
                    result.status === "correct"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
                } else {
                  className = "text-muted-foreground";
                }
                return (
                  <span key={ci} className={className}>
                    {char}
                  </span>
                );
              })}
              {/* Show overflow chars (typed beyond word length) */}
              {currentInput.length > word.length && (
                <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
                  {currentInput.slice(word.length)}
                </span>
              )}
              {" "}
            </span>
          );
        }

        // Future word
        return (
          <span key={i} className="px-0.5 text-muted-foreground">
            {word}{" "}
          </span>
        );
      })}
    </div>
  );
}