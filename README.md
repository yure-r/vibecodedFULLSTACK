# Vanilla JS Firestore CRUD – Annoyances + Homework


## 0) Prereqs
- A Firebase project with Auth + Firestore enabled
- A Vercel account


## 1) Firebase setup
1. Firebase Console → **Authentication** → Enable **Google** provider
2. Firebase Console → **Firestore** → Create database (production mode)
3. Firebase Console → **Firestore → Rules** → paste `firestore.rules` from this repo → **Publish**
4. Firebase Console → **Project settings → General → Your apps (Web)** → Register app and copy config
5. Put your config inside `app.js` (replace `YOUR_*` values)


> The Firebase Web config is safe to ship to the client. Access control happens in security rules.


## 2) Run locally
Just open `index.html` with a local server (to avoid CORS on ES modules):


```bash
npx serve .
# or
python3 -m http.server 8080