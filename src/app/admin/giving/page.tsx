
"use client"

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { DollarSign, Download } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { type Donation } from "@/lib/database/giving";
import { Button } from "@/components/ui/button";
import { TransactionDetailDialog } from "@/components/admin/transaction-detail-dialog";

export default function AdminGivingPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Donation | null>(null);


    useEffect(() => {
        const q = query(collection(db, "donations"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const donationsData = snapshot.docs.map(doc => {
                const data = doc.data();
                if (!data.date) return null;
                return {
                    id: doc.id,
                    ...data,
                    date: (data.date as any).toDate().toISOString(),
                } as Donation;
            }).filter(Boolean) as Donation[];

            setDonations(donationsData);

            const totalAmount = donationsData.reduce((sum, donation) => sum + donation.amount, 0);
            setTotal(totalAmount);
            
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching donations:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const exportToCsv = () => {
        const headers = ["Date", "Name", "Email", "Amount", "Fund"];
        const rows = donations.map(d => [
            format(new Date(d.date), "yyyy-MM-dd"),
            `"${d.userName}"`,
            d.userEmail,
            d.amount.toFixed(2),
            d.fund
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + "\n" 
            + rows.join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "donations_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Giving & Donations</CardTitle>
                        <CardDescription>
                            A record of all contributions made through the app.
                        </CardDescription>
                    </div>
                    <Button onClick={exportToCsv} variant="outline" disabled={isLoading || donations.length === 0}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No donations yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">When users give, their contributions will appear here.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Fund</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.map((donation) => (
                                    <TableRow key={donation.id} onClick={() => setSelectedTransaction(donation)} className="cursor-pointer">
                                        <TableCell>{format(new Date(donation.date), 'PPP')}</TableCell>
                                        <TableCell className="font-medium">{donation.userName}</TableCell>
                                        <TableCell>{donation.userEmail}</TableCell>
                                        <TableCell>{donation.fund}</TableCell>
                                        <TableCell className="text-right">${donation.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="font-bold">Total</TableCell>
                                    <TableCell className="text-right font-bold">${total.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
        {selectedTransaction && (
            <TransactionDetailDialog 
                transaction={selectedTransaction} 
                onOpenChange={() => setSelectedTransaction(null)} 
            />
        )}
        </>
    );
}
