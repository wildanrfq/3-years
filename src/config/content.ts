/**
 * ============================================================================
 *  ALL TEXTS, IMAGES, SONG, AND SETTINGS — IN ONE FILE
 * ============================================================================
 *  You can edit every visible text, photo, date, PIN, and song on the website
 *  right here in `src/config/content.ts`.
 *
 *  HOW TO CHANGE IMAGES:
 *  1. Put your image files inside the `public/photos/` folder
 *     (recommended: `.webp` or `.jpg`, max width 1600px).
 *  2. Update the `photo` (or `photos`) paths below to `'photos/your-file.webp'`
 *     (do NOT add a leading `/` before `photos/`).
 *
 *  HOW TO CHANGE THE SONG & LYRICS:
 *  1. Replace `public/audio/sorak-sorai.mp3` (or change `song.audioSrc`).
 *  2. Replace `public/lyrics/sorak-sorai.lrc` (or change `song.lrcSrc`).
 *
 *  HOW TO CHANGE THE SECRET PIN:
 *  Run `npm run hash-pin YOUR_PIN` in the terminal and paste the generated
 *  hash into `pin.hash` below.
 * ============================================================================
 */

export type SectionId =
  | 'timeline'
  | 'counter'
  | 'rewind'
  | 'photocards'
  | 'letter';

export type TimelineIconName = 'sparkles' | 'coffee' | 'heart' | 'map-pin' | 'sun' | 'gift';

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  photo?: string;
  icon?: TimelineIconName;
}

export type RewindSlide =
  | {
      type: 'intro';
      eyebrow: string;
      title: string;
      subtitle: string;
    }
  | {
      type: 'countup';
      eyebrow: string;
      label: string;
      subtitle: string;
    }
  | {
      type: 'photo';
      eyebrow: string;
      photo: string;
      caption: string;
      date: string;
    }
  | {
      type: 'stat';
      eyebrow: string;
      statSource: 'photocards' | 'custom';
      customValue?: number;
      unit: string;
      title: string;
      subtitle: string;
    }
  | {
      type: 'carousel';
      eyebrow: string;
      title: string;
      photos: string[];
    }
  | {
      type: 'ranking';
      eyebrow: string;
      title: string;
      items: string[];
    }
  | {
      type: 'song';
      eyebrow: string;
      subtitle: string;
    }
  | {
      type: 'outro';
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaLabel: string;
    };

export interface PhotoCardItem {
  photo: string;
  caption: string;
  date: string;
  backNote: string;
}

export interface ContentConfig {
  partnerName: string;
  myName: string;
  startDate: string;
  siteTitle: string;
  pin: {
    hash: string;
    length: number;
    hint: string;
  };
  song: {
    title: string;
    artist: string;
    audioSrc: string;
    lrcSrc: string;
    lyricsOffsetMs: number;
    loop: boolean;
  };
  pinGate: {
    headingPrefix: string;
    subtitle: string;
    mascotUnlocked: string;
    mascotError: string;
    mascotRetryHint: string;
    forgotPinButton: string;
    hintPrefix: string;
    clearButton: string;
  };
  intro: {
    mascotGreeting: string;
    heading: string;
    description: string;
    startButton: string;
  };
  hub: {
    subtitle: string;
    mascotStart: string;
    mascotProgress: string;
    mascotAllDone: string;
    cardDescriptions: Record<SectionId, string>;
    lockedTimelineNotice: string;
    lockedPrevNotice: string;
    badgeOpened: string;
    badgeStartHere: string;
    badgeOpenNow: string;
    badgePartPrefix: string;
    replayIntroButton: string;
    lockSiteButton: string;
  };
  timeline: TimelineItem[];
  timelineUi: {
    progressLabel: string;
    nextCardTitle: string;
    nextCardSubtitle: string;
    nextCardButton: string;
    hiddenRemainingText: string;
    prevButton: string;
    nextButton: string;
    allOpenedMascot: string;
    restartButton: string;
  };
  counterUi: {
    unitLabels: {
      years: string;
      months: string;
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
    };
    anniversaryBannerTitle: string;
    anniversaryBannerBody: string;
    celebrateAgainButton: string;
    totalDaysLabel: string;
    totalDaysUnit: string;
    nextAnnivHeading: string;
  };
  rewind: RewindSlide[];
  photoCards: PhotoCardItem[];
  photoCardsUi: {
    stackTabLabel: string;
    gridTabLabel: string;
    prevButton: string;
    nextButton: string;
  };
  letter: {
    title: string;
    body: string[];
    signature: string;
  };
  letterUi: {
    mascotDefault: string;
    mascotHugCount: string;
    sendHugButton: string;
    restartButton: string;
  };
  musicPlayer: {
    playSongLabel: string;
    replaySongLabel: string;
    playLabel: string;
    pauseLabel: string;
  };
  navigation: {
    backToMenuButton: string;
    nextButton: string;
    lockedNextButton: string;
    mainMenuButton: string;
    continueToPrefix: string;
    backToMainMenuButton: string;
    sectionStepLabel: string;
    loadingPageText: string;
  };
}

