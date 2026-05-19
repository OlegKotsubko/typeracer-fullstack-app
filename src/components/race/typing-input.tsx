"use client"

import { useState, useRef, useEffect } from "react"

import { isExactMatch } from "@/lib/typing-logic"

export function TypingInput({
  currentWord,
  onSubmitAction,
  onInputChangeAction,
  disabled,
}: {
  currentWord: string;
  onSubmitAction: () => void;
  onInputChangeAction: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const prevLengthRef = useRef(0)

  /* eslint-disable react-hooks/set-state-in-effect -- reset input when word changes */
  useEffect(() => {
    setValue("")
    prevLengthRef.current = 0
    onInputChangeAction("")
    inputRef.current?.focus()
  }, [currentWord, onInputChangeAction])
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    prevLengthRef.current = newValue.length

    if (newValue.endsWith(" ")) {
      const typed = newValue.trimEnd()
      if (isExactMatch(typed, currentWord)) {
        onInputChangeAction(newValue) // send "hello " to server before clearing
        setValue("")
        prevLengthRef.current = 0
        onSubmitAction()
      }
      // wrong word + space: ignore silently
      return
    }

    setValue(newValue)
    onInputChangeAction(newValue)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (isExactMatch(value, currentWord)) {
        onInputChangeAction(value + " ") // trailing space = submission signal for server
        setValue("")
        prevLengthRef.current = 0
        onSubmitAction()
      }
      e.preventDefault()
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
      <div>
        Alert some values
      </div>
      <p className="input-hint">
        <kbd>
          Space
        </kbd>
        {' '}
        or
        <kbd>
          Enter
        </kbd>
        {' '}
        to commit when the word is clean
      </p>
    </div>
  )
}
