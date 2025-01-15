import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp, addDoc, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, query, runTransaction, setDoc, updateDoc, where } from 'firebase/firestore';
import { app } from '../firebase/init';
import { UserAvailabilityError, UserNotFoundError } from "../errors/userAvailability";
import { getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';
const auth = getAuth(app);
const db = getFirestore(app);
export const logEmailPassword = async (user) => {
    await signInWithEmailAndPassword(auth, user.email, user.password);
}
export const registerEmailPassword = async (user) => {
    await checkUsernameAvailability(user.username)
    await createUserWithEmailAndPassword(auth, user.email, user.password)
    await createUser({ username: user.username })
}

export const checkUsernameAvailability = async (username) => {
    const q = query(collection(db, "user"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty)
        return true
    else
        throw new UserAvailabilityError("Username already taken", "auth-custom/username-already-in-use")
}

export const createUser = async (data) => {
    const db = getFirestore(app);
    const userRef = doc(db, "user", auth.currentUser.uid);
    const user = {
        email: auth.currentUser.email,
        creationTime: Timestamp.fromDate(new Date(auth.currentUser.metadata.creationTime)),
        ...data
    }
    await setDoc(userRef, user)
    return { ...user, id: userRef.id };
}

export const updateUser = async (data) => {
    const userRef = doc(db, "user", auth.currentUser.uid);
    const image = await updateAvatarImage(data.avatar);
    await updateDoc(userRef, { ...data, lastModificationTime: Timestamp.fromDate(new Date()), avatar: image });
    return { ...data, id: userRef.id };
}

export const updateAvatarImage = async (image) => {
    if (!image) return null
    const storage = getStorage(app);
    const storageRef = ref(storage, `avatar/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, image);
    return storageRef.fullPath;
}

export const setUserLink = async (data) => {
    const linkCollection = collection(db, `user/${auth.currentUser.uid}/link`);
    const linkRef = doc(linkCollection);
    await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "user", auth.currentUser.uid);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new UserNotFoundError("auth-custom/user-not-found");
        }
        transaction.set(linkRef, { ...data, visit: [] });
    })
    return { ...data, id: linkRef.id };
}

export const updateUserLink = async (data) => {
    const linkCollection = collection(db, `user/${auth.currentUser.uid}/link`);
    const linkRef = doc(linkCollection, data.id);
    delete data.id;
    await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "user", auth.currentUser.uid);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new UserNotFoundError("auth-custom/user-not-found");
        }
        transaction.update(linkRef, data);
    })
    return { ...data, id: linkRef.id };
}

export const deleteUserLink = async (id) => {
    const linkCollection = collection(db, `user/${auth.currentUser.uid}/link`);
    const linkRef = doc(linkCollection, id);
    await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "user", auth.currentUser.uid);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw new UserNotFoundError("auth-custom/user-not-found");
        }
        transaction.delete(linkRef);
    })
}

export const getUserLinks = async ({ id } = {}) => {
    const linkCollection = collection(db, `user/${id || auth.currentUser.uid}/link`);
    const querySnapshot = await getDocs(linkCollection);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export const getUser = async () => {
    const userRef = doc(db, "user", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new UserNotFoundError("user does not exist", "auth-custom/user-not-found");
    }
    else {
        return { ...userDoc.data(), id: userDoc.id };
    }
}
export const getUserFromId = async (id) => {
    const userRef = doc(db, "user", id);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new UserNotFoundError("user does not exist", "auth-custom/user-not-found");
    }
    else {
        return { ...userDoc.data(), id: userDoc.id };
    }
}
export const getUserFromUsername = async (username) => {
    const userRef = collection(db, "user");
    const q = query(userRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    // querySnapshot.docs
    // const userDoc = await getDoc(userRef);
    if (querySnapshot.empty) {
        throw new UserNotFoundError("user does not exist", "auth-custom/user-not-found");
    }
    else {
        return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
    }
}
export const setLinkClickCounter = async (id) => {
    const visitCollection = collection(db, `user/${auth.currentUser.uid}/link/${id}/visit`);
    const visitRef = doc(visitCollection);
    const { location, ip } = await getLocationFromIp();
    await setDoc(visitRef, { country: location, ip, creationTime: Timestamp.fromDate(new Date()), linkId: id })
}
export const getLocationFromIp = async () => {
    const ipResponse = await (await fetch("https://api.iplocation.net/?cmd=get-ip")).json();
    const location = await (await fetch(`https://api.iplocation.net/?cmd=ip-country&ip=${ipResponse.ip}`)).json();
    return { location: location.country_code2, ip: ipResponse.ip };
}
export const getVisitsOfLink = async (link) => {
    const visitCollection = collection(db, `user/${auth.currentUser.uid}/link/${link}/visit`);
    const querySnapshot = await getDocs(visitCollection);
    return { id: link, visits: [...querySnapshot.docs.map((doc) => doc.data())] };
}