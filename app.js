// app.js (Vanilla JS + Firebase v11 ESM CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';


// TODO: replace with your Firebase config (Project Settings → Web App)
const firebaseConfig = {
  apiKey: "AIzaSyDLMfVFb87EamLoXzPCa_IEsLSl7xgsiOQ",
  authDomain: "professor-annoying.firebaseapp.com",
  projectId: "professor-annoying",
  storageBucket: "professor-annoying.firebasestorage.app",
  messagingSenderId: "194122833153",
  appId: "1:194122833153:web:326b236b62ee9215f9cf00",
  measurementId: "G-NHDDFTKQF8"
};


// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);


// UI refs
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userInfo = document.getElementById('userInfo');
const userEmail = document.getElementById('userEmail');
const appMain = document.getElementById('app');


// Annoyances
const annoyForm = document.getElementById('annoyForm');
const annoyText = document.getElementById('annoyText');
const annoyLevel = document.getElementById('annoyLevel');
const annoyCancelEdit = document.getElementById('annoyCancelEdit');
const annoyList = document.getElementById('annoyList');
let editingAnnoyId = null;


// Homework
const hwForm = document.getElementById('hwForm');
const hwTitle = document.getElementById('hwTitle');
const hwDue = document.getElementById('hwDue');
const hwStatus = document.getElementById('hwStatus');
const hwNotes = document.getElementById('hwNotes');
const hwCancelEdit = document.getElementById('hwCancelEdit');
const hwList = document.getElementById('hwList');
let editingHwId = null;


// Auth events
signInBtn.addEventListener('click', async () => {
try { await signInWithPopup(auth, provider); } catch (e) { alert(e.message); }
});


signOutBtn.addEventListener('click', async () => {
try { await signOut(auth); } catch (e) { alert(e.message); }
});


onAuthStateChanged(auth, (user) => {
const authBox = document.getElementById('authBox');
if (user) {
userEmail.textContent = user.email || user.uid;
signInBtn.classList.add('hidden');
userInfo.classList.remove('hidden');
appMain.classList.remove('hidden');
attachRealtimeListeners(user.uid);
} else {
userEmail.textContent = '';
signInBtn.classList.remove('hidden');
userInfo.classList.add('hidden');
appMain.classList.add('hidden');
detachRealtimeListeners();
}
});


let unsubAnnoy = null; let unsubHw = null;
function attachRealtimeListeners(uid){
// Annoyances stream
const aq = query(
collection(db, 'annoyances'),
where('userId', '==', uid),
orderBy('createdAt', 'desc')
);
unsubAnnoy = onSnapshot(aq, (snap) => {
if (!confirm('Delete this annoyance?')) return;
try { await deleteDoc(doc(db, 'annoyances', id)); } catch (e) { alert(e.message); }
});


annoyList.appendChild(li);
}


// Create/Update – Homework
hwForm.addEventListener('submit', async (e) => {
e.preventDefault();
const user = auth.currentUser; if (!user) return;
const payload = {
userId: user.uid,
title: hwTitle.value.trim(),
due: hwDue.value ? new Date(hwDue.value) : null,
status: hwStatus.value,
notes: hwNotes.value.trim() || '',
createdAt: serverTimestamp(),
updatedAt: serverTimestamp(),
};
if (!payload.title) return;


try {
if (editingHwId) {
const ref = doc(db, 'homework', editingHwId);
await updateDoc(ref, {
title: payload.title,
due: payload.due,
status: payload.status,
notes: payload.notes,
updatedAt: serverTimestamp(),
});
editingHwId = null; hwCancelEdit.classList.add('hidden');
hwForm.querySelector('button[type="submit"]').textContent = 'Add';
} else {
await addDoc(collection(db, 'homework'), payload);
}
hwTitle.value = ''; hwDue.value = ''; hwStatus.value = 'todo'; hwNotes.value='';
} catch (e) { alert(e.message); }
});


hwCancelEdit.addEventListener('click', () => {
editingHwId = null; hwTitle.value=''; hwDue.value=''; hwStatus.value='todo'; hwNotes.value='';
hwCancelEdit.classList.add('hidden');
hwForm.querySelector('button[type="submit"]').textContent = 'Add';
});


function renderHwItem(id, data){
const li = document.createElement('li'); li.className = 'item';
const due = data.due?.toDate?.() || null;
li.innerHTML = `
<div>
<div><strong>${escapeHtml(data.title)}</strong> ${data.status ? `<span class="badge">${data.status}</span>`:''}</div>
<div class="meta">${due ? `Due: ${due.toLocaleDateString()}` : 'No due date'}${data.notes? ' • '+escapeHtml(data.notes):''}</div>
</div>
<div class="controls">
<button class="btn small secondary" data-edit="${id}">Edit</button>
<button class="btn small secondary" data-del="${id}">Delete</button>
${data.status !== 'done' ? `<button class="btn small" data-done="${id}">Mark done</button>` : ''}
</div>`;


li.querySelector('[data-edit]')?.addEventListener('click', () => {
editingHwId = id;
hwTitle.value = data.title || '';
hwDue.value = data.due?.toDate ? toDateInputValue(data.due.toDate()) : '';
hwStatus.value = data.status || 'todo';
hwNotes.value = data.notes || '';
hwCancelEdit.classList.remove('hidden');
hwForm.querySelector('button[type="submit"]').textContent = 'Save';
});


li.querySelector('[data-del]')?.addEventListener('click', async () => {
if (!confirm('Delete this assignment?')) return;
try { await deleteDoc(doc(db, 'homework', id)); } catch (e) { alert(e.message); }
});


li.querySelector('[data-done]')?.addEventListener('click', async () => {
try { await updateDoc(doc(db, 'homework', id), { status: 'done', updatedAt: serverTimestamp() }); } catch (e) { alert(e.message); }
});


hwList.appendChild(li);
}


// Helpers
function toDateInputValue(date){ const pad=n=>String(n).padStart(2,'0'); return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
function escapeHtml(s){ return String(s).replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }