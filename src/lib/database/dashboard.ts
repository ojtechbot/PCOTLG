
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/hooks/use-auth"


export async function getAdminDashboardData() {
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
    const blogCol = collection(db, "blogPosts");
    const eventCol = collection(db, "events");
    const sermonCol = collection(db, "sermons");
    const groupCol = collection(db, "communityGroups");
    const leaderCol = collection(db, "leaders");

    try {
        const [
            usersSnapshot,
            recentSignupsSnapshot,
            blogsSnapshot,
            eventsSnapshot,
            sermonsSnapshot,
            groupsSnapshot,
            leadersSnapshot,
        ] = await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(usersQuery),
            getDocs(blogCol),
            getDocs(eventCol),
            getDocs(sermonCol),
            getDocs(groupCol),
            getDocs(leaderCol),
        ]);
        
        const recentSignups = recentSignupsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Ensure createdAt is a serializable string
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
            return { uid: doc.id, ...data, createdAt } as User
        });

        const totalUsers = usersSnapshot.size;
        const contentStats = {
            blogs: blogsSnapshot.size,
            events: eventsSnapshot.size,
            sermons: sermonsSnapshot.size,
            groups: groupsSnapshot.size,
            leaders: leadersSnapshot.size,
        };

        return { recentSignups, totalUsers, contentStats };
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        return { recentSignups: [], totalUsers: 0, contentStats: { blogs: 0, events: 0, sermons: 0, groups: 0, leaders: 0 } };
    }
}
