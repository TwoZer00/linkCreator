import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp, Transaction, collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, runTransaction, setDoc, updateDoc, where } from 'firebase/firestore';
import { app } from '../firebase/init';
import { UserAvailabilityError, UserNotFoundError } from "../errors/userAvailability";
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getDeviceInfo, isAndroid, isDesktop, isIOS, isLinux, isMacOS, isMobile, isWindows } from "../utils/navigator";
import dayjs from "dayjs";
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
    const dateTemp = { ...data, lastModificationTime: Timestamp.fromDate(new Date()) };
    console.log(userRef.path,dateTemp);
    delete dateTemp.avatar;
    // const image = await updateAvatarImage(data.avatar);
    // if (typeof data.avatar === "object")
    //     dateTemp.avatar = image;
    
    await updateDoc(userRef, { ...dateTemp });
    return { ...data, id: userRef.id };
}

export const updateAvatarImage = async (image) => {
    if (!image) return null
    const storage = getStorage(app);
    const storageRef = ref(storage, `avatar/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, image);
    await updateDoc(doc(db, "user", auth.currentUser.uid), { avatar: storageRef.fullPath });
    // return storageRef.fullPath;
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
        transaction.set(linkRef, data);
        const links = {
            ...(userDoc.data().links || {}),
            total: (userDoc.data().links?.total || 0) + 1
        }
        transaction.update(userRef, { links });
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
        const linkDoc = await transaction.get(linkRef);
        const visits = {
            ...(userDoc.data().links?.visits || {}),
            total: (userDoc.data().links?.visits?.total||0) - (linkDoc.data()?.visits?.total || 0),
        }
        visits.byCountry = [...(userDoc.data().links?.visits?.byCountry || [])];
        if (linkDoc.data()?.visits?.byCountry) {
            linkDoc.data().visits.byCountry.forEach((countryVisit) => {
                visits.byCountry = visits.byCountry.map(item => {
                    if (item.country === countryVisit.country) {
                        return { country: item.country, count: item.count - countryVisit.count };
                    }
                    return item;
                });
            });
        }
        visits.byDevice = [...(userDoc.data().links?.visits?.byDevice || [])];
        if (linkDoc.data()?.visits?.byDevice) {
            linkDoc.data().visits.byDevice.forEach((deviceVisit) => {
                visits.byDevice = visits.byDevice.map(item => {
                    if (item.device === deviceVisit.device) {
                        return { device: item.device, count: item.count - deviceVisit.count };
                    }
                    return item;
                });
            });
        }
        transaction.update(userRef, { links: {
                ...(userDoc.data().links || {}),
                visits,
                total: (userDoc.data().links?.total || 1) - 1
            } });
        transaction.delete(linkRef);
    })
}

export const getUserLinks = async ({ id } = {}) => {
    const linkCollection = collection(db, `user/${id || auth.currentUser.uid}/link`);
    const querySnapshot = await getDocs(linkCollection);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export const getUserLinksOfLastMonth = async ({ id,lastVisible } = {}) => {
    const linkCollection = collection(db, `user/${id || auth.currentUser.uid}/link`);
    const q = query(linkCollection,
                    where("creationTime", ">=",Timestamp.fromDate(dayjs().startOf('month').toDate())),
                    limit(5)
                );
    if(lastVisible){
        q = query(q, orderBy("creationTime"), startAfter(lastVisible), limit(12));
    }
    const querySnapshot = await getDocs(q);
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
    const userRef = doc(db, "user",id);
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
    await runTransaction(db, async (transaction) => {
        const counter = await transaction.get(doc(db, `user/${auth.currentUser.uid}/link`, id));
        const linksData = (await transaction.get(doc(db, "user", auth.currentUser.uid))).data().links;
        if (!counter.exists()) {
            throw new Error("Link does not exist");
        }
        transaction.set(visitRef, { country: location, ip, creationTime: Timestamp.fromDate(new Date()), linkId: id, deviceInfo:getDeviceInfo() });
        const visits = counter.data()?.visits||{ total: 0, byCountry: [],byDevice: [] };
        visits.total = (visits.total || 0) + 1;
        if (visits.byCountry.some(item => item.country === location)) {
            visits.byCountry = visits.byCountry.map(item => {
                if (item.country === location) {
                    return { country: item.country, count: item.count + 1,creationTime: new Date()};
                }
                return item;
            });
        }
        else {
            visits.byCountry.push({ country: location, count: 1 ,creationTime: new Date()});
        }
        const device = isMobile ? (isAndroid ? "Android" : isIOS ? "iOS" : "Other Mobile") : (isDesktop ? (isWindows ? "Windows" : isMacOS ? "macOS" : isLinux ? "Linux" : "Other Desktop") : "Unknown");
        if (visits.byDevice.some(item => item.device === device)) {
            visits.byDevice = visits.byDevice.map(item => {
                if (item.device === device) {
                    return { device: item.device, count: item.count + 1,creationTime: new Date() };
                }
                return item;
            });
        }
        else {
            visits.byDevice.push({ device: device, count: 1,creationTime: new Date() });
        }
        transaction.update(doc(db, `user/${auth.currentUser.uid}/link`, id), {visits});
        const totalVisits = {
            ...(linksData.visits || {}),
            total: (linksData.visits?.total || 0) + 1
        }
        totalVisits.byCountry = [...(linksData.visits?.byCountry || [])];
        if (totalVisits.byCountry.some(item => item.country === location)) {
            totalVisits.byCountry = totalVisits.byCountry.map(item => {
                if (item.country === location) {
                    return { country: item.country, count: item.count + 1};
                }
                return item;
            });
        }
        else {
            totalVisits.byCountry.push({ country: location, count: 1 });
        }
        totalVisits.byDevice = [...(linksData.visits?.byDevice || [])];
        if (totalVisits.byDevice.some(item => item.device === device)) {
            totalVisits.byDevice = totalVisits.byDevice.map(item => {
                if (item.device === device) {
                    return { device: item.device, count: item.count + 1};
                }
                return item;
            });
        }
        else {
            totalVisits.byDevice.push({ device: device, count: 1});
        }
        transaction.update(doc(db, "user", auth.currentUser.uid), { links: { ...linksData, visits: totalVisits }
    });
    })
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