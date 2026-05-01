export interface KeystrokeLog {
  expected: string;
  actual: string;
  timestamp: number;
  isCorrect: boolean;
}

export interface TypingSessionResult {
  wpm: number;
  accuracy: number; // 0 to 100
  totalKeystrokes: number;
  incorrectKeystrokes: number;
  weakKeys: string[]; // Keys the user missed frequently
  errorFrequencyMap: Record<string, number>;
}

export class TypingAnalyzer {
  private logs: KeystrokeLog[] = [];
  private startTime: number | null = null;
  private endTime: number | null = null;

  startSession() {
    this.logs = [];
    this.startTime = Date.now();
    this.endTime = null;
  }

  logKeystroke(expected: string, actual: string) {
    if (this.startTime === null) {
      this.startTime = Date.now(); // Auto-start on first key
    }
    
    this.logs.push({
      expected,
      actual,
      timestamp: Date.now(),
      isCorrect: expected === actual
    });
  }

  endSession(): TypingSessionResult {
    this.endTime = Date.now();
    
    if (this.logs.length === 0) {
      return { wpm: 0, accuracy: 0, totalKeystrokes: 0, incorrectKeystrokes: 0, weakKeys: [], errorFrequencyMap: {} };
    }

    const durationMinutes = (this.endTime - (this.startTime || this.endTime)) / 1000 / 60;
    
    let correctCount = 0;
    const errorMap: Record<string, number> = {};

    this.logs.forEach(log => {
      if (log.isCorrect) {
        correctCount++;
      } else {
        errorMap[log.expected] = (errorMap[log.expected] || 0) + 1;
      }
    });

    const accuracy = (correctCount / this.logs.length) * 100;
    
    // Standard WPM calculation: (Characters / 5) / time
    // For competitive exams, sometimes it's gross WPM (total / 5 / t) or net WPM ((total - errors) / 5 / t)
    const grossWpm = (this.logs.length / 5) / (durationMinutes || 1); // fallback to 1 min avoiding infinity if instantaneous
    const netWpm = Math.max(0, grossWpm - (this.logs.length - correctCount) / (durationMinutes || 1));

    // Determine Weak Keys (keys with highest error count)
    const weakKeys = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1]) // Sort descending by error count
      .slice(0, 10) // Top 10 weak keys
      .filter(([_, count]) => count >= 1) 
      .map(([key, _]) => key);

    return {
      wpm: Math.round(netWpm),
      accuracy: Math.round(accuracy * 10) / 10, // 1 decimal
      totalKeystrokes: this.logs.length,
      incorrectKeystrokes: this.logs.length - correctCount,
      errorFrequencyMap: errorMap,
      weakKeys
    };
  }
}
