"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { isExactMatch, inputHasError } from "@/lib/typing-logic";

export function TypingInput({
  currentWord,
  onSubmit,
  onInputChange,
  onMistake,
  disabled,
}: {
  currentWord: string;
  onSubmit: () => void;
  onInputChange: (value: string) => void;
  onMistake: () => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    setValue("");
    onInputChange("");
    inputRef.current?.focus();
  }, [currentWord, onInputChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;

    // Detect if a new character was added (not backspace)
    if (newValue.length > prevLengthRef.current) {
      const newChar = newValue[newValue.length - 1];
      const expectedChar = currentWord[newValue.length - 1];

      // Check if this keystroke is a mistake
      if (newValue.length > currentWord.length || newChar !== expectedChar) {
        onMistake();
      } else if (inputHasError(newValue.slice(0, -1), currentWord)) {
        // Previous chars had an error, so this one is also a mistake
        onMistake();
      }
    }

    prevLengthRef.current = newValue.length;

    // Check for space/enter submission attempt
    if (newValue.endsWith(" ")) {
      const typed = newValue.trimEnd();
      if (isExactMatch(typed, currentWord)) {
        setValue("");
        prevLengthRef.current = 0;
        onSubmit();
        return;
      }
      // Block space — word has errors or doesn't match
      return;
    }

    setValue(newValue);
    onInputChange(newValue);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (isExactMatch(value, currentWord)) {
        setValue("");
        prevLengthRef.current = 0;
        onInputChange("");
        onSubmit();
      }
      e.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Start typing..."
        className="text-lg font-mono"
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        Type the highlighted word. Fix mistakes with backspace.{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> or{" "}
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to submit when correct.
      </p>
    </div>
  );
}