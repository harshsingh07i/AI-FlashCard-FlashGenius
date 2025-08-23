// Leitner Box System for Spaced Repetition
export interface CardProgress {
  cardId: string
  box: number // 1-5 (Leitner boxes)
  lastReviewed: Date
  nextReview: Date
  reviewCount: number
  correctStreak: number
  totalReviews: number
  correctReviews: number
}

export interface SpacedRepetitionCard {
  id: string
  question: string
  answer: string
  difficulty: "Easy" | "Medium" | "Hard"
  category?: string
  progress: CardProgress
}

// Leitner box intervals (in days)
const LEITNER_INTERVALS = {
  1: 1, // Review daily
  2: 3, // Review every 3 days
  3: 7, // Review weekly
  4: 14, // Review bi-weekly
  5: 30, // Review monthly
}

export class SpacedRepetitionSystem {
  static initializeCardProgress(cardId: string): CardProgress {
    const now = new Date()
    return {
      cardId,
      box: 1,
      lastReviewed: now,
      nextReview: new Date(now.getTime() + LEITNER_INTERVALS[1] * 24 * 60 * 60 * 1000),
      reviewCount: 0,
      correctStreak: 0,
      totalReviews: 0,
      correctReviews: 0,
    }
  }

  static updateCardProgress(progress: CardProgress, isCorrect: boolean): CardProgress {
    const now = new Date()
    const newProgress = { ...progress }

    newProgress.lastReviewed = now
    newProgress.reviewCount += 1
    newProgress.totalReviews += 1

    if (isCorrect) {
      newProgress.correctReviews += 1
      newProgress.correctStreak += 1

      // Move to next box (max box 5)
      if (newProgress.box < 5) {
        newProgress.box += 1
      }
    } else {
      newProgress.correctStreak = 0

      // Move back to box 1 on incorrect answer
      newProgress.box = 1
    }

    // Calculate next review date based on new box
    const intervalDays = LEITNER_INTERVALS[newProgress.box as keyof typeof LEITNER_INTERVALS]
    newProgress.nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)

    return newProgress
  }

  static getCardsForReview(cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] {
    const now = new Date()
    return cards.filter((card) => card.progress.nextReview <= now)
  }

  static getCardsByBox(cards: SpacedRepetitionCard[]): { [box: number]: SpacedRepetitionCard[] } {
    const boxGroups: { [box: number]: SpacedRepetitionCard[] } = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    }

    cards.forEach((card) => {
      boxGroups[card.progress.box].push(card)
    })

    return boxGroups
  }

  static getAccuracyRate(progress: CardProgress): number {
    if (progress.totalReviews === 0) return 0
    return Math.round((progress.correctReviews / progress.totalReviews) * 100)
  }

  static getDaysUntilNextReview(progress: CardProgress): number {
    const now = new Date()
    const diffTime = progress.nextReview.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  static getBoxName(box: number): string {
    const boxNames = {
      1: "Daily Review",
      2: "Every 3 Days",
      3: "Weekly",
      4: "Bi-weekly",
      5: "Monthly",
    }
    return boxNames[box as keyof typeof boxNames] || "Unknown"
  }

  static getBoxColor(box: number): string {
    const boxColors = {
      1: "bg-red-600/20 text-red-400 border-red-600/30",
      2: "bg-orange-600/20 text-orange-400 border-orange-600/30",
      3: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      4: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      5: "bg-green-600/20 text-green-400 border-green-600/30",
    }
    return boxColors[box as keyof typeof boxColors] || "bg-gray-600/20 text-gray-400 border-gray-600/30"
  }
}
