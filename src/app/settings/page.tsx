
"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateUserDocumentAndPhoto } from "@/lib/database/users";
import { Loader2, UserCircle, CalendarIcon, Check, Wallet, Upload } from "lucide-react";
import { HandDrawnSeparator } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Donation, getDonationsForUser } from "@/lib/database/giving";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { countries } from "@/lib/countries";

function ProfileForm() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openCountry, setOpenCountry] = useState(false)
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhotoPreview(user.photoURL || null);
      setBio(user.bio || "");
      setDob(user.dob ? new Date(user.dob) : undefined);
      setCountry(user.country || "");
      setPhone(user.phone || "");
      setState(user.state || "");
      setZip(user.zip || "");
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      await updateUserDocumentAndPhoto({
        name,
        photoFile,
        bio,
        dob: dob?.toISOString(),
        country,
        phone,
        state,
        zip,
      });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      setPhotoFile(null); // Reset file input state after successful upload
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your profile changes. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your public profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                    <AvatarImage src={photoPreview || undefined} alt="Profile Picture" data-ai-hint="profile picture" />
                    <AvatarFallback className="text-4xl">{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture" className="sr-only">Picture</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handlePhotoChange} className="max-w-xs file:text-primary file:font-semibold" />
                    <p className="text-xs text-muted-foreground">Upload a new photo for your profile.</p>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !dob && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dob}
                            onSelect={setDob}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1920}
                            toYear={new Date().getFullYear()}
                        />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                        {countries.length > 0 && <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-sm text-muted-foreground">
                            {countries.find(c => c.name === country)?.flag || "📞"} {countries.find(c => c.name === country)?.dial_code}
                        </span>}
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={cn(!(countries.find(c => c.name === country)) && "rounded-l-md")} />
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Country</Label>
                    <Popover open={openCountry} onOpenChange={setOpenCountry}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCountry}
                            className="w-full justify-between"
                            >
                            {country
                                ? countries.find((c) => c.name === country)?.name
                                : "Select country..."}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    {countries.map((c) => (
                                    <CommandItem
                                        key={c.code}
                                        value={c.name}
                                        onSelect={(currentValue) => {
                                            const selected = countries.find(co => co.name.toLowerCase() === currentValue.toLowerCase());
                                            setCountry(selected ? selected.name : "");
                                            setOpenCountry(false)
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            country === c.name ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {c.flag} {c.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zip">Zip / Postal Code</Label>
                    <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end w-full">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                    ) : (
                    "Save Changes"
                    )}
                </Button>
            </div>
        </CardFooter>
    </form>
  )
}

function GivingHistory() {
    const { user } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getDonationsForUser(user.uid).then(data => {
                setDonations(data);
                setIsLoading(false);
            });
        }
    }, [user]);

    return (
        <>
            <CardHeader>
                <CardTitle>Giving History</CardTitle>
                <CardDescription>A record of your tithes and offerings.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-40 w-full" />
                ) : donations.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Fund</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donations.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{format(new Date(d.date), 'PPP')}</TableCell>
                                    <TableCell>{d.fund}</TableCell>
                                    <TableCell className="text-right">${d.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You have no giving history yet.</p>
                    </div>
                )}
            </CardContent>
        </>
    )
}


export default function SettingsPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <DashboardLayout><div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div></DashboardLayout>;
  }
  
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col items-center text-center space-y-2">
           <UserCircle className="w-16 h-16 text-primary" />
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            Settings
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your account and profile settings.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />

        <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile"><UserCircle className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
                    <TabsTrigger value="giving"><Wallet className="mr-2 h-4 w-4"/>Giving History</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card>
                        <ProfileForm />
                    </Card>
                </TabsContent>
                <TabsContent value="giving">
                    <Card>
                        <GivingHistory />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
