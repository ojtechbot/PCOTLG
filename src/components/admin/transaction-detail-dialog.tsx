
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Donation } from "@/lib/database/giving"
import { format } from "date-fns"
import Image from "next/image"
import { useRef } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Download, Image as ImageIcon, FileText } from "lucide-react"

interface TransactionDetailDialogProps {
  transaction: Donation
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailDialog({ transaction, onOpenChange }: TransactionDetailDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = () => {
    if (receiptRef.current) {
      html2canvas(receiptRef.current, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `donation_receipt_${transaction.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const downloadAsPdf = () => {
    if (receiptRef.current) {
      html2canvas(receiptRef.current, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`donation_receipt_${transaction.id}.pdf`);
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            A receipt for the donation made on {format(new Date(transaction.date), 'PPP')}.
          </DialogDescription>
        </DialogHeader>
        <div ref={receiptRef} className="p-6 border rounded-lg bg-background relative overflow-hidden">
            <Image 
                src="/images/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5"
            />
            <div className="space-y-4 relative z-10">
                <div className="text-center pb-4 border-b">
                    <h3 className="font-bold text-lg">Donation Receipt</h3>
                    <p className="text-sm text-muted-foreground">Pentecostal Church of the Living God</p>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-xs">{transaction.id}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(new Date(transaction.date), 'PPpp')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Donor:</span>
                    <span className="font-medium">{transaction.userName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{transaction.userEmail}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Fund:</span>
                    <span className="font-medium">{transaction.fund}</span>
                </div>
                <div className="pt-4 border-t mt-4 flex justify-between items-baseline">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">${transaction.amount.toFixed(2)}</span>
                </div>
            </div>
        </div>
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
                <Button variant="outline" onClick={downloadAsImage}><ImageIcon className="mr-2 h-4 w-4" /> Share as Image</Button>
                <Button variant="outline" onClick={downloadAsPdf}><FileText className="mr-2 h-4 w-4" /> Share as PDF</Button>
            </div>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
