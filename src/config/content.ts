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
    waitingLyricsLabel: string;
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
    title: 'Jejak Kita', // Shown in: Main Menu Card #1 & Jejak Kita header
    shortLabel: 'Jejak', // Shown in: Bottom Navigation back button
    subtitle: 'Potongan cerita kecil dari awal sampai hari ini.', // Shown in: Jejak Kita header
  },
  counter: {
    title: 'Waktu Bersama', // Shown in: Main Menu Card #2 & Waktu Bersama header
    shortLabel: 'Waktu', // Shown in: Bottom Navigation back button
    subtitle: 'Menghitung setiap detik yang sudah kita lewati.', // Shown in: Waktu Bersama header
  },
  rewind: {
    title: 'Kilas Balik', // Shown in: Main Menu Card #3 & Kilas Balik header
    shortLabel: 'Rewind', // Shown in: Bottom Navigation back button
    subtitle: 'Rangkuman momen paling seru versi kita berdua.', // Shown in: Kilas Balik header
  },
  photocards: {
    title: 'Kartu Foto', // Shown in: Main Menu Card #4 & Kartu Foto header
    shortLabel: 'Foto', // Shown in: Bottom Navigation back button
    subtitle: 'Potret kenangan dan catatan kecil di baliknya.', // Shown in: Kartu Foto header
  },
  letter: {
    title: 'Surat Untukmu', // Shown in: Main Menu Card #5 & Surat Untukmu header
    shortLabel: 'Surat', // Shown in: Bottom Navigation back button
    subtitle: 'Catatan penutup yang ditulis pelan-pelan buat kamu.', // Shown in: Surat Untukmu header
  },
};