/**
 * Chronological order of the 5 menus on the Main Menu (Hub) & Bottom Navigation.
 */
export const SECTION_ORDER: SectionId[] = [
  'timeline',
  'counter',
  'rewind',
  'photocards',
  'letter',
];

/**
 * Menu Titles, Short Labels, and Subtitles.
 * - Shown on: Main Menu (Hub) cards, top header of each menu page, and Bottom Navigation bar.
 */
export const SECTION_META: Record<
  SectionId,
  { title: string; shortLabel: string; subtitle: string }
> = {
  timeline: {
    title: 'early timeline', // Shown in: Main Menu Card #1 & timeline header
    shortLabel: 'timeline', // Shown in: Bottom Navigation back button
    subtitle: 'a few moments back in our early days.', // Shown in: timeline header
  },
  counter: {
    title: 'time together', // Shown in: Main Menu Card #2 & time together header
    shortLabel: 'time', // Shown in: Bottom Navigation back button
    subtitle: 'counting every second we have shared.', // Shown in: time together header
  },
  rewind: {
    title: 'our rewind', // Shown in: Main Menu Card #3 & our rewind header
    shortLabel: 'rewind', // Shown in: Bottom Navigation back button
    subtitle: 'a little recap of our favorite memories together.', // Shown in: our rewind header
  },
  photocards: {
    title: 'photo cards', // Shown in: Main Menu Card #4 & photo cards header
    shortLabel: 'photos', // Shown in: Bottom Navigation back button
    subtitle: 'snapshots of us with little notes on the back.', // Shown in: photo cards header
  },
  letter: {
    title: 'a letter for you', // Shown in: Main Menu Card #5 & a letter for you header
    shortLabel: 'letter', // Shown in: Bottom Navigation back button
    subtitle: 'a quiet closing note written slowly just for you.', // Shown in: a letter for you header
  },
};

