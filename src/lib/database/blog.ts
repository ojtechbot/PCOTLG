
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from './notifications';

const createSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/&/g, 'and') // replace & with 'and'
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/\s+/g, '-') // spaces to dashes
      .replace(/-+/g, '-') // remove consecutive dashes
      .trim();
    return slug || 'post'; // return 'post' if slug is empty
};

// Blog Post Management
export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    content: string;
    author: string;
    date: string; // Keep as string for client-side compatibility
    image: string; // Cover Image
    metaDescription: string;
    tags: string[];
    textSummary?: string;
    audioSummaryUrl?: string;
}

const blogPostsCollection = collection(db, 'blogPosts');

export const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'slug'>) => {
    const slug = createSlug(postData.title);
    
    const docRef = await addDoc(blogPostsCollection, {
        ...postData,
        slug: slug,
        date: Timestamp.fromDate(new Date(postData.date)), // Convert string to Timestamp for Firestore
        createdAt: serverTimestamp()
    });
    
    const id = docRef.id;

    // Create a notification for a new blog post
    await createNotification({
        title: "New Blog Post",
        body: `Check out the new article: "${postData.title}"`,
        link: `/blog/${id}`
    });

    return { ...postData, id: id, slug: slug };
}

export const updateBlogPost = async (postData: Partial<BlogPost> & { id: string }) => {
    const postRef = doc(db, 'blogPosts', postData.id);
    
    const updatedData: { [key: string]: any } = { ...postData };
    
    if(postData.title) {
        updatedData.slug = createSlug(postData.title);
    }
    // If date is a string, convert it to a Timestamp
    if (postData.date) {
        updatedData.date = Timestamp.fromDate(new Date(postData.date));
    }

    await updateDoc(postRef, updatedData);
    return updatedData as BlogPost;
}

export const deleteBlogPost = async (postId: string) => {
    const postRef = doc(db, 'blogPosts', postId);
    await deleteDoc(postRef);
};

