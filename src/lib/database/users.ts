
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  Timestamp,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createNotification } from './notifications';
import { deleteUser as deleteUserAdmin, updateUser, updatePassword } from '../server-actions/users';


// User Profile Management
export const createUserDocument = async (user: FirebaseUser, additionalData: Record<string, any> = {}) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const { displayName, email, photoURL } = user;
        const createdAt = new Date();
        
        await setDoc(userDocRef, {
            name: additionalData.name || displayName,
            email,
            photoURL,
            createdAt: Timestamp.fromDate(createdAt),
            lastLogin: Timestamp.fromDate(createdAt),
            role: 'user',
            emailVerified: false, // Start as unverified
            ...additionalData, 
        });
    }
};

export const updateUserLastLogin = async (uid: string) => {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
    });
};


export const updateUserDocumentAndPhoto = async (data: { 
    name: string; 
    photoFile: File | null;
    bio?: string;
    dob?: string;
    country?: string;
    phone?: string;
    state?: string;
    zip?: string;
}) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated to update profile.");

    let photoURL = user.photoURL;

    if (data.photoFile) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, data.photoFile);
        photoURL = await getDownloadURL(snapshot.ref);
    }
    
    await updateProfile(user, {
      displayName: data.name,
      photoURL: photoURL
    });

    const firestoreData: { [key: string]: any } = {
        name: data.name,
        photoURL: photoURL,
        updatedAt: serverTimestamp()
    };

    if (data.bio !== undefined) firestoreData.bio = data.bio;
    if (data.dob) firestoreData.dob = data.dob;
    if (data.country !== undefined) firestoreData.country = data.country;
    if (data.phone !== undefined) firestoreData.phone = data.phone;
    if (data.state !== undefined) firestoreData.state = data.state;
    if (data.zip !== undefined) firestoreData.zip = data.zip;

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, firestoreData);
    
    await createNotification({
        title: "Profile Updated",
        body: "Your profile information has been successfully saved.",
        link: "/settings",
        userId: user.uid,
    });
};

export const findUserByEmail = async (email: string) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { ...userDoc.data(), uid: userDoc.id };
};


export const updateUserDocumentAdmin = async (uid: string, data: { name: string; email: string; role: 'admin' | 'user' }) => {
    await updateUser(uid, data);
}

export const updateUserPasswordAdmin = async (uid: string, password: string) => {
    await updatePassword(uid, password);
}

export const deleteUser = async (uid: string) => {
    await deleteUserAdmin(uid);
    await deleteDoc(doc(db, "users", uid));
};