export const content: ContentConfig = {
  // ==========================================================================
  // 1. GENERAL NAMES, ANNIVERSARY DATE & SITE TITLE
  // Shown in: Browser tab, PIN Gate, Welcome Screen, Main Menu, Counter & Letter
  // ==========================================================================
  partnerName: 'love', // Your partner's nickname (used in PIN Gate, Welcome Screen, Main Menu)
  myName: 'wildan', // Your name (used in Welcome Screen description)
  startDate: '2023-11-26T00:00:00+07:00', // Anniversary start date (ISO format with +07:00 WIB) -> drives time together & rewind day count
  siteTitle: 'our three years', // Shown in: Browser tab title, Welcome Screen badge, Main Menu heading

  // ==========================================================================
  // 2. PIN LOCK SCREEN (Shown first before entering the site)
  // ==========================================================================
  pin: {
    // Generate a new PIN hash with: npm run hash-pin YOUR_6_DIGIT_PIN
    hash: 'f809a4d73691e167f42514529fa6a0336c0c1bc256dc7d305858155efd214dc4',
    length: 6, // Number of PIN digits
    hint: 'our anniversary date (ddmmyy format)', // Shown on PIN Gate when wrong or user taps "forgot the code? see hint"
  },
  pinGate: {
    headingPrefix: 'hi,', // Shown on PIN Gate above keypad -> "hi, {partnerName}"
    subtitle: 'enter our {length}-digit secret code first.', // Shown on PIN Gate under heading
    mascotUnlocked: 'yay, it opened!', // Shown in Mascot bubble when PIN is correct
    mascotError: 'oops, not that code', // Shown in Mascot bubble when PIN is wrong
    mascotRetryHint: 'try checking the hint below', // Shown in Mascot bubble after a wrong attempt
    forgotPinButton: 'forgot the code? see hint', // Button under PIN keypad
    hintPrefix: 'hint:', // Prefix before pin.hint -> "hint: ..."
    clearButton: 'clear', // Clear button on PIN keypad
  },

  // ==========================================================================
  // 3. WELCOME / INTRO SCREEN (Shown right after unlocking the PIN)
  // ==========================================================================
  intro: {
    mascotGreeting: 'hi sayaang!', // Mascot bubble on Welcome Screen
    heading: 'a little something i made just for you', // Main headline on Welcome Screen
    description:
      'soo you will start some kinda journey here and i made 5 parts of them. sorak sorai will be playing in the background as u wander cuz i associate that song to u so much and i get happy everytime i listen to it ❤️', // Body paragraph on Welcome Screen
    startButton: 'start', // Main CTA button on Welcome Screen
  },

  // ==========================================================================
  // 4. MAIN MENU / HUB SCREEN (Shown after clicking "start")
  // ==========================================================================
  hub: {
    subtitle: 'our journey, opened one chapter at a time from start to finish.', // Subtitle under Main Menu title
    mascotStart: 'start with timeline first, {partnerName}!', // Mascot bubble before opening Menu 1
    mascotProgress: '{opened} of {total} chapters opened so far!', // Mascot bubble while progressing through menus
    mascotAllDone: 'all {total} chapters are open!', // Mascot bubble after all 5 menus are opened
    cardDescriptions: {
      timeline: 'some rewind of what we did in the early days.', // Shown on Main Menu Card 1
      counter: 'every little detail of time we have had.', // Shown on Main Menu Card 2
      rewind: 'our little highlight reel.', // Shown on Main Menu Card 3
      photocards: 'some of our photos taken with notes written behind.', // Shown on Main Menu Card 4
      letter: 'one warm final note just for you 💌', // Shown on Main Menu Card 5
    },
    lockedTimelineNotice: 'open every moment in timeline first before unlocking this.', // Shown on locked Card 2
    lockedPrevNotice: 'open {prevTitle} first before unlocking this.', // Shown on locked Cards 3, 4, 5
    badgeOpened: 'opened', // Green badge on completed Main Menu cards
    badgeStartHere: 'start here', // Highlight badge on Card 1 when starting
    badgeOpenNow: 'open next', // Highlight badge on the next unlocked card
    badgePartPrefix: 'part', // Badge prefix on locked cards -> "part 2", etc.
    replayIntroButton: 'replay welcome', // Footer link on Main Menu
    lockSiteButton: 'lock page', // Footer link on Main Menu to return to PIN Gate
  },

  // ==========================================================================
  // 5. MENU 1: TIMELINE (Horizontal Timeline)
  //    Each item becomes one horizontal card in Menu 1 ("timeline").
  //    Icons available: 'heart' | 'coffee' | 'map-pin' | 'sparkles' | 'sun' | 'gift'
  // ==========================================================================
  timeline: [
    {
      date: 'november 6th, 2023',
      title: 'your first direct message',
      description: 'it was my birthday, you said happy birthday to me and i replied "makasii indah radioheadd". indah radiohead was (or still is) your nickname to me for a long time. aku salting and langsung ngabarin askal 😁',
      photo: 'photos/memory-2.svg', // Image shown on timeline Card #2
      icon: 'coffee',
    },
    {
      date: 'november 25th, 2023',
      title: 'my first direct message',
      description: 'you played jump then fall by taylor swift on guitar and u posted it on your story. i hit u up and said that song was like my favorite off fearless. and we continue chatted for days.',
      photo: 'photos/memory-1.svg', // Image shown on timeline Card #1
      icon: 'heart',
    },
    {
      date: 'november 28th, 2023',
      title: 'our first unofficial date',
      description: 'it was a tuesday after school, you said you were going to give me something in return of the line theme i gave you. we met at rotbak lantai 2, chatted for some time, and we did our very first fotbar together. i put my arm around your shoulder spontaneously and the feeling is out of this world WKWKW',
      photo: 'photos/memory-4.svg', // Image shown on timeline Card #4
      icon: 'sparkles',
    },
    {
      date: 'december 2nd, 2023',
      title: 'i came over to ur house',
      description: 'one random morning, we chatted like usual and suddenly i asked if i could come over to ur house and mama approved me so i went and we spent our first day together just chilling at your terrace. though we never said it officially, that was the day we became us. 🫶',
      photo: 'photos/memory-3.svg', // Image shown on timeline Card #3
      icon: 'map-pin',
    },
    {
      date: 'december 10th, 2023',
      title: 'our first proper date',
      description: 'we went to the evermore anniversary event at tebet eco park. i cant believe our first date was that proper like it was an actual event that we both share the same interest on. we spent a wonderful time there 🧡',
      photo: 'photos/memory-5.svg', // Image shown on timeline Card #5
      icon: 'sun',
    },
  ],
  timelineUi: {
    progressLabel: 'memories opened', // Label inside top progress box in timeline
    nextCardTitle: 'next moment', // Title on the locked preview card on the right in timeline
    nextCardSubtitle: 'another little memory is waiting to be opened.', // Text inside locked preview card in timeline
    nextCardButton: 'open moment', // Button inside locked preview card in timeline
    hiddenRemainingText: '{remaining} hidden moments left', // Pill below Previous/Next buttons in timeline
    prevButton: 'previous', // Previous button label in timeline
    nextButton: 'next', // Next button label in timeline
    allOpenedMascot: 'all moments are open!', // Mascot message after opening all cards in timeline
    restartButton: 'replay from the start', // Replay button after finishing timeline
  },

  // ==========================================================================
  // 6. MENU 2: TIME TOGETHER (Live Counter)
  // ==========================================================================
  counterUi: {
    unitLabels: {
      years: 'years', // Shown in: time together flip clock
      months: 'months', // Shown in: time together flip clock
      days: 'days', // Shown in: time together flip clock & countdown
      hours: 'hours', // Shown in: time together flip clock & countdown
      minutes: 'minutes', // Shown in: time together flip clock & countdown
      seconds: 'seconds', // Shown in: time together flip clock & countdown
    },
    anniversaryBannerTitle: 'happy anniversary to us!', // Banner shown only on the exact anniversary day
    anniversaryBannerBody: 'today marks {years} years of our journey together.', // Banner subtext on anniversary day
    celebrateAgainButton: 'celebrate again', // Confetti button on anniversary banner
    totalDaysLabel: 'total days we have shared together', // Total days row label in time together
    totalDaysUnit: 'days', // Unit after total days number
    nextAnnivHeading: 'counting down to {year}th anniversary', // Countdown box heading in time together
  },

  // ==========================================================================
  // 7. MENU 3: OUR REWIND (Story Slides)
  //    Each object below is one slide (1/8 to 8/8) in Menu 3 ("our rewind").
  // ==========================================================================
  rewind: [
    {
      type: 'intro', // Slide 1: Opening title card in our rewind
      eyebrow: 'our rewind',
      title: 'three years full of stories',
      subtitle: 'let us look back at our favorite little moments together.',
    },
    {
      type: 'countup', // Slide 2: Animated total days counter in our rewind (number is calculated from startDate)
      eyebrow: 'total days together',
      label: 'days we have walked side by side',
      subtitle: 'from late-night talks to plans for tomorrow.',
    },
    {
      type: 'photo', // Slide 3: Featured single photo card in our rewind
      eyebrow: 'first favorite photo',
      photo: 'photos/memory-1.svg', // Image shown on our rewind Slide 3
      caption: 'your smile that day is still my favorite.',
      date: 'november 2023',
    },
    {
      type: 'stat', // Slide 4: Photo count highlight card in our rewind
      eyebrow: 'our photo stash',
      statSource: 'photocards', // Uses total number of items in `photoCards` below (or change to 'custom' with customValue)
      unit: 'memory cards',
      title: 'snapshots we have kept',
      subtitle: 'every frame holds a little story whenever we look back together.',
    },
    {
      type: 'carousel', // Slide 5: 3D spinning photo gallery in our rewind
      eyebrow: 'spinning gallery',
      title: 'pieces of our good days',
      photos: [
        'photos/photocard-1.jpg', // Carousel photo 1 in Slide 5
        'photos/photocard-2.jpg', // Carousel photo 2 in Slide 5
        'photos/photocard-3.jpg', // Carousel photo 3 in Slide 5
        'photos/photocard-4.jpg', // Carousel photo 4 in Slide 5
        'photos/photocard-5.jpg', // Carousel photo 5 in Slide 5
        'photos/photocard-6.jpg', // Carousel photo 6 in Slide 5
      ],
    },
    {
      type: 'ranking', // Slide 6: Top 5 list in our rewind
      eyebrow: 'favorite moments',
      title: 'five little things i miss the most',
      items: [
        'spontaneous evening snack runs',
        'laughing after missing a turn on the map',
        'listening to songs together on the ride home',
        'rushed photos that turned out adorable',
        'quiet talks right before falling asleep',
      ],
    },
    {
      type: 'song', // Slide 7: Spinning vinyl record in our rewind (uses song.title & song.artist)
      eyebrow: 'our song',
      subtitle: 'this song always brings me right back to our sweetest days.',
    },
    {
      type: 'outro', // Slide 8: Final rewind slide linking to photo cards
      eyebrow: 'up next',
      title: 'our photo cards are waiting',
      subtitle: 'there are little notes tucked behind each picture before the final letter.',
      ctaLabel: 'continue to photo cards',
    },
  ],

  // ==========================================================================
  // 8. MENU 4: PHOTO CARDS (Interactive Polaroid Stack & Grid)
  //    Each item is one flippable polaroid card in Menu 4 ("photo cards").
  // ==========================================================================
  photoCards: [
    {
      photo: 'photos/photocard-1.jpg', // Image on photo cards #1
      caption: 'our very first fotbar', // Front caption under photo
      date: '28 nov 2023', // Date on front & back
      backNote: 'outside roti bakar 88—the day i put my arm around your shoulder for the first time.', // Handwritten note on back of card
    },
    {
      photo: 'photos/photocard-2.jpg', // Image on photo cards #2
      caption: 'evermore long pond picnic',
      date: '10 dec 2023',
      backNote: 'our first proper date together at tebet eco park.',
    },
    {
      photo: 'photos/photocard-3.jpg', // Image on photo cards #3
      caption: 'matching school uniforms',
      date: 'our school days',
      backNote: 'making silly faces together between all the busy school days.',
    },
    {
      photo: 'photos/photocard-4.jpg', // Image on photo cards #4
      caption: 'under a golden sky',
      date: 'museum date',
      backNote: 'dressed in matching maroon among all the glowing yellow fish.',
    },
    {
      photo: 'photos/photocard-5.jpg', // Image on photo cards #5
      caption: 'two goofy faces',
      date: 'black & white',
      backNote: 'one of my favorite candid moments whenever you laugh this hard.',
    },
    {
      photo: 'photos/photocard-6.jpg', // Image on photo cards #6
      caption: 'caught on a retro tv',
      date: 'mirror snapshot',
      backNote: 'even through an old blue television screen, you are still my favorite view.',
    },
  ],
  photoCardsUi: {
    stackTabLabel: 'stack', // View toggle tab 1 in photo cards
    gridTabLabel: 'grid', // View toggle tab 2 in photo cards
    prevButton: 'previous', // Previous button under card stack in photo cards
    nextButton: 'next', // Next button under card stack in photo cards
  },

  // ==========================================================================
  // 9. MENU 5: A LETTER FOR YOU (Envelope & Typed Love Letter Finale)
  // ==========================================================================
  letter: {
    title: 'happy anniversary', // Letter heading (shown on envelope paper & typed at top of letter)
    body: [
      'thank you for walking beside me through these wonderful three years.',
      'in the middle of busy days and plans that go sideways, having you next to me always makes everything feel lighter.',
      'i am grateful for every little laugh, every late-night talk, and all the patience you have shared along the way.',
      'here is to the years ahead—may we keep being each other’s safest place and always find reasons to celebrate the simple things.',
    ], // Each string in this array is one paragraph in a letter for you
    signature: 'from wildan', // Handwritten signature at the bottom of the letter
  },
  letterUi: {
    mascotDefault: 'happy anniversary to us!', // Mascot message after letter finishes typing
    mascotHugCount: 'warm hug sent ({count}x)!', // Mascot message after clicking "send a hug"
    sendHugButton: 'send a hug', // Blush button at end of letter
    restartButton: 'replay from start', // Replay envelope button at end of letter
  },

  // ==========================================================================
  // 10. TOP MUSIC BAR & SHARED NAVIGATION (Shown across all menu pages)
  //     NOTE: Keep `sorak-sorai.lrc` lyrics untranslated as requested.
  // ==========================================================================
  song: {
    title: 'sorak sorai', // Song title shown in top-right Music Bar & rewind Slide 7
    artist: 'nadin amizah & syarikat idola remaja', // Artist name shown in top-right Music Bar & rewind Slide 7
    audioSrc: 'audio/sorak-sorai.mp3', // Audio file path inside `public/`
    lrcSrc: 'lyrics/sorak-sorai.lrc', // Synced LRC lyrics file path inside `public/`
    lyricsOffsetMs: 0, // Shift lyrics timing in milliseconds (+ or -) if out of sync
    loop: true,
  },
  musicPlayer: {
    playSongLabel: 'play song', // Button in top Music Bar when browser blocks autoplay
    replaySongLabel: 'play again', // Button in top Music Bar when song ends (if loop is false)
    playLabel: 'play', // Play button inside expanded top Music Bar
    pauseLabel: 'pause', // Pause button inside expanded top Music Bar
  },
  navigation: {
    backToMenuButton: 'back to menu', // Left button in floating Bottom Navigation bar
    nextButton: 'next', // Right button in floating Bottom Navigation bar
    lockedNextButton: 'finish first', // Disabled right button in Bottom Navigation while timeline isn't finished
    mainMenuButton: 'main menu', // Right button in Bottom Navigation on the final page
    continueToPrefix: 'continue to', // Bottom CTA button prefix -> "continue to time together"
    backToMainMenuButton: 'back to main menu', // Bottom CTA button on final page
    sectionStepLabel: 'part {current} of {total}', // Small top pill in every menu header
    loadingPageText: 'loading page...', // Shown briefly while a menu chunk loads
  },
};
