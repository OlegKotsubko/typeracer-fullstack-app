export type CharResult = {
  char: string;
  status: "correct" | "incorrect";
};

export function validateInput(input: string, targetWord: string): CharResult[] {
  const results: CharResult[] = []
  let hasError = false

  for (let i = 0; i < input.length; i++) {
    if (hasError) {
      results.push({ char: input[i], status: "incorrect" })
      continue
    }

    if (i >= targetWord.length || input[i] !== targetWord[i]) {
      hasError = true
      results.push({ char: input[i], status: "incorrect" })
    } else {
      results.push({ char: input[i], status: "correct" })
    }
  }

  return results
}

export function inputHasError(input: string, targetWord: string): boolean {
  return validateInput(input, targetWord).some((c) => c.status === "incorrect")
}

export function isExactMatch(input: string, targetWord: string): boolean {
  return input === targetWord
}

export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs === 0) return 0
  const minutes = elapsedMs / 60000
  return Math.round((correctChars / 5) / minutes)
}