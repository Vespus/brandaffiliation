"use client"

import { Button } from "@/components/ui/button"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import { Scroller } from "@/components/ui/scroller";
import { format, fromUnixTime, getUnixTime } from "date-fns"
import * as React from "react";

export type CalendarWithTimeProps = CalendarProps & {
    dateFormat?: string;
    value?: number;
    onValueChange?: (value?: number) => void
};

export const CalendarWithTime = ({
                                     value,
                                     onValueChange,
                                     ...props
                                 }: CalendarWithTimeProps) => {
    const selectedDate = value ? fromUnixTime(value) : undefined

    // Mock time slots data
    const timeSlots = Array.from({length: 48}, (_, i) => {
        const hour = Math.floor(i / 2).toString().padStart(2, '0')
        const minute = i % 2 === 0 ? '00' : '30'
        return {time: `${hour}:${minute}`, available: true}
    })

    const handleTimeChange = (time: string) => {
        if (selectedDate) {
            const [hours = 0, minutes = 0] = time.split(":").map(Number)
            selectedDate.setHours(hours)
            selectedDate.setMinutes(minutes)
            onValueChange?.(getUnixTime(selectedDate))
        }
    }

    const handleDateChange = (date: Date | undefined) => {
        if (!date) {
            onValueChange?.(undefined)
            return
        }

        onValueChange?.(getUnixTime(date))
    }


    return (
        <div className="rounded-md border">
            <div className="flex max-sm:flex-col">
                <Calendar
                    {...props}
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    className="p-2 sm:pe-5"
                />
                <div className="relative w-full max-sm:h-48 sm:w-40">
                    <div className="absolute inset-0 py-4 max-sm:border-t">
                        <Scroller className="h-full sm:border-s">
                            <div className="space-y-3">
                                <div className="flex h-5 shrink-0 items-center px-5">

                                </div>
                                <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                                    {timeSlots.map(({time: timeSlot, available}) => (
                                        <Button
                                            key={timeSlot}
                                            variant={(selectedDate ? format(selectedDate, "HH:mm") === timeSlot : false) ? "default" : "outline"}
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleTimeChange(timeSlot)}
                                            disabled={!available}
                                        >
                                            {timeSlot}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Scroller>
                    </div>
                </div>
            </div>
        </div>
    )
}
