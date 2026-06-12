const FocusSession = require('../models/FocusSession');
const FlashcardSet = require('../models/Flashcard');

exports.getPerformanceAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch user's focus sessions and flashcards
    const [sessions, flashcardSets] = await Promise.all([
      FocusSession.find({ user: userId, completed: true }),
      FlashcardSet.find({ user: userId })
    ]);

    // 1. Group focus session minutes by subject
    const subjectMinutes = {};
    sessions.forEach(session => {
      const sub = session.subject || 'General';
      subjectMinutes[sub] = (subjectMinutes[sub] || 0) + session.durationMin;
    });

    // 2. Group flashcard stats by subject
    const subjectFlashcards = {};
    flashcardSets.forEach(set => {
      const sub = set.subject || 'General';
      if (!subjectFlashcards[sub]) {
        subjectFlashcards[sub] = { total: 0, known: 0 };
      }
      if (set.cards && set.cards.length > 0) {
        subjectFlashcards[sub].total += set.cards.length;
        subjectFlashcards[sub].known += set.cards.filter(c => c.status === 'known' || c.repetitions > 1).length;
      }
    });

    // 3. Compute readiness metrics per subject
    // We combine all subjects mentioned in sessions or flashcards
    const allSubjects = new Set([
      ...Object.keys(subjectMinutes),
      ...Object.keys(subjectFlashcards)
    ]);

    const heatmap = [];
    let totalScore = 0;
    let subjectCount = 0;

    allSubjects.forEach(sub => {
      const mins = subjectMinutes[sub] || 0;
      const cardStats = subjectFlashcards[sub] || { total: 0, known: 0 };
      
      const cardMastery = cardStats.total > 0 ? (cardStats.known / cardStats.total) * 100 : 0;
      
      // Formula: 50% study time (target 120 mins) + 50% flashcard mastery
      const timeScore = Math.min(50, (mins / 120) * 50);
      const masteryScore = cardStats.total > 0 ? (cardMastery * 0.5) : 30; // fallback to 30% if no cards
      
      const readinessScore = Math.round(timeScore + masteryScore);
      
      let status = 'Critically Weak';
      let color = '#ef4444'; // Red
      
      if (readinessScore >= 70) {
        status = 'Exam Ready';
        color = '#22c55e'; // Green
      } else if (readinessScore >= 40) {
        status = 'Needs Practice';
        color = '#eab308'; // Yellow
      }

      heatmap.push({
        subject: sub,
        studyTimeMin: mins,
        flashcardMastery: Math.round(cardMastery),
        readinessScore,
        status,
        color
      });

      totalScore += readinessScore;
      subjectCount++;
    });

    // 4. Calculate predicted exam grade
    const avgScore = subjectCount > 0 ? totalScore / subjectCount : 0;
    let predictedGrade = 'F';
    let recommendation = 'Start logging focus sessions and creating flashcard sets to view prediction.';

    if (subjectCount > 0) {
      if (avgScore >= 90) {
        predictedGrade = 'A+';
        recommendation = 'Excellent prep! Keep reviewing flashcards via Spaced Repetition to maintain absolute recall.';
      } else if (avgScore >= 80) {
        predictedGrade = 'A';
        recommendation = 'Great standing. Focus on subjects marked "Needs Practice" to secure an A+.';
      } else if (avgScore >= 70) {
        predictedGrade = 'B';
        recommendation = 'Good performance. Increase Pomodoro focus time on critical chapters.';
      } else if (avgScore >= 50) {
        predictedGrade = 'C';
        recommendation = 'Warning: Moderate risk. Revise weak topics and clear doubts with the AI Socratic Tutor.';
      } else {
        predictedGrade = 'Fail Risk (D/F)';
        recommendation = 'Critical warning: High failure risk. Initiate immediate Socratic chat review sessions and double focus hours.';
      }
    }

    res.json({
      predictedGrade,
      averageReadiness: Math.round(avgScore),
      recommendation,
      heatmap
    });
  } catch (error) {
    next(error);
  }
};
