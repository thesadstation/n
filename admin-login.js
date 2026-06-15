// config.js থেকে ফায়ারবেস অথ অবজেক্ট নেওয়া হচ্ছে
const auth = firebase.auth();

// অলরেডি লগইন করা থাকলে লগইন পেজে না রেখে সরাসরি ড্যাশবোর্ডে পাঠিয়ে দেওয়া ভাই
auth.onAuthStateChanged((user) => {
    if (user) { 
        window.location.href = "admin.html"; 
    }
});

// লগইন ফর্ম সাবমিট হ্যান্ডলিং লজিক
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // পেজ রিলোড হওয়া বন্ধ করা
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('error-message');

            // প্রতিবার সাবমিট করার সময় আগের এরর মেসেজটি হাইড করে নেওয়া
            if (errorDiv) errorDiv.style.display = 'none';

            // 🔐 Firebase Auth দিয়ে সাইন ইন করার প্রসেস
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    // লগইন সফল হলে মেইন এডমিন ড্যাশবোর্ডে রিডাইরেক্ট হবে ভাই
                    window.location.href = "admin.html";
                })
                .catch((error) => {
                    // ভুল ইমেইল বা পাসওয়ার্ড দিলে ইউজারকে অ্যালার্ট দেওয়া
                    if (errorDiv) {
                        errorDiv.innerText = "ভুল ইমেইল বা পাসওয়ার্ড ভাই! আবার চেষ্টা করুন।";
                        errorDiv.style.display = 'block';
                    }
                    console.error("Login Error:", error);
                });
        });
    }
});
