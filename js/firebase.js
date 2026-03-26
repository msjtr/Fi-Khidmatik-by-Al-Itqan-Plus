// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
  authDomain: "msjt301-974bb.firebaseapp.com",
  projectId: "msjt301-974bb",
  storageBucket: "msjt301-974bb.appspot.com",
  messagingSenderId: "186209858482",
  appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تشغيل Firebase
firebase.initializeApp(firebaseConfig);

// قاعدة البيانات
const db = firebase.firestore();
