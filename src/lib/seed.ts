
import { initFirebaseAdmin } from './firebase-admin';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
initFirebaseAdmin();

const auth = admin.auth();
const db = admin.firestore();

const seedUsers = [
  {
    uid: 'adminuser',
    name: 'Admin User',
    email: 'admin@pentecostal.app',
    password: 'password123',
    role: 'admin',
  },
  {
    uid: 'janeuser',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    password: 'password123',
    role: 'user',
  },
  {
    uid: 'johnuser',
    name: 'John Smith',
    email: 'john.smith@email.com',
    password: 'password123',
    role: 'user',
  },
    {
    uid: 'aliceuser',
    name: 'Alice Johnson',
    email: 'alice.j@email.com',
    password: 'password123',
    role: 'user',
  },
   {
    uid: 'bobuser',
    name: 'Bob Williams',
    email: 'bob.w@email.com',
    password: 'password123',
    role: 'user',
  }
];

const leaders = [
    {
        id: "bishop-mcintosh",
        name: "Bishop Justin M. McIntosh",
        title: "Senior Pastor",
        bio: "Bishop McIntosh has been leading our congregation for over 20 years with a passion for God's word and a heart for the community.",
        image: "/images/bishop.png",
        imageHint: "portrait pastor",
        order: 1,
    },
    {
        id: "marjorie-bartlett-wall",
        name: "Min. Marjorie Bartlett-Wall",
        title: "First Lady & Worship Leader",
        bio: "Leading our worship team, Marjorie creates an atmosphere where the congregation can connect with God through music and praise.",
        image: "/images/1.png",
        imageHint: "portrait worship leader",
        order: 2,
    },
    {
        id: "eleanor-stoute",
        name: "Pastor Eleanor Stoute",
        title: "Associate Pastor",
        bio: "Pastor Stoute oversees our community groups and discipleship programs, helping members grow in their faith.",
        image: "/images/2.png",
        imageHint: "portrait woman",
        order: 3,
    },
    {
        id: "joel-jemmott",
        name: "Deacon Joel Jemmott",
        title: "Deacon",
        bio: "Deacon Jemmott serves the church faithfully, assisting in various ministries and supporting the pastoral team.",
        image: "/images/3.png",
        imageHint: "portrait man",
        order: 4,
    },
     {
        id: "gercine-bynoe",
        name: "Minister Gercine Bynoe",
        title: "Minister",
        bio: "Minister Bynoe is a powerful teacher of the Word, dedicated to equipping the saints for the work of ministry.",
        image: "/images/4.png",
        imageHint: "portrait woman smiling",
        order: 5,
    },
    {
        id: "roy-marshall",
        name: "Bishop Roy A. Marshall",
        title: "Bishop",
        bio: "Bishop Marshall provides apostolic oversight and wisdom, guiding our church with decades of experience.",
        image: "/images/5.png",
        imageHint: "portrait man professional",
        order: 6,
    },
];

const ministryOpportunities = [
  {
    title: "Community Garden Volunteer",
    description: "Help tend our church garden, providing fresh produce for local food banks.",
    image: "https://placehold.co/600x400.png",
    imageHint: "community garden",
    tags: ["Outdoors", "Service", "All Ages"],
    compatibility: 95,
  },
  {
    title: "Youth Group Mentor",
    description: "Guide the next generation by leading small groups and activities.",
    image: "https://placehold.co/600x400.png",
    imageHint: "youth group",
    tags: ["Mentorship", "Youth", "Teaching"],
    compatibility: 88,
  },
  {
    title: "Welcome Team Host",
    description: "Be the first friendly face visitors see on Sunday mornings.",
    image: "https://placehold.co/600x400.png",
    imageHint: "church welcome",
    tags: ["Hospitality", "Greeting", "Indoors"],
    compatibility: 82,
  },
  {
    title: "Tech Team Support",
    description: "Assist with sound, lighting, and video production during services.",
    image: "https://placehold.co/600x400.png",
    imageHint: "sound board",
    tags: ["Technology", "Behind the Scenes"],
    compatibility: 75,
  },
  {
    title: "Justice Tosh Ministries",
    description: `JTM is an arm of PCOTLG committed to the deep studying of the Scriptures. It will be with sincere intention, to ascertain that careful, critical explanation and interpretation of the Scriptures be given.`,
    image: "https://placehold.co/600x400.png",
    imageHint: "bible study",
    tags: ["Study", "Theology", "Education"],
    compatibility: 92,
  },
];

const sacredSpaces = [
    { name: "Chapel of Serenity", status: "Open 8am - 6pm. Currently not crowded." },
    { name: "Meditation Garden", status: "Open 24/7." },
    { name: "Prayer Room 1", status: "Available" },
    { name: "Prayer Room 2", status: "In Use" },
];

const prayerRequests = [
    { name: "Jane Doe", request: "Please pray for my upcoming job interview this Wednesday. That God would grant me favor and peace.", userId: "janeuser", prayerCount: 5, createdAt: new Date() },
    { name: "John Smith", request: "For my mother's health, she's been unwell for a few weeks. Praying for a swift recovery.", userId: "johnuser", prayerCount: 12, createdAt: new Date() },
    { name: "Alice Johnson", request: "Pray for guidance and clarity on a difficult decision I have to make this week.", userId: "aliceuser", prayerCount: 8, createdAt: new Date() }
];

