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
  timeline: TimelineItem[];
  rewind: RewindSlide[];
  photoCards: PhotoCardItem[];
  letter: {
    title: string;
    body: string[];
    signature: string;
  };
  ui: {
    lockLetterUntilAllVisited: boolean;
  };
}

export const SECTION_ORDER: SectionId[] = [
  'timeline',
  'counter',
  'rewind',
  'photocards',
  'letter',
];

export const SECTION_META: Record<
  SectionId,
  { title: string; shortLabel: string; subtitle: string }
> = {
  timeline: {
    title: 'Jejak Kita',
    shortLabel: 'Jejak',
    subtitle: 'Buka satu per satu potongan cerita dari awal sampai hari ini.',
  },
  counter: {
    title: 'Waktu Bersama',
    shortLabel: 'Waktu',
    subtitle: 'Menghitung setiap detik yang sudah kita lewati.',
  },
  rewind: {
    title: 'Kilas Balik',
    shortLabel: 'Rewind',
    subtitle: 'Rangkuman momen paling seru versi kita berdua.',
  },
  photocards: {
    title: 'Kartu Foto',
    shortLabel: 'Foto',
    subtitle: 'Balik kartunya untuk membaca catatan kecil.',
  },
  letter: {
    title: 'Surat Untukmu',
    shortLabel: 'Surat',
    subtitle: 'Catatan penutup yang ditulis pelan-pelan buat kamu.',
  },
};

