
"use client"

import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Milestone, Target, Video } from "lucide-react";
import { useState } from "react";
import { SetGoalDialog } from "@/components/set-goal-dialog";
import { PathwayDetailDialog, type Pathway } from "@/components/pathway-detail-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const pathways: Pathway[] = [
    {
        title: "Foundations of Faith",
        description: "A 12-week journey through the core beliefs of Christianity. Perfect for new believers.",
        progress: 75,
        category: "Theology"
    },
    {
        title: "The Book of John",
        description: "An in-depth verse-by-verse study of the Gospel of John to know Jesus better.",
        progress: 40,
        category: "Bible Study"
    },
    {
        title: "Spiritual Disciplines",
        description: "Learn and practice habits that foster spiritual maturity, like prayer, fasting, and solitude.",
        progress: 15,
        category: "Practical Faith"
    }
]

const resources = [
    {
        title: "Sermon: The Parable of the Sower",
        type: "Video",
        icon: Video,
        source: "By Pastor Mike"
    },
    {
        title: "Article: How to Read the Bible for All Its Worth",
        type: "Reading",
        icon: BookOpen,
        source: "Theology Today"
    },
    {
        title: "Guided Prayer: The Lord's Prayer",
        type: "Audio",
        icon: BookOpen,
        source: "Sacred Connect"
    }
]

export default function GrowthPage() {
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [currentGoal, setCurrentGoal] = useState("Read 1 chapter of John daily.");
    const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
    const [isLoading, setIsLoading] = useState(false);


  if(isLoading) {
    return (
        <DashboardLayout>
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            Discipleship Pathway
          </h1>
          <p className="text-muted-foreground">
            Your personalized journey of spiritual growth and learning.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />
        
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
                <h2 className="font-headline text-3xl text-primary">Your Learning Pathways</h2>
                <div className="space-y-6">
                    {pathways.map(path => (
                        <Card key={path.title} className="border-border/50">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="border-primary/50 text-primary mb-2">{path.category}</Badge>
                                        <CardTitle className="font-headline">{path.title}</CardTitle>
                                        <CardDescription>{path.description}</CardDescription>
                                    </div>
                                    <Button onClick={() => setSelectedPathway(path)}>Continue</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="w-full bg-secondary rounded-full h-2.5">
                                      <div className="bg-primary h-2.5 rounded-full" style={{width: `${path.progress}%`}}></div>
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground">{path.progress}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="space-y-8">
                <h2 className="font-headline text-3xl text-primary">Goals & Resources</h2>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Current Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{currentGoal}</p>
                        <p className="text-sm text-muted-foreground">You're 3 days in!</p>
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsGoalDialogOpen(true)}>Set a New Goal</Button>
                    </CardContent>
                </Card>
                 <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Milestone className="w-5 h-5" /> Recommended For You</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resources.map(res => (
                            <div key={res.title} className="flex items-start gap-4 hover:bg-secondary/20 p-2 rounded-lg transition-colors">
                                <res.icon className="w-8 h-8 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">{res.title}</p>
                                    <p className="text-sm text-muted-foreground">{res.source}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
       {isGoalDialogOpen && <SetGoalDialog onOpenChange={setIsGoalDialogOpen} onSetGoal={setCurrentGoal} />}
       {selectedPathway && <PathwayDetailDialog pathway={selectedPathway} onOpenChange={() => setSelectedPathway(null)} />}
    </DashboardLayout>
  );
}
