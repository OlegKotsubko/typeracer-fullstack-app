"use client"

export function ProgressPanel({
  progress,
  mistakes,
  wpm,
  totalCorrectChars,
}: {
  progress: number;
  mistakes: number;
  wpm: number;
  totalCorrectChars: number;
}) {
  const totalAttempted = totalCorrectChars + mistakes
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrectChars / totalAttempted) * 100) : 100

  return (
    <div className="hud">
      <div className="hud-cell">
        <div className="k">
          WPM
        </div>
        <div className="v">
          {wpm}
        </div>
      </div>
      <div className="hud-cell">
        <div className="k">
          Accuracy
        </div>
        <div className="v">
          {accuracy}
          %
        </div>
      </div>
      <div className="hud-cell">
        <div className="k">
          Mistakes
        </div>
        <div className="v">
          {mistakes}
        </div>
      </div>
      <div className="hud-cell">
        <div className="k">
          Progress
        </div>
        <div className="v">
          {progress}
          %
        </div>
      </div>
    </div>
  )
}
