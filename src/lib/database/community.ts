
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from './notifications';

export interface CommunityGroup {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    image: string;
    imageHint: string;
}

export interface SacredSpace {
    id: string;
    name: string;
    status: string;
}

export interface Opportunity {
    id: string;
    title: string;
    description: string;
    image: string;
    imageHint: string;
    tags: string[];
    compatibility: number;
}


const communityGroupsCollection = collection(db, 'communityGroups');

export const addCommunityGroup = async (groupData: Omit<CommunityGroup, 'id' | 'memberCount' | 'imageHint'>) => {
    const newDoc = await addDoc(communityGroupsCollection, {
        ...groupData,
        memberCount: 1, // Start with 1 member (the creator)
        imageHint: 'group photo', // default hint
        createdAt: serverTimestamp()
    });

    await createNotification({
        title: "New Community Group Created!",
        body: `A new group, "${groupData.name}", is now available. Check it out and find your people.`,
        link: "/community"
    });

    return { ...groupData, id: newDoc.id, memberCount: 1, imageHint: 'group photo' };
};

export const updateCommunityGroup = async (groupData: Partial<CommunityGroup> & { id: string }) => {
    const groupRef = doc(db, 'communityGroups', groupData.id);
    await updateDoc(groupRef, groupData);
    return groupData as CommunityGroup;
};

export const deleteCommunityGroup = async (groupId: string) => {
    const groupRef = doc(db, 'communityGroups', groupId);
    await deleteDoc(groupRef);
};
