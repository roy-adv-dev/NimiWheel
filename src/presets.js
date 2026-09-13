// תבניות משחקים לדוגמה מוכנות מראש בעברית

export const PRESET_GAME_SETS = [
  {
    id: 'preset-music-trivia',
    title: '🎵 חידון מוזיקה וסרטונים',
    description: 'משחק טריוויה מוזיקלי המשלב שאלות וסרטוני יוטיוב',
    spinDuration: 6,
    items: [
      {
        id: 'item-m1',
        text: 'זהה את הקלאסיקה! צפה בסרטון וענה: באיזה עשור יצא השיר?',
        color: '#ec4899',
        youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', // Queen - Bohemian Rhapsody
        active: true
      },
      {
        id: 'item-m2',
        text: 'מי הזמר/ת המבצע/ת את הלהיט הזה?',
        color: '#8b5cf6',
        youtubeUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDM0', // Mark Ronson - Uptown Funk ft. Bruno Mars
        active: true
      },
      {
        id: 'item-m3',
        text: 'מהו השיר הישראלי שנמצא בסרטון וזכה באירוויזיון?',
        color: '#3b82f6',
        youtubeUrl: 'https://www.youtube.com/watch?v=84LBjXaeKk4', // Netta - Toy
        active: true
      },
      {
        id: 'item-m4',
        text: 'ספר על הופעה חיה או שיר ראשון שאי פעם אהבת במיוחד',
        color: '#10b981',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-m5',
        text: 'נגן קטע מהסרטון והשלים את המילים של הפזמון!',
        color: '#f59e0b',
        youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Luis Fonsi - Despacito
        active: true
      },
      {
        id: 'item-m6',
        text: 'שאלה פתוחה: איזה זאנר מוזיקלי מועדף עליך ולמה?',
        color: '#ef4444',
        youtubeUrl: '',
        active: true
      }
    ]
  },
  {
    id: 'preset-icebreaker',
    title: '🧊 שאלות שבור את הקרח',
    description: 'שאלות היכרות מהנות לצוותים, מסיבות ומפגשים חברתיים',
    spinDuration: 5,
    items: [
      {
        id: 'item-i1',
        text: 'מה היה היעד האחרון שטיילת בו, ומה הכי אהבת שם?',
        color: '#06b6d4',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-i2',
        text: 'אם היית יכול לאכול רק מאכל אחד למשך שנה, מה היית בוחר?',
        color: '#84cc16',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-i3',
        text: 'צפה בסרטון המצחיק הזה וספר על הפדיחה הכי מצחיקה שקרתה לך!',
        color: '#f97316',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        active: true
      },
      {
        id: 'item-i4',
        text: 'מהו הכישרון הסודי או התחביב שלמעטים ידוע עליו?',
        color: '#a855f7',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-i5',
        text: 'אם היית זוכה במיליון דולר מחר, מה הדבר הראשון שהיית קונה?',
        color: '#eab308',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-i6',
        text: 'איזה סרט או סדרה אתה יכול לראות שוב ושוב בלי להימאס?',
        color: '#6366f1',
        youtubeUrl: '',
        active: true
      }
    ]
  },
  {
    id: 'preset-trivia-challenge',
    title: '🧠 טריוויה ואתגרים',
    description: 'שאלות ידע כללי ומשימות מהירות עם סרטונים מדליקים',
    spinDuration: 7,
    items: [
      {
        id: 'item-t1',
        text: 'מהו החומר הקשה ביותר בטבע?',
        color: '#14b8a6',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-t2',
        text: 'צפה בקטע מהסרטון: באיזו שנה שודר הטריילר הזה לראשונה?',
        color: '#d946ef',
        youtubeUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        active: true
      },
      {
        id: 'item-t3',
        text: 'כמה יבשות יש בכדור הארץ ואיזו היחידה שאינה מיושבת בדרך קבע?',
        color: '#3b82f6',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-t4',
        text: 'משימה: עשה חיקוי של דמות מפורסמת או זמר ב-15 שניות!',
        color: '#f43f5e',
        youtubeUrl: '',
        active: true
      },
      {
        id: 'item-t5',
        text: 'מהו האיטי ביותר מבין חמשת החושים של האדם להתפתח בריבוי תחושות?',
        color: '#8b5cf6',
        youtubeUrl: '',
        active: true
      }
    ]
  }
];
