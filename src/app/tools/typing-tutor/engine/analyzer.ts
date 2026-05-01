export interface KeystrokeLog {
  expected: string;
  actual: string;
  timestamp: number;
  isCorrect: boolean;
}

export interface TypingSessionResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  backspaces: number;
  kph: number;
  timeSeconds: number;
  weakKeys: string[];
  errorFrequencyMap: Record<string, number>;
  mistakeTimeline: {expected: string, actual: string, index: number}[];
}

export class TypingAnalyzer {
  private logs: KeystrokeLog[] = [];
  private backspaceCount: number = 0;
  private mistakeTimeline: {expected: string, actual: string, index: number}[] = [];
  private startTime: number | null = null;
  private endTime: number | null = null;

  startSession() {
    this.logs = [];
    this.backspaceCount = 0;
    this.mistakeTimeline = [];
    this.startTime = Date.now();
    this.endTime = null;
  }

  logBackspace() {
    this.backspaceCount++;
  }

  logKeystroke(expected: string, actual: string, index: number) {
    if (this.startTime === null) this.startTime = Date.now();
    
    const isCorrect = expected === actual;
    if (!isCorrect) {
      this.mistakeTimeline.push({ expected, actual, index });
    }

    this.logs.push({
      expected,
      actual,
      timestamp: Date.now(),
      isCorrect
    });
  }

  endSession(): TypingSessionResult {
    this.endTime = Date.now();
    if (this.logs.length === 0) {
      return { wpm: 0, rawWpm: 0, accuracy: 0, kph: 0, totalKeystrokes: 0, correctKeystrokes: 0, incorrectKeystrokes: 0, backspaces: 0, timeSeconds: 0, weakKeys: [], errorFrequencyMap: {}, mistakeTimeline: [] };
    }

    const durationSeconds = (this.endTime - (this.startTime || this.endTime)) / 1000;
    const durationMinutes = durationSeconds / 60;
    
    let correctCount = 0;
    const errorMap: Record<string, number> = {};

    this.logs.forEach(log => {
      if (log.isCorrect) correctCount++;
      else errorMap[log.expected] = (errorMap[log.expected] || 0) + 1;
    });

    const accuracy = (correctCount / this.logs.length) * 100;
    
    // Standard WPM calculation: (Characters / 5) / time
    const grossWpm = (this.logs.length / 5) / (durationMinutes || 1);
    
    // SSC CGL Specific: (Correct Words - Errors) / Time. 
    // Word is defined as 5 keystrokes.
    const netWpm = Math.max(0, ((correctCount / 5) / (durationMinutes || 1)));
    
    // KPH (Keys Per Hour) - crucial for many Indian Govt exams
    const kph = Math.round((this.logs.length / (durationSeconds || 1)) * 3600);

    const weakKeys = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key]) => key);

    return {
      wpm: Math.round(netWpm),
      rawWpm: Math.round(grossWpm),
      accuracy: Math.round(accuracy * 10) / 10,
      kph,
      totalKeystrokes: this.logs.length,
      correctKeystrokes: correctCount,
      incorrectKeystrokes: this.logs.length - correctCount,
      backspaces: this.backspaceCount,
      timeSeconds: Math.round(durationSeconds),
      errorFrequencyMap: errorMap,
      weakKeys,
      mistakeTimeline: this.mistakeTimeline
    };
  }
}
