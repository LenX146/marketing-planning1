// ============================================
//   НАСТРОЙКА FIREBASE ДЛЯ ЛИЧНОГО ИСПОЛЬЗОВАНИЯ
//   (Используем совместимый SDK для браузера)
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBtST1SHDHhRnV42pVdPigWwaOkqO88E70",
  authDomain: "sleng-planner.firebaseapp.com",
  databaseURL: "https://sleng-planner-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sleng-planner",
  storageBucket: "sleng-planner.firebasestorage.app",
  messagingSenderId: "296243067795",
  appId: "1:296243067795:web:56b3411ba4800d6f934666"
};

// Инициализация Firebase (совместимый способ для браузера)
const app = initializeApp(firebaseConfig);
const database = firebase.database();

// ID для личного использования
const USER_ID = 'sleng_owner';

console.log('✅ Firebase подключён!');
console.log('📡 База данных:', firebaseConfig.databaseURL);