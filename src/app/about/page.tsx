
"use client"

import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Heart, Rocket, Target, Church, BookHeart, ShieldCheck, Handshake, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks = [
    { href: "#mission", label: "Mission & Vision" },
    { href: "#values", label: "Core Values" },
    { href: "#beliefs", label: "Our Beliefs" },
];

const beliefs = [
  {
    icon: ShieldCheck,
    title: "The Holy Bible",
    content: "We believe the Bible is the divinely inspired, infallible, and authoritative Word of God, serving as the final arbitrator in all matters of faith."
  },
  {
    icon: Star,
    title: "The Nature of God",
    content: "We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit—distinguishable but indivisible."
  },
   {
    icon: Handshake,
    title: "The Church",
    content: "We believe the church is a 'called out' body of believers, both local and universal, united by the Spirit through Jesus Christ."
  },
  {
    icon: BookHeart,
    title: "The Person of Christ",
    content: "We believe in the full deity and sinless humanity of Christ Jesus, His virgin birth, atoning death, resurrection, and eventual return."
  },
  {
    icon: BookOpen,
    title: "Core Doctrines",
    content: "We believe in the foundational Christian doctrines of Sin, Salvation, Grace, Faith, Repentance, Regeneration, Reconciliation, and Sanctification."
  },
  {
    icon: Heart,
    title: "Sanctity of Life & Marriage",
    content: "We believe in the sanctity of human life and that marriage is exclusively the uniting of one man and one woman, reflecting God's design."
  },
];

const coreValues = [
    {
        icon: Users,
        title: "Community",
        description: "We are a family, committed to supporting and encouraging one another through all of life's joys and challenges."
    },
    {
        icon: BookOpen,
        title: "Biblical Truth",
        description: "We believe the Bible is the inspired Word of God and the ultimate authority for our faith and lives."
    },
    {
        icon: Heart,
        title: "Compassionate Service",
        description: "We are called to be the hands and feet of Jesus, serving our local and global communities with love."
    }
]

function AboutPageContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-secondary/30 py-20 md:py-32">
        <div className="absolute inset-0">
          <Image src="/images/congregation.jpg" alt="Church building" fill className="object-cover opacity-10" data-ai-hint="church building" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative text-center">
            <Church className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                About The Pentecostal Church of the Living God
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Learn more about our history, our mission, and what we believe as a community of faith dedicated to serving God and our neighbors.
            </p>
        </div>
      </section>

    <div className="flex-1">
        {/* Sticky Nav */}
        <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-center items-center h-14 space-x-4">
                    {navLinks.map(link => (
                        <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>

      <div className="container mx-auto max-w-5xl space-y-24 p-4 md:p-8">
          {/* Mission and Vision Section */}
          <section id="mission" className="grid md:grid-cols-2 gap-8 md:gap-12 items-center scroll-mt-24">
              <div className="space-y-4">
                  <Rocket className="w-10 h-10 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-headline text-primary">Our Mission</h2>
                  <p className="text-base md:text-lg text-muted-foreground">
                  To present a clear and faithful interpretation of Scripture that inspires discovery, understanding, and application of God’s Word, cultivating Christlike maturity in believers.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground">
                  Through prophetic and healing anointing's, we aim to grow vibrant church communities, prepare believers for ministry and global missions, and impact lives through teaching, discipleship, and acts of service.
                  </p>
              </div>
              <div className="space-y-4">
                   <Target className="w-10 h-10 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-headline text-primary">Our Vision</h2>
                    <p className="text-base md:text-lg text-muted-foreground">
                    To transform lives through the unadulterated Word of God, fostering spiritual growth, healing, and empowerment while equipping believers to fulfill their divine purpose and magnify God’s name globally.
                    </p>
              </div>
          </section>

           <HandDrawnSeparator className="stroke-current text-border/50" />

           {/* Welcome Message Section */}
            <section className="grid lg:grid-cols-5 gap-x-12 gap-y-8 items-center">
                <div className="lg:col-span-2">
                    <Image 
                        src="/images/bishop.png" 
                        alt="Bishop Justin M. McIntosh"
                        width={600} 
                        height={700}
                        className="rounded-lg shadow-xl"
                        data-ai-hint="portrait bishop" 
                    />
                </div>
                 <div className="lg:col-span-3">
                    <h2 className="text-3xl md:text-4xl font-headline text-primary mb-4">A Message From Our Bishop</h2>
                    <div className="space-y-4 text-base md:text-lg text-muted-foreground">
                        <p>
                            God has raised up Justin Martin McIntosh as a pioneer for His people. He has played an instrumental role in planting several churches in Barbados. Currently, Bishop McIntosh serves as the presiding Bishop of three Pentecostal Church of the Living God congregations and is involved in the organization and structuring of other local churches.
                        </p>
                        <p>
                            Our Purpose Statement is taken from the acronym TIME: To grow in our membership, Into Christlike maturity, Making ready for ministry in the church and mission in the world, Effectively affecting lives to magnify God’s name.
                        </p>
                        <p className="font-semibold text-foreground">
                            We invite you to explore our app and reap the benefits thereof, and also learn how you can partner with us in making a difference in this generation. God bless you abundantly.
                        </p>
                    </div>
                </div>
            </section>

            <HandDrawnSeparator className="stroke-current text-border/50" />

            {/* Core Values */}
            <section id="values" className="scroll-mt-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline text-primary">Our Core Values</h2>
                    <p className="mt-2 text-muted-foreground text-base md:text-lg">What we stand for as a community.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {coreValues.map(value => (
                        <div key={value.title} className="text-center p-6">
                             <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <value.icon className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <h3 className="font-headline text-2xl text-foreground mb-2">{value.title}</h3>
                            <p className="text-muted-foreground text-base">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            <HandDrawnSeparator className="stroke-current text-border/50" />

          {/* Statement of Faith */}
          <section id="beliefs" className="scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline text-primary">What We Believe</h2>
                <p className="text-muted-foreground mt-2 text-base md:text-lg">A summary of our statement of faith.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beliefs.map((belief, index) => (
                    <Card key={index} className="border-border/50 text-center">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <belief.icon className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="font-headline text-xl">{belief.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground text-sm">{belief.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="text-center mt-12">
                <Button variant="outline" asChild>
                    <Link href="#">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read Full Statement of Faith
                    </Link>
                </Button>
            </div>
          </section>
      </div>
    </div>
    </>
  )
}


export default function AboutPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-12 w-1/2 mx-auto mt-8" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-96 w-full mt-8" />
                </div>
            </DashboardLayout>
        )
    }

    if (user) {
        return (
            <DashboardLayout>
                <AboutPageContent />
            </DashboardLayout>
        )
    }

    return (
        <PublicLayout>
            <AboutPageContent />
        </PublicLayout>
    )
}
