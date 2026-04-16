"use client";

type WordResult = "correct" | "incorrect";

export function TextDisplay({
  words,
  currentWordIndex,
  wordResults,
}: {
  words: string[];
  currentWordIndex: number;
  wordResults: WordResult[];
}) {
  return (
    <div
      className="p-6 bg-muted/30 rounded-lg border text-lg leading-relaxed"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {words.map((word, i) => {
        let className = "px-0.5 ";
        if (i < currentWordIndex) {
          className +=
            wordResults[i] === "correct"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400 line-through";
        } else if (i === currentWordIndex) {
          className +=
            "bg-primary/10 text-primary font-semibold rounded px-1 py-0.5";
        } else {
          className += "text-muted-foreground";
        }

        return (
          <span key={i} className={className}>
            {word}{" "}
          </span>
        );
      })}
    </div>
  );
}