export const content: ContentConfig = {
  // ==========================================================================
  // 1. GENERAL NAMES, ANNIVERSARY DATE & SITE TITLE
  // Shown in: Browser tab, PIN Gate, Welcome Screen, Main Menu, Counter & Letter
  // ==========================================================================
  partnerName: 'Sayang', // Your partner's nickname (used in PIN Gate, Welcome Screen, Main Menu)
  myName: 'Wildan', // Your name (used in Welcome Screen description)
  startDate: '2023-11-26T00:00:00+07:00', // Anniversary start date (ISO format with +07:00 WIB) -> drives Waktu Bersama & Kilas Balik day count
  siteTitle: 'Tiga Tahun Kita', // Shown in: Browser tab title, Welcome Screen badge, Main Menu heading

  // ==========================================================================
  // 2. PIN LOCK SCREEN (Shown first before entering the site)
  // ==========================================================================
  pin: {
    // Generate a new PIN hash with: npm run hash-pin YOUR_6_DIGIT_PIN
    hash: 'f809a4d73691e167f42514529fa6a0336c0c1bc256dc7d305858155efd214dc4',
    length: 6, // Number of PIN digits
    hint: 'Tanggal jadian kita (format DDMMYY)', // Shown on PIN Gate when wrong or user taps "Lihat petunjuk"
  },
  pinGate: {
    headingPrefix: 'Hai,', // Shown on PIN Gate above keypad -> "Hai, {partnerName}"
    subtitle: 'Masukkan {length} angka rahasia kita dulu ya.', // Shown on PIN Gate under heading
    mascotUnlocked: 'Yeay, kebuka!', // Shown in Mascot bubble when PIN is correct
    mascotError: 'Ups, bukan itu kodenya', // Shown in Mascot bubble when PIN is wrong
    mascotRetryHint: 'Coba lihat petunjuknya ya', // Shown in Mascot bubble after a wrong attempt
    forgotPinButton: 'Lupa kodenya? Lihat petunjuk', // Button under PIN keypad
    hintPrefix: 'Petunjuk:', // Prefix before pin.hint -> "Petunjuk: ..."
    clearButton: 'Ulang', // Clear button on PIN keypad
  },

  // ==========================================================================
  // 3. WELCOME / INTRO SCREEN (Shown right after unlocking the PIN)
  // ==========================================================================
  intro: {
    mascotGreeting: 'Hai {partnerName}, akhirnya kebuka juga!', // Mascot bubble on Welcome Screen
    heading: 'Ada tempat kecil yang kubuat buat kamu', // Main headline on Welcome Screen
    description:
      'Di dalamnya ada cerita kita, penghitung waktu, kilas balik, kartu foto, sampai surat kecil dari {myName}. Lagunya juga jalan terus di pojok kanan atas sambil kamu baca.', // Body paragraph on Welcome Screen
    startButton: 'Mulai', // Main CTA button on Welcome Screen
  },

  // ==========================================================================
  // 4. MAIN MENU / HUB SCREEN (Shown after clicking "Mulai")
  // ==========================================================================
  hub: {
    subtitle: 'Perjalanan kita, dibuka satu per satu dari awal sampai akhir.', // Subtitle under Main Menu title
    mascotStart: 'Mulai dari Jejak Kita dulu ya, {partnerName}!', // Mascot bubble before opening Menu 1
    mascotProgress: '{opened} dari {total} bagian sudah kamu buka!', // Mascot bubble while progressing through menus
    mascotAllDone: 'Semua {total} bagian sudah terbuka!', // Mascot bubble after all 5 menus are opened
    cardDescriptions: {
      timeline: 'Dari hari pertama sampai sekarang.', // Shown on Main Menu Card 1 (Jejak Kita)
      counter: 'Detik demi detik yang kita jalani.', // Shown on Main Menu Card 2 (Waktu Bersama)
      rewind: 'Cerita kilas balik versi kita.', // Shown on Main Menu Card 3 (Kilas Balik)
      photocards: 'Foto kenangan beserta catatan kecilnya.', // Shown on Main Menu Card 4 (Kartu Foto)
      letter: 'Catatan hangat paling akhir buat kamu.', // Shown on Main Menu Card 5 (Surat Untukmu)
    },
    lockedTimelineNotice: 'Buka semua cerita di Jejak Kita dulu ya sebelum bagian ini.', // Shown on locked Card 2 (Waktu Bersama)
    lockedPrevNotice: 'Buka {prevTitle} dulu ya sebelum bagian ini.', // Shown on locked Cards 3, 4, 5
    badgeOpened: 'Sudah dibuka', // Green badge on completed Main Menu cards
    badgeStartHere: 'Mulai di sini', // Highlight badge on Card 1 when starting
    badgeOpenNow: 'Buka sekarang', // Highlight badge on the next unlocked card
    badgePartPrefix: 'Bagian', // Badge prefix on locked cards -> "Bagian 2", etc.
    replayIntroButton: 'Lihat sambutan lagi', // Footer link on Main Menu
    lockSiteButton: 'Kunci halaman', // Footer link on Main Menu to return to PIN Gate
  },

  // ==========================================================================
  // 5. MENU 1: JEJAK KITA (Horizontal Timeline)
  //    Each item becomes one horizontal card in Menu 1 ("Jejak Kita").
  //    Icons available: 'heart' | 'coffee' | 'map-pin' | 'sparkles' | 'sun' | 'gift'
  // ==========================================================================
  timeline: [
    {
      date: 'November 2023',
      title: 'Hari pertama kita resmi bareng',
      description: 'Canggung di awal, tapi obrolannya langsung nyambung sampai lupa waktu.',
      photo: 'photos/memory-1.svg', // Image shown on Jejak Kita Card #1
      icon: 'heart',
    },
    {
      date: 'Januari 2024',
      title: 'Kopi sore pertama yang paling lama',
      description: 'Hujan turun deras, jadi kita nambah satu gelas lagi sambil bahas hal random.',
      photo: 'photos/memory-2.svg', // Image shown on Jejak Kita Card #2
      icon: 'coffee',
    },
    {
      date: 'Mei 2024',
      title: 'Jalan jauh tanpa rencana matang',
      description: 'Sempat salah belok dua kali, tapi pulangnya malah ketawa terus di jalan.',
      photo: 'photos/memory-3.svg', // Image shown on Jejak Kita Card #3
      icon: 'map-pin',
    },
    {
      date: 'November 2024',
      title: 'Satu tahun pertama bareng kamu',
      description: 'Makan malam sederhana yang rasanya hangat sekali.',
      photo: 'photos/memory-4.svg', // Image shown on Jejak Kita Card #4
      icon: 'sparkles',
    },
    {
      date: 'Juni 2025',
      title: 'Sore cerah di sudut kota favorit',
      description: 'Kita duduk di bangku taman sambil foto-foto kecil buat kenangan.',
      photo: 'photos/memory-5.svg', // Image shown on Jejak Kita Card #5
      icon: 'sun',
    },
    {
      date: 'November 2026',
      title: 'Tiga tahun dan masih terus berlanjut',
      description: 'Terima kasih sudah selalu sabar, hangat, dan jadi rumah buat pulang.',
      photo: 'photos/memory-6.svg', // Image shown on Jejak Kita Card #6
      icon: 'gift',
    },
  ],
  timelineUi: {
    progressLabel: 'Cerita terbuka', // Label inside top progress box in Jejak Kita
    nextCardTitle: 'Jejak berikutnya', // Title on the locked preview card on the right in Jejak Kita
    nextCardSubtitle: 'Ada satu cerita lagi yang menunggu untuk dibuka.', // Text inside locked preview card in Jejak Kita
    nextCardButton: 'Buka jejak', // Button inside locked preview card in Jejak Kita
    hiddenRemainingText: 'Masih ada {remaining} jejak tersembunyi', // Pill below Previous/Next buttons in Jejak Kita
    prevButton: 'Sebelum', // Previous button label in Jejak Kita
    nextButton: 'Berikut', // Next button label in Jejak Kita
    allOpenedMascot: 'Semua jejak sudah terbuka!', // Mascot message after opening all cards in Jejak Kita
    restartButton: 'Ulangi jejak dari awal', // Replay button after finishing Jejak Kita
  },

  // ==========================================================================
  // 6. MENU 2: WAKTU BERSAMA (Live Counter & Milestones)
  // ==========================================================================
  counterUi: {
    unitLabels: {
      years: 'Tahun', // Shown in: Waktu Bersama flip clock & countdown
      months: 'Bulan', // Shown in: Waktu Bersama flip clock
      days: 'Hari', // Shown in: Waktu Bersama flip clock & countdown
      hours: 'Jam', // Shown in: Waktu Bersama flip clock & countdown
      minutes: 'Menit', // Shown in: Waktu Bersama flip clock & countdown
      seconds: 'Detik', // Shown in: Waktu Bersama flip clock & countdown
    },
    anniversaryBannerTitle: 'Selamat hari jadi kita!', // Banner shown in Waktu Bersama only on the exact anniversary day
    anniversaryBannerBody: 'Hari ini tepat {years} tahun perjalanan kita bersama.', // Banner subtext on anniversary day
    celebrateAgainButton: 'Rayakan lagi', // Confetti button on anniversary banner
    totalDaysLabel: 'Total hari yang sudah kita lewati bersama', // Total days row label in Waktu Bersama
    totalDaysUnit: 'hari', // Unit after total days number
    nextAnnivHeading: 'Menuju anniversary ke-{year}', // Countdown box heading in Waktu Bersama
  },

  // ==========================================================================
  // 7. MENU 3: KILAS BALIK (Story Slides)
  //    Each object below is one slide (1/8 to 8/8) in Menu 3 ("Kilas Balik").
  // ==========================================================================
  rewind: [
    {
      type: 'intro', // Slide 1: Opening title card in Kilas Balik
      eyebrow: 'Kilas Balik Kita',
      title: 'Tiga tahun penuh cerita',
      subtitle: 'Kita lihat lagi momen-momen favorit bareng kamu.',
    },
    {
      type: 'countup', // Slide 2: Animated total days counter in Kilas Balik (number is calculated from startDate)
      eyebrow: 'Total hari bersama',
      label: 'hari kita jalan bareng sejauh ini',
      subtitle: 'Dari obrolan singkat sampai rencana masa depan.',
    },
    {
      type: 'photo', // Slide 3: Featured single photo card in Kilas Balik
      eyebrow: 'Foto pilihan pertama',
      photo: 'photos/memory-1.svg', // Image shown on Kilas Balik Slide 3
      caption: 'Senyum kamu di hari itu masih jadi favoritku.',
      date: 'November 2023',
    },
    {
      type: 'stat', // Slide 4: Photo count highlight card in Kilas Balik
      eyebrow: 'Koleksi foto kita',
      statSource: 'photocards', // Uses total number of items in `photoCards` below (or change to 'custom' with customValue)
      unit: 'kartu kenangan',
      title: 'Foto yang sudah kita simpan',
      subtitle: 'Setiap potret punya ceritanya sendiri kalau dilihat lagi bareng kamu.',
    },
    {
      type: 'carousel', // Slide 5: 3D spinning photo gallery in Kilas Balik
      eyebrow: 'Galeri putar',
      title: 'Potongan hari-hari baik kita',
      photos: [
        'photos/memory-2.svg', // Carousel photo 1 in Kilas Balik Slide 5
        'photos/memory-3.svg', // Carousel photo 2 in Kilas Balik Slide 5
        'photos/memory-4.svg', // Carousel photo 3 in Kilas Balik Slide 5
        'photos/memory-5.svg', // Carousel photo 4 in Kilas Balik Slide 5
        'photos/memory-6.svg', // Carousel photo 5 in Kilas Balik Slide 5
      ],
    },
    {
      type: 'ranking', // Slide 6: Top 5 list in Kilas Balik
      eyebrow: 'Momen favorit',
      title: 'Lima hal yang paling sering bikin kangen',
      items: [
        'Jajan sore tanpa tujuan jelas',
        'Ketawa gara-gara salah baca peta',
        'Dengerin lagu bareng pas jalan pulang',
        'Foto buru-buru tapi hasilnya lucu',
        'Obrolan tenang sebelum tidur',
      ],
    },
    {
      type: 'song', // Slide 7: Spinning vinyl record in Kilas Balik (uses song.title & song.artist)
      eyebrow: 'Lagu kita',
      subtitle: 'Lagu ini selalu mengingatkan aku sama hari-hari baik bareng kamu.',
    },
    {
      type: 'outro', // Slide 8: Final Kilas Balik slide linking to Kartu Foto
      eyebrow: 'Bagian berikutnya',
      title: 'Masih ada kartu foto kita',
      subtitle: 'Ada catatan kecil di balik setiap fotonya sebelum surat terakhir.',
      ctaLabel: 'Lanjut ke Kartu Foto',
    },
  ],

  // ==========================================================================
  // 8. MENU 4: KARTU FOTO (Interactive Polaroid Stack & Grid)
  //    Each item is one flippable polaroid card in Menu 4 ("Kartu Foto").
  // ==========================================================================
  photoCards: [
    {
      photo: 'photos/memory-1.svg', // Image on Kartu Foto Card #1
      caption: 'Awal mula cerita kita', // Front caption under photo
      date: '26 Nov 2023', // Date on front & back
      backNote: 'Waktu itu aku deg-degan banget sebelum ketemu kamu.', // Handwritten note on back of card
    },
    {
      photo: 'photos/memory-2.svg', // Image on Kartu Foto Card #2
      caption: 'Kopi sore waktu hujan',
      date: '14 Jan 2024',
      backNote: 'Kita pesan minuman yang sama tapi rasanya beda jauh.',
    },
    {
      photo: 'photos/memory-3.svg', // Image on Kartu Foto Card #3
      caption: 'Jalan sore keliling kota',
      date: '19 Mei 2024',
      backNote: 'Anginnya adem banget dan kamu cerita panjang lebar.',
    },
    {
      photo: 'photos/memory-4.svg', // Image on Kartu Foto Card #4
      caption: 'Makan malam tahun pertama',
      date: '26 Nov 2024',
      backNote: 'Lilin kecil di meja dan doa baik buat kita berdua.',
    },
    {
      photo: 'photos/memory-5.svg', // Image on Kartu Foto Card #5
      caption: 'Foto candid favoritku',
      date: '08 Mar 2025',
      backNote: 'Kamu lagi sibuk milih makanan tapi tetap kelihatan manis.',
    },
    {
      photo: 'photos/memory-6.svg', // Image on Kartu Foto Card #6
      caption: 'Minggu pagi yang santai',
      date: '22 Jun 2025',
      backNote: 'Bangun pagi cuma buat sarapan bareng di tempat langganan.',
    },
    {
      photo: 'photos/memory-7.svg', // Image on Kartu Foto Card #7
      caption: 'Tahun kedua kita',
      date: '26 Nov 2025',
      backNote: 'Makin banyak hal kecil yang kita syukuri bareng.',
    },
    {
      photo: 'photos/memory-8.svg', // Image on Kartu Foto Card #8
      caption: 'Menuju tiga tahun dan seterusnya',
      date: '26 Nov 2026',
      backNote: 'Semoga foto-foto di sini makin penuh sama senyum kamu.',
    },
  ],
  photoCardsUi: {
    stackTabLabel: 'Tumpukan', // View toggle tab 1 in Kartu Foto
    gridTabLabel: 'Grid', // View toggle tab 2 in Kartu Foto
    prevButton: 'Sebelum', // Previous button under card stack in Kartu Foto
    nextButton: 'Berikut', // Next button under card stack in Kartu Foto
  },

  // ==========================================================================
  // 9. MENU 5: SURAT UNTUKMU (Envelope & Typed Love Letter Finale)
  // ==========================================================================
  letter: {
    title: 'Happy Anniversary', // Letter heading (shown on envelope paper & typed at top of letter)
    body: [
      'Terima kasih ya sudah menemani aku melewati tiga tahun yang seru ini.',
      'Di antara hari-hari sibuk dan rencana yang kadang meleset, punya kamu di sampingku selalu bikin semuanya terasa lebih ringan.',
      'Aku bersyukur untuk setiap tawa kecil, setiap cerita malam, dan setiap sabar yang kamu bagi selama kita berjalan bersama.',
      'Semoga di tahun-tahun berikutnya, kita tetap jadi tim yang saling menguatkan dan selalu punya alasan buat merayakan hal sederhana.',
    ], // Each string in this array is one paragraph in Surat Untukmu
    signature: 'Dari Wildan', // Handwritten signature at the bottom of the letter
  },
  letterUi: {
    mascotDefault: 'Selamat hari jadi kita berdua!', // Mascot message after letter finishes typing
    mascotHugCount: 'Peluk hangat terkirim ({count}x)!', // Mascot message after clicking "Kirim peluk"
    sendHugButton: 'Kirim peluk', // Blush button at end of letter
    restartButton: 'Ulangi dari awal', // Replay envelope button at end of letter
  },

  // ==========================================================================
  // 10. TOP MUSIC BAR & SHARED NAVIGATION (Shown across all menu pages)
  // ==========================================================================
  song: {
    title: 'Sorak Sorai', // Song title shown in top-right Music Bar & Kilas Balik Slide 7
    artist: 'Nadin Amizah & Syarikat Idola Remaja', // Artist name shown in top-right Music Bar & Kilas Balik Slide 7
    audioSrc: 'audio/sorak-sorai.mp3', // Audio file path inside `public/`
    lrcSrc: 'lyrics/sorak-sorai.lrc', // Synced LRC lyrics file path inside `public/`
    lyricsOffsetMs: 0, // Shift lyrics timing in milliseconds (+ or -) if out of sync
    loop: true,
  },
  musicPlayer: {
    playSongLabel: 'Putar lagu', // Button in top Music Bar when browser blocks autoplay
    replaySongLabel: 'Putar lagi', // Button in top Music Bar when song ends (if loop is false)
    playLabel: 'Putar', // Play button inside expanded top Music Bar
    pauseLabel: 'Jeda', // Pause button inside expanded top Music Bar
    waitingLyricsLabel: 'Siap memutar lirik', // Fallback text in top Music Bar before first lyric timestamp
  },
  navigation: {
    backToMenuButton: 'Kembali ke menu', // Left button in floating Bottom Navigation bar
    nextButton: 'Lanjut', // Right button in floating Bottom Navigation bar
    lockedNextButton: 'Selesaikan dulu', // Disabled right button in Bottom Navigation while Jejak Kita isn't finished
    mainMenuButton: 'Menu utama', // Right button in Bottom Navigation on the final page (Surat Untukmu)
    continueToPrefix: 'Lanjut ke', // Bottom CTA button prefix -> "Lanjut ke Waktu Bersama"
    backToMainMenuButton: 'Kembali ke menu utama', // Bottom CTA button on final page
    sectionStepLabel: 'Bagian {current} dari {total}', // Small top pill in every menu header
    loadingPageText: 'Memuat halaman...', // Shown briefly while a menu chunk loads
  },
};