const blogPosts = [
    {
        title: "Finding Peace in the Storm",
        content: "Life can be turbulent, but faith is our anchor. This post explores how to find tranquility through prayer and trust in God's plan, even when the waves are high. We'll look at key scriptures that remind us of His presence and power.",
        author: "Admin User",
        date: new Date().toISOString(),
        image: "https://placehold.co/600x400.png",
        metaDescription: "Discover how to find unwavering peace through faith, even in the most challenging seasons of life. Practical steps and scripture for finding calm.",
        tags: ["Faith", "Peace", "Encouragement"],
    },
     {
        title: "The Power of Community Fellowship",
        content: "We were not meant to walk our faith journey alone. This article discusses the vital role of community in spiritual growth, accountability, and support, drawing from the example of the early church in Acts.",
        author: "Admin User",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        image: "https://placehold.co/600x400.png",
        metaDescription: "Explore the biblical importance of fellowship and learn how to connecting with other believers can strengthen your faith and provide essential support.",
        tags: ["Community", "Fellowship", "Church Life"],
    }
];

const events = [
    {
        title: "Annual Summer Picnic",
        description: "Join us for a day of fun, food, and fellowship at the park! We'll have games for all ages, a potluck lunch, and a time of worship together.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
        location: "Central Park, Pavilion 3",
        image: "https://placehold.co/600x400.png",
    },
    {
        title: "Youth Worship Night",
        description: "A special night of worship and teaching for students in grades 6-12. Bring a friend and come ready to encounter God in a powerful way.",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        location: "Main Sanctuary",
        image: "https://placehold.co/600x400.png",
    }
];

const sermons = [
    {
        title: "The Good Samaritan",
        speaker: "Bishop Justin M. McIntosh",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        series: "Parables of Jesus"
    },
    {
        title: "Armor of God",
        speaker: "Guest Speaker",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        series: "Spiritual Warfare"
    }
];

const communityGroups = [
    {
        name: "Men's Breakfast Club",
        description: "A weekly gathering for men to share life, study the Word, and enjoy a good breakfast together.",
        memberCount: 15,
        image: "https://placehold.co/600x400.png",
        imageHint: "men talking"
    },
     {
        name: "Young Professionals",
        description: "Connecting 20-30 somethings in the workplace to navigate career and faith.",
        memberCount: 22,
        image: "https://placehold.co/600x400.png",
        imageHint: "young professionals"
    }
];

const affiliates = [
    { name: "Angel's Ministry", location: "Unknown" },
    { name: "Justice Deliverance Ministry", location: "Unknown" },
    { name: "New Birth Sanctuary", location: "USA" },
    { name: "The Revival Pentecostal Church Of God", location: "Hall's Village, St. James" },
    { name: "New Birth Ministry Roebuck Street ATM", location: "Michael, Barbados" },
];

const liveStream = {
    title: "Sunday Morning Service",
    description: "Join us for worship and a message of hope.",
    isLive: false,
    streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Default placeholder video
};

const seedCollection = async (collectionName: string, data: any[], idField?: string) => {
    console.log(`Checking ${collectionName}...`);
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.limit(1).get();
    
    if (snapshot.empty) {
        console.log(`Seeding ${collectionName}...`);
        const batch = db.batch();
        data.forEach(item => {
            const docRef = idField && item[idField] ? collectionRef.doc(item[idField]) : collectionRef.doc();
            batch.set(docRef, item);
        });
        await batch.commit();
        console.log(`${collectionName} seeded successfully.`);
    } else {
        console.log(`${collectionName} collection already has data. Skipping seeding.`);
    }
}

const seedDocument = async (collectionName: string, docId: string, data: any) => {
     console.log(`Checking ${collectionName}/${docId}...`);
    const docRef = db.collection(collectionName).doc(docId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
        console.log(`Seeding ${collectionName}/${docId}...`);
        await docRef.set(data);
        console.log(`${collectionName}/${docId} seeded successfully.`);
    } else {
        console.log(`${collectionName}/${docId} document already exists. Skipping seeding.`);
    }
}

const seedDatabase = async () => {
  console.log('Starting to seed the database...');

  for (const userData of seedUsers) {
    try {
        const { uid, email, password, name, role } = userData;
        try {
            await auth.getUser(uid);
            console.log(`User ${email} already exists in Auth. Skipping creation.`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userRecord = await auth.createUser({
                    uid,
                    email,
                    password,
                    displayName: name,
                    emailVerified: true,
                    disabled: false,
                });
                console.log(`Successfully created user in Auth: ${userRecord.email}`);
            } else {
                throw error;
            }
        }

        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            console.log(`Creating Firestore document for ${email}...`);
             await userDocRef.set({
                name: name,
                email: email,
                role: role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
             console.log(`Firestore document for ${email} already exists. Skipping.`);
        }

    } catch (error) {
      console.error(`Error seeding user ${userData.email}:`, error);
    }
  }

  await seedCollection('leaders', leaders, 'id');
  await seedCollection('ministryOpportunities', ministryOpportunities);
  await seedCollection('sacredSpaces', sacredSpaces);
  await seedCollection('prayerRequests', prayerRequests);
  await seedCollection('blogPosts', blogPosts, 'title');
  await seedCollection('events', events);
  await seedCollection('sermons', sermons);
  await seedCollection('communityGroups', communityGroups);
  await seedCollection('affiliates', affiliates);

  await seedDocument('appState', 'liveStream', liveStream);

  console.log('Database seeding finished.');
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error('An unexpected error occurred during seeding:', error);
  process.exit(1);
});
