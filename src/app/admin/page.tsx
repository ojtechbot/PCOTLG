
import {
    Activity,
    BookOpen,
    Calendar,
    Newspaper,
    Send,
    Users,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LiveStreamAdmin } from "@/components/live-stream-admin"
import { format } from "date-fns"
import { ActiveUsersStat } from "@/components/admin/active-users-stat";
import { ContentDistributionChart } from "@/components/admin/content-distribution-chart"
import type { User } from "@/hooks/use-auth"
import { getAdminDashboardData } from "@/lib/database/dashboard"


export default async function AdminDashboard() {
  const { recentSignups, totalUsers, contentStats } = await getAdminDashboardData();
  
  const engagementData = [
    { name: 'Blog Posts', value: contentStats.blogs, fill: 'hsl(var(--chart-1))' },
    { name: 'Community Groups', value: contentStats.groups, fill: 'hsl(var(--chart-2))' },
    { name: 'Events', value: contentStats.events, fill: 'hsl(var(--chart-3))' },
    { name: 'Sermons', value: contentStats.sermons, fill: 'hsl(var(--chart-4))' },
    { name: 'Leaders', value: contentStats.leaders, fill: 'hsl(var(--chart-5))' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                All registered members.
              </p>
            </CardContent>
          </Card>
          
          <ActiveUsersStat />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blog Posts</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{contentStats.blogs}</div>
              <p className="text-xs text-muted-foreground">
                Number of articles published.
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{contentStats.events}</div>
              <p className="text-xs text-muted-foreground">
                Number of scheduled events.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
             <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>
                  Breakdown of content types across the platform.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ContentDistributionChart data={engagementData} />
            </CardContent>
          </Card>
          <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>
                    Manage community groups, sermons, and events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Link href="/admin/leaders" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                        <Users className="h-5 w-5" />
                        Manage Leaders
                    </Button>
                  </Link>
                  <Link href="/admin/community" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                        <Users className="h-5 w-5" />
                        Manage Community
                    </Button>
                  </Link>
                  <Link href="/admin/sermons" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <BookOpen className="h-5 w-5" />
                      Manage Sermons
                    </Button>
                  </Link>
                   <Link href="/admin/events" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Calendar className="h-5 w-5" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link href="/admin/blogs" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Newspaper className="h-5 w-5" />
                      Manage Blog
                    </Button>
                  </Link>
                   <Link href="/admin/notifications" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Send className="h-5 w-5" />
                      Send Notification
                    </Button>
                  </Link>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle>Live Stream Controls</CardTitle>
                  <CardDescription>
                    Manage and broadcast your live stream.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <LiveStreamAdmin />
                </CardContent>
              </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Recent Sign-ups</CardTitle>
                <CardDescription>
                    The latest members to join the community.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Sign-up Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSignups.map((user: User) => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.photoURL ?? `https://placehold.co/40x40.png?text=${user.name?.charAt(0)}`} alt="Avatar" data-ai-hint="portrait" />
                                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-0.5">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of recent activities (placeholder).</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No recent activity to display.</p>
                </CardContent>
            </Card>
        </div>

      </main>
    </div>
  )
}
