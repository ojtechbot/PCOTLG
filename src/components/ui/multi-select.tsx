
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type SelectableItem = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: SelectableItem[]
  selected: SelectableItem[]
  onChange: React.Dispatch<React.SetStateAction<SelectableItem[]>>
  className?: string
  placeholder?: string
  disabled?: boolean
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
  disabled = false,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: SelectableItem) => {
    onChange(selected.filter((s) => s.value !== item.value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between h-auto min-h-10 ${
            selected.length > 0 ? "h-auto" : ""
          }`}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((item) => (
              <Badge
                variant="secondary"
                key={item.value}
                className="mr-1"
                onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(item)
                }}
              >
                {item.label}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command className={className}>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
                {options.map((option) => (
                <CommandItem
                    key={option.value}
                    onSelect={() => {
                    onChange(
                        selected.some(s => s.value === option.value)
                        ? selected.filter((s) => s.value !== option.value)
                        : [...selected, option]
                    )
                    setOpen(true)
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        selected.some(s => s.value === option.value) ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {option.label}
                </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