export const content: ContentConfig = {
  partnerName: 'Sayang',
  myName: 'Wildan',
  startDate: '2023-11-26T00:00:00+07:00',
  siteTitle: 'Tiga Tahun Kita',
  pin: {
    // Ganti hash PIN lewat perintah: npm run hash-pin PIN_KAMU
    hash: 'f809a4d73691e167f42514529fa6a0336c0c1bc256dc7d305858155efd214dc4',
    length: 6,
    hint: 'Tanggal jadian kita (format DDMMYY)',
  },
  song: {
    title: 'Sorak Sorai',
    artist: 'Nadin Amizah',
    audioSrc: 'audio/sorak-sorai.mp3',
    lrcSrc: 'lyrics/sorak-sorai.lrc',
    lyricsOffsetMs: 0,
    loop: true,
  },
  timeline: [
    {
      date: 'November 2023',
      title: 'Hari pertama kita resmi bareng',
      description: 'Canggung di awal, tapi obrolannya langsung nyambung sampai lupa waktu.',
      photo: 'photos/memory-1.svg',
      icon: 'heart',
    },
    {
      date: 'Januari 2024',
      title: 'Kopi sore pertama yang paling lama',
      description: 'Hujan turun deras, jadi kita nambah satu gelas lagi sambil bahas hal random.',
      photo: 'photos/memory-2.svg',
      icon: 'coffee',
    },
    {
      date: 'Mei 2024',
      title: 'Jalan jauh tanpa rencana matang',
      description: 'Sempat salah belok dua kali, tapi pulangnya malah ketawa terus di jalan.',
      photo: 'photos/memory-3.svg',
      icon: 'map-pin',
    },
    {
      date: 'November 2024',
      title: 'Satu tahun pertama bareng kamu',
      description: 'Makan malam sederhana yang rasanya hangat sekali.',
      photo: 'photos/memory-4.svg',
      icon: 'sparkles',
    },
    {
      date: 'Juni 2025',
      title: 'Sore cerah di sudut kota favorit',
      description: 'Kita duduk di bangku taman sambil foto-foto kecil buat kenangan.',
      photo: 'photos/memory-5.svg',
      icon: 'sun',
    },
    {
      date: 'November 2026',
      title: 'Tiga tahun dan masih terus berlanjut',
      description: 'Terima kasih sudah selalu sabar, hangat, dan jadi rumah buat pulang.',
      photo: 'photos/memory-6.svg',
      icon: 'gift',
    },
  ],
  rewind: [
    {
      type: 'intro',
      eyebrow: 'Kilas Balik Kita',
      title: 'Tiga tahun penuh cerita',
      subtitle: 'Geser pelan-pelan, kita lihat lagi momen favorit bareng kamu.',
    },
    {
      type: 'countup',
      eyebrow: 'Total hari bersama',
      label: 'hari kita jalan bareng sejauh ini',
      subtitle: 'Dari obrolan singkat sampai rencana masa depan.',
    },
    {
      type: 'photo',
      eyebrow: 'Foto pilihan pertama',
      photo: 'photos/memory-1.svg',
      caption: 'Senyum kamu di hari itu masih jadi favoritku.',
      date: 'November 2023',
    },
    {
      type: 'stat',
      eyebrow: 'Koleksi foto kita',
      statSource: 'photocards',
      unit: 'kartu kenangan',
      title: 'Foto yang sudah kita simpan',
      subtitle: 'Setiap potret punya ceritanya sendiri kalau dilihat lagi bareng kamu.',
    },
    {
      type: 'carousel',
      eyebrow: 'Galeri putar',
      title: 'Potongan hari-hari baik kita',
      photos: [
        'photos/memory-2.svg',
        'photos/memory-3.svg',
        'photos/memory-4.svg',
        'photos/memory-5.svg',
        'photos/memory-6.svg',
      ],
    },
    {
      type: 'ranking',
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
      type: 'song',
      eyebrow: 'Lagu kita',
      subtitle: 'Lagu ini selalu mengingatkan aku sama hari-hari baik bareng kamu.',
    },
    {
      type: 'outro',
      eyebrow: 'Satu langkah lagi',
      title: 'Masih ada surat kecil untukmu',
      subtitle: 'Terima kasih sudah sampai di halaman ini.',
      ctaLabel: 'Lanjut ke surat',
    },
  ],
  photoCards: [
    {
      photo: 'photos/memory-1.svg',
      caption: 'Awal mula cerita kita',
      date: '26 Nov 2023',
      backNote: 'Waktu itu aku deg-degan banget sebelum ketemu kamu.',
    },
    {
      photo: 'photos/memory-2.svg',
      caption: 'Kopi sore waktu hujan',
      date: '14 Jan 2024',
      backNote: 'Kita pesan minuman yang sama tapi rasanya beda jauh.',
    },
    {
      photo: 'photos/memory-3.svg',
      caption: 'Jalan sore keliling kota',
      date: '19 Mei 2024',
      backNote: 'Anginnya adem banget dan kamu cerita panjang lebar.',
    },
    {
      photo: 'photos/memory-4.svg',
      caption: 'Makan malam tahun pertama',
      date: '26 Nov 2024',
      backNote: 'Lilin kecil di meja dan doa baik buat kita berdua.',
    },
    {
      photo: 'photos/memory-5.svg',
      caption: 'Foto candid favoritku',
      date: '08 Mar 2025',
      backNote: 'Kamu lagi sibuk milih makanan tapi tetap kelihatan manis.',
    },
    {
      photo: 'photos/memory-6.svg',
      caption: 'Minggu pagi yang santai',
      date: '22 Jun 2025',
      backNote: 'Bangun pagi cuma buat sarapan bareng di tempat langganan.',
    },
    {
      photo: 'photos/memory-7.svg',
      caption: 'Tahun kedua kita',
      date: '26 Nov 2025',
      backNote: 'Makin banyak hal kecil yang kita syukuri bareng.',
    },
    {
      photo: 'photos/memory-8.svg',
      caption: 'Menuju tiga tahun dan seterusnya',
      date: '26 Nov 2026',
      backNote: 'Semoga foto-foto di sini makin penuh sama senyum kamu.',
    },
  ],
  letter: {
    title: 'Happy Anniversary',
    body: [
      'Terima kasih ya sudah menemani aku melewati tiga tahun yang seru ini.',
      'Di antara hari-hari sibuk dan rencana yang kadang meleset, punya kamu di sampingku selalu bikin semuanya terasa lebih ringan.',
      'Aku bersyukur untuk setiap tawa kecil, setiap cerita malam, dan setiap sabar yang kamu bagi selama kita berjalan bersama.',
      'Semoga di tahun-tahun berikutnya, kita tetap jadi tim yang saling menguatkan dan selalu punya alasan buat merayakan hal sederhana.',
    ],
    signature: 'Dari Wildan',
  },
  ui: {
    lockLetterUntilAllVisited: false,
  },
};
