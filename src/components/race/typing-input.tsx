"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

export function TypingInput({
  currentWord,
  isLastWord,
  onSubmit,
  disabled,
}: {
  currentWord: string;
  isLastWord: boolean;
  onSubmit: (typed: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentWord]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;

    // Submit on space (not for last word)
    if (!isLastWord && newValue.endsWith(" ")) {
      const typed = newValue.trimEnd();
      if (typed.length > 0) {
        onSubmit(typed);
        setValue("");
        return;
      }
    }

    setValue(newValue);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Submit on Enter
    if (e.key === "Enter") {
      const typed = value.trim();
      if (typed.length > 0) {
        onSubmit(typed);
        setValue("");
      }
      e.preventDefault();
      return;
    }

    // Prevent undo of previous words: backspace on empty input is no-op
    // (default browser behavior already handles this correctly since input is empty)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground min-w-fit">
          Type:
        </span>
        <span className="text-sm font-mono font-semibold">{currentWord}</span>
      </div>
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
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd>{" "}
        or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to
        submit each word. You cannot undo previous words.
      </p>
    </div>
  );
}
