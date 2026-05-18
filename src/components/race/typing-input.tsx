"use client";

import { useState, useRef, useEffect } from "react";
import { isExactMatch } from "@/lib/typing-logic";

export function TypingInput({
  currentWord,
  onSubmit,
  onInputChange,
  disabled,
}: {
  currentWord: string;
  onSubmit: () => void;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(0);

  /* eslint-disable react-hooks/set-state-in-effect -- reset input when word changes */
  useEffect(() => {
    setValue("");
    prevLengthRef.current = 0;
    onInputChange("");
    inputRef.current?.focus();
  }, [currentWord, onInputChange]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    prevLengthRef.current = newValue.length;

    if (newValue.endsWith(" ")) {
      const typed = newValue.trimEnd();
      if (isExactMatch(typed, currentWord)) {
        onInputChange(newValue); // send "hello " to server before clearing
        setValue("");
        prevLengthRef.current = 0;
        onSubmit();
      }
      // wrong word + space: ignore silently
      return;
    }

    setValue(newValue);
    onInputChange(newValue);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (isExactMatch(value, currentWord)) {
        onInputChange(value + " "); // trailing space = submission signal for server
        setValue("");
        prevLengthRef.current = 0;
        onSubmit();
      }
      e.preventDefault();
    }
  }

  return (
    <div>
      <div className="input-row">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Burn the prompt..."
          disabled={disabled}
        />
      </div>
      <p className="input-hint">
        <kbd>Space</kbd> or <kbd>Enter</kbd> to commit when the word is clean
      </p>
    </div>
  );
}
