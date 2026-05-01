import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
window.handleLogout = async () => {
    if (confirm("هل تريد الخروج؟")) {
        await signOut(auth);
        window.location.href = 'login.html';
    }
};
