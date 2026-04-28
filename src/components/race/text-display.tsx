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
      className="race-text"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {words.map((word, i) => {
        if (i < completedWords) {
          return (
            <span key={i} className="w done">
              {word.split("").map((char, ci) => (
                <span key={ci} className="ch ok">{char}</span>
              ))}{" "}
            </span>
          );
        }

        if (i === currentWordIndex) {
          const charResults = validateInput(currentInput, word);
          const caretIdx = currentInput.length;
          return (
            <span key={i} className="w cur">
              {word.split("").map((char, ci) => {
                const result = charResults[ci];
                let cls = "ch";
                if (result) {
                  cls += result.status === "correct" ? " ok" : " err";
                }
                if (ci === caretIdx) cls += " caret";
                return (
                  <span key={ci} className={cls}>
                    {char}
                  </span>
                );
              })}
              {currentInput.length > word.length && (
                <span className="ch err">
                  {currentInput.slice(word.length)}
                </span>
              )}
              {" "}
            </span>
          );
        }

        return (
          <span key={i} className="w">
            {word.split("").map((char, ci) => (
              <span key={ci} className="ch">{char}</span>
            ))}{" "}
          </span>
        );
      })}
    </div>
  );
}
