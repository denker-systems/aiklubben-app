import type { Translations } from './sv';

export const en: Translations = {
  // Common
  common: {
    continue: 'Continue',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    send: 'Send',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    done: 'Done',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Try again',
    check: 'Check',
    reset: 'Reset',
    seeAll: 'See all →',
    version: 'Version',
    xp: 'XP',
    days: 'days',
    lessons: 'lessons',
    badges: 'badges',
    level: 'Lvl',
    correctAnswer: 'Correct answer:',
    user: 'User',
    friend: 'Friend',
  },

  // Greetings
  greetings: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  },

  // Auth
  auth: {
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'your@email.com',
    login: 'Log in',
    signup: 'Create account',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Log in',
    fillAllFields: 'Please fill in all fields',
    unexpectedError: 'An unexpected error occurred',
    welcome: 'Welcome to AI Klubben',
  },

  // Navigation / Tab names
  nav: {
    home: 'Home',
    news: 'News',
    courses: 'Courses',
    content: 'Resources',
    profile: 'Profile',
  },

  // Tab bar
  tabs: {
    home: 'Home',
    news: 'News',
    courses: 'Courses',
    content: 'Resources',
    profile: 'Profile',
  },

  // Home Screen
  home: {
    dailyGoal: "Today's goal",
    keepLearning: 'Keep learning!',
    quickStart: 'Quick start',
    continueLearning: 'Continue learning',
    latestNews: 'Latest news',
    basicCourse: 'AI Basics',
    coursesAction: 'Courses',
    coursesSubtitle: 'Learn AI',
    newsAction: 'News',
    newsSubtitle: 'Latest news',
    resourcesAction: 'Resources',
    resourcesSubtitle: 'Tools & guides',
  },

  // News Screen
  news: {
    title: 'News',
    articles: 'ARTICLES',
  },

  // Courses Screen
  courses: {
    title: 'Courses',
    continueLearning: 'Continue learning',
    allCourses: 'All courses',
    swipeForMore: 'Swipe for more →',
    tapToOpenCourse: 'Tap to open the course',
    allLevels: 'All levels',
    resumeCourse: 'Resumes the course where you left off',
    continueWith: 'Continue with {{title}}',
  },

  // Content Screen
  content: {
    title: 'Resources',
    resources: 'Resources',
    resourcesDesc: 'Articles and guides',
    platforms: 'Platforms',
    platformsDesc: 'AI tools and services',
    events: 'Events',
    eventsDesc: 'Meetups and workshops',
  },

  // Profile Screen
  profile: {
    title: 'Profile',
    nextLevel: 'Next level:',
    streak: 'Streak',
    keepGoing: 'Keep going!',
    yourBadges: 'Your Badges',
    settings: 'Settings',
    settingsSubtitle: 'Account and app settings',
    logout: 'Log out',
    endSession: 'End your session',
  },

  // Settings Screen
  settings: {
    title: 'Settings',
    appSettings: 'APP SETTINGS',
    notifications: 'Notifications',
    darkMode: 'Dark mode',
    language: 'Language',
    accountSecurity: 'ACCOUNT & SECURITY',
    profileSettings: 'Profile settings',
    changePassword: 'Change password',
    privacySettings: 'Privacy settings',
    helpSupport: 'HELP & SUPPORT',
    support: 'Support',
    aboutApp: 'About the app',
    aboutSection: 'ABOUT THE APP',
    logoutConfirmTitle: 'Log out',
    logoutConfirmMessage: 'Are you sure you want to log out?',
    changePasswordMessage:
      'We will send a link to your email to reset your password.',
    changePasswordSendLink: 'Send link',
    changePasswordSent: 'Sent!',
    changePasswordSentMessage: 'Check your email to reset your password.',
    swedish: 'Svenska',
    english: 'English',
  },

  // About Screen
  about: {
    title: 'About AI Klubben',
    appName: 'AI Klubben',
    visionTitle: 'Our Vision',
    visionText:
      'AI Klubben was created with the goal of democratizing access to knowledge about artificial intelligence. We believe AI is a powerful tool that should be accessible to everyone, not just technical experts.',
    offerTitle: 'What we offer',
    offerText:
      'Through our platform, we offer curated content, educational materials, and a community for everyone who wants to explore the possibilities of AI in their daily life and work.',
  },

  // Support Screen
  supportScreen: {
    title: 'Support',
    heading: 'How can we help you?',
    description:
      'Do you have questions or need help with the app? Contact us through one of the channels below.',
    emailTitle: 'Email',
    emailDescription: 'Send us an email',
    chatTitle: 'Chat',
    chatDescription: 'Talk to our AI bot',
    sendMessage: 'Send a message',
    subject: 'Subject',
    subjectPlaceholder: 'What is your inquiry about?',
    message: 'Message',
    messagePlaceholder: 'Describe your issue...',
  },

  // Privacy Screen
  privacy: {
    title: 'Privacy Policy',
    privacyTitle: 'Our approach to privacy',
    privacyText:
      'AI Klubben cares about your privacy. We only collect information that is necessary to provide our services and improve your experience.',
    dataTitle: 'Data we collect',
    dataText:
      'We collect information that you provide directly, for example when you create an account or contact support. This includes name, email address, and usage statistics.',
    usageTitle: 'How we use your data',
    usageText:
      'Your data is used to personalize your content, send important updates, and analyze app usage to make improvements.',
    rightsTitle: 'Your rights',
    rightsText:
      'You have the right to request a copy of your data, correct incorrect information, or request that your data be permanently deleted from our systems.',
  },

  // Lessons
  lessons: {
    // Lesson Screen
    finishLesson: 'Finish',
    exitLessonAccessibility: 'Exit lesson',
    exitLessonHint: 'Opens dialog to confirm exit',

    // Lesson Dialog
    lessonOf: 'Lesson {{current}} of {{total}}',
    stepsCount: '{{count}} steps',
    startLesson: 'Start lesson',
    practiceAgain: 'Practice again',
    closeDialog: 'Close dialog',
    closeDialogHint: 'Closes the lesson preview',
    startsLesson: 'Starts {{title}}',
    locked: 'locked',
    completed: 'completed',
    inProgress: 'in progress',
    percentComplete: '{{progress}}% completed',
    available: 'available',

    // Celebration
    levelUp: 'Level Up!',
    perfect: 'Perfect! 🎉',
    wellDone: 'Well done! ✨',
    youAreNow: 'You are now {{level}}!',
    lessonComplete: 'You completed the lesson!',
    xpEarned: 'XP Earned',
    correctAnswers: 'Correct answers',
    streakDays: '{{count}} day streak!',
    streakKeep: 'Keep it up tomorrow to maintain it',
    continueButton: 'Continue →',

    // Game Over
    outOfLives: 'Out of lives!',
    gameOverMessage:
      "Don't worry, you can try again or come back later.",
    retryButton: 'Try again',
    exitButton: 'Exit',

    // Exit Modal
    exitTitle: 'Exit the lesson?',
    exitMessage:
      'Your progress will not be saved if you exit now.',
    exitContinue: 'Continue',
    exitConfirm: 'Exit',

    // Accessibility
    retryAccessibility: 'Try again from the beginning',
    exitAccessibility: 'Exit and go back to the course',
    continueAccessibility: 'Continue with the lesson',
    exitConfirmAccessibility: 'Exit the lesson without saving',
    readAndContinue: '📖 Read and tap Continue',
    stepOf: 'STEP {{current}} OF {{total}}',
  },

  // Greetings (extended for useGreeting hook)
  greetingsExtended: {
    morningMotivation: 'Let\'s start the day strong!',
    lateMorningMotivation: 'Perfect time for learning!',
    afternoonMotivation: 'A little break with AI?',
    eveningMotivation: 'Perfect time for some learning!',
    nightMotivation: 'Up late? Great job!',
    lateMorning: 'Hello',
    night: 'Good night',
  },

  // News Detail
  newsDetail: {
    articleNotFound: 'Article not found.',
    goBack: 'Go back',
    goBackAccessibility: 'Go back to news',
  },

  // Content Detail
  contentDetail: {
    contentNotFound: 'Content not found.',
    goBackAccessibility: 'Go back to content',
  },

  // Unit Header
  unitHeader: {
    goBackAccessibility: 'Go back',
    goBackHint: 'Navigates back to the course list',
  },

  // Step components
  steps: {
    writeAnswer: 'Write your answer...',
    chooseWords: 'CHOOSE WORDS',
    checkOrder: 'Check order',
    checkAnswer: 'Check',
    tapToSelect: 'Tap to choose this answer',
    useArrows: 'Use the arrows to arrange the steps',
    tapToHighlight: 'Tap the words to highlight them',
    wordsHighlighted: '{{count}} words highlighted',
    matched: 'matched',
    allPairsMatched: 'All pairs matched! 🎉',
    toSort: 'TO SORT',
    tapToAdd: 'Tap to add',
    empty: 'Empty',
    chooseCategoryFor: 'Choose category for "{{item}}"',
    chooseItemFirst: 'Choose an item first',
    copied: 'Copied!',
    copy: 'Copy',
    writeMinWords: 'Write at least {{count}} words',
    checkLines: 'Check ({{count}} {{unit}} selected)',
    linesSingular: 'line',
    linesPlural: 'lines',
    correctAnswerIs: 'Correct answer: {{answer}}',
    videoWatched: '✅ Video watched',
    videoWatch: '🎬 Watch the video to continue ({{progress}}%)',
    unmute: 'Unmute',
    mute: 'Mute',
    restartVideo: 'Restart video',
    pauseVideo: 'Pause video',
    playVideo: 'Play video',
    explanation: '💡 Explanation',
    studyCodeAndContinue: '📖 Study the code and tap Continue',
    codeCopied: 'Code copied',
    copyCode: 'Copy code',
    noTextAvailable: 'No text available for this question.',
    correctAnswer: 'Correct answer:',
    correctWords: 'Correct words:',
    correctFeedback: 'Correct!',
    incorrectFeedback: 'Wrong answer',
    trueLabel: 'TRUE',
    falseLabel: 'FALSE',
    allCorrect: 'All correct!',
    notQuite: 'Not quite',
    reflectionInfo: '💡 There is no right or wrong answer. Take your time to reflect on the question.',
  },

  // Feedback
  feedback: {
    correct: 'Correct! 🎉',
    incorrect: 'Not quite',
    correctAnswerLabel: 'Correct answer:',
    errorOnLine: 'Error on line:',
    line: 'Line',
  },

  // UI Components
  components: {
    dailyQuests: 'Daily Quests',
    allQuestsComplete: '🎉 All quests completed! +50 Bonus XP',
    readMore: 'Read more →',
    featured: 'Featured',
    bonusReward: 'Bonus reward!',
    tapToOpen: 'Tap to open',
    collect: 'Collect',
    newBadge: '🎉 New Badge!',
    awesome: 'Awesome!',
  },

  // Badges
  badges: {
    first_lesson: { name: 'First Step', description: 'Complete your first lesson' },
    lessons_10: { name: 'Knowledge Seeker', description: 'Complete 10 lessons' },
    lessons_50: { name: 'Bookworm', description: 'Complete 50 lessons' },
    lessons_100: { name: 'AI Academic', description: 'Complete 100 lessons' },
    streak_7: { name: 'Weekly Hero', description: '7 day streak' },
    streak_30: { name: 'Monthly Marathon', description: '30 day streak' },
    streak_100: { name: 'Legendary Streak', description: '100 day streak' },
    all_categories: { name: 'Know-it-all', description: 'Explore all categories' },
    first_article: { name: 'News Reader', description: 'Read your first article' },
    articles_20: { name: 'Well Informed', description: 'Read 20 articles' },
    first_share: { name: 'Sharing is Caring', description: 'Share your first content' },
    early_adopter: { name: 'Early Adopter', description: 'Joined during beta' },
    beta_tester: { name: 'Beta Tester', description: 'Helped test the app' },
  },

  // Daily Quests
  quests: {
    complete_lesson: { title: 'Lesson Master', description: 'Complete 1 lesson' },
    answer_correct: { title: 'Knowledge Hunter', description: 'Answer 5 questions correctly' },
    maintain_streak: { title: 'Streak Guardian', description: 'Maintain your streak' },
    perfect_lesson: { title: 'Perfectionist', description: 'Complete a lesson without mistakes' },
  },

  // Encouraging messages
  encouraging: {
    streakMaster: '🔥 {{count}} days in a row! You are a master!',
    streakGoing: '🔥 {{count}} days in a row! Keep going!',
    xpOver1000: '⭐ Over 1000 XP! Impressive!',
    xpHalfway: '⭐ Halfway to 1000 XP!',
    coursesMany: '📚 {{count}} courses completed!',
    coursesFirst: '📚 Great job with your first course!',
    default1: "Let's learn something new today! 🚀",
    default2: 'Your AI journey continues! 🧠',
    default3: 'Discover the world of AI! ✨',
    default4: 'Ready for the next step? 💪',
  },

  // Celebration messages
  celebration: {
    xp1: '🎉 Amazing! +XP!',
    xp2: '⭐ Points earned!',
    xp3: '✨ You are growing!',
    level1: '🎊 Congratulations! New level!',
    level2: '🏆 You leveled up!',
    level3: '🚀 Next level unlocked!',
    streak1: '🔥 Streak continues!',
    streak2: '💪 You keep going!',
    streak3: '⚡ Unstoppable!',
    course1: '📚 Course completed!',
    course2: '🎓 You did it!',
    course3: '✅ Complete!',
    badge1: '🏅 New badge!',
    badge2: '🎖️ Achievement unlocked!',
    badge3: '🌟 You earned it!',
  },

  // Menu
  menu: {
    openMenu: 'Open menu',
    openMenuHint: 'Opens the navigation menu',
    title: 'Menu',
    mainMenu: 'Main menu',
    myAccount: 'My account',
    supportInfo: 'Support & Info',
    homeSubtitle: 'Back to the start page',
    newsSubtitle: 'Latest in AI',
    contentTitle: 'Content',
    contentSubtitle: 'Courses and resources',
    myProfile: 'My Profile',
    myProfileSubtitle: 'Manage your membership',
    settingsSubtitle: 'App and account settings',
    supportSubtitle: 'Contact us',
    privacySubtitle: 'How we handle your data',
    aboutSubtitle: 'Get to know us better',
    logoutSubtitle: 'End your session',
  },
};
