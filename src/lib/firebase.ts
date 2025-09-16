
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "sacred-connect",
  "appId": "1:366216226232:web:95639871a2d627d3725b4d",
  "storageBucket": "sacred-connect.appspot.com",
  "apiKey": "AIzaSyBQwTFdPKx7isQShlXcn11mWoLk7sojbA0",
  "authDomain": "sacred-connect.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "366216226232"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
