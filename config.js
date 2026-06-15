// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAS-ybnZtBi_1OtsvzcR5Zmr2rNVJ18-OM",
    authDomain: "the-sad-station.firebaseapp.com",
    projectId: "the-sad-station",
    storageBucket: "the-sad-station.firebasestorage.app",
    messagingSenderId: "855726109360",
    appId: "1:855726109360:web:c787922a02ae243eb98175",
    measurementId: "G-T9SK2WCCNF"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ফায়ারস্টোর ডাটাবেজ ইনস্ট্যান্স (গ্লোবাল উইন্ডো অবজেক্টে সেট করা হলো)
window.db = firebase.firestore();

// 💡 গুরুত্বপূর্ণ: Auth অবজেক্টটি নিশ্চিত করার জন্য এটি যোগ করুন
window.auth = firebase.auth();
