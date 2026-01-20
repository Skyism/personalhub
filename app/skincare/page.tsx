'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopAppBar from '@/components/navigation/TopAppBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DAYS_OF_WEEK } from '@/lib/skincare-seed';
import { getRoutines } from './routines/actions';

type RoutineStep = {
    id: string;
    order: number;
    text: string;
};

type Routine = {
    id: number;
    user_id: string;
    day_of_week: number;
    time_of_day: string;
    steps: RoutineStep[];
    created_at: string;
    updated_at: string;
};

export default function SkincarePage() {
    // Convert JS Date.getDay() (0=Sunday) to ISO 8601 (1=Monday, 7=Sunday)
    const getCurrentDayISO = () => {
        const jsDay = new Date().getDay();
        return jsDay === 0 ? 7 : jsDay;
    };

    const [selectedDay, setSelectedDay] = useState(getCurrentDayISO());
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRoutines() {
            setLoading(true);
            try {
                const data = await getRoutines();
                setRoutines(data as Routine[]);
            } catch (error) {
                console.error('Failed to fetch routines:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchRoutines();
    }, [selectedDay]);

    const selectedDayName = DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.label || '';

    // Extract steps for selected day
    const morningSteps =
        (routines.find((r) => r.day_of_week === selectedDay && r.time_of_day === 'morning')
            ?.steps as RoutineStep[]) || [];
    const nightSteps =
        (routines.find((r) => r.day_of_week === selectedDay && r.time_of_day === 'night')
            ?.steps as RoutineStep[]) || [];

    return (
        <div className="min-h-screen pb-20">
            <TopAppBar title="Skincare" />

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Today's Date */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold">{selectedDayName}</h1>
                    <p className="text-sm text-muted-foreground">Your daily routine</p>
                </div>

                {/* Day Selector */}
                <Card className="p-4">
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Select Day</h2>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {DAYS_OF_WEEK.map((day) => (
                            <Button
                                key={day.value}
                                variant={selectedDay === day.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedDay(day.value)}
                                className="flex-shrink-0 min-w-[80px]"
                            >
                                {day.short}
                            </Button>
                        ))}
                    </div>
                </Card>

                {loading ? (
                    <Card className="p-6">
                        <p className="text-sm text-muted-foreground">Loading routines...</p>
                    </Card>
                ) : (
                    <>
                        {/* Morning Routine */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Morning Routine</h2>
                            {morningSteps.length > 0 ? (
                                <ol className="space-y-2">
                                    {morningSteps
                                        .sort((a, b) => a.order - b.order)
                                        .map((step, index) => (
                                            <li key={step.id} className="text-base">
                                                {index + 1}. {step.text}
                                            </li>
                                        ))}
                                </ol>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No morning routine configured. Edit to add steps.
                                </p>
                            )}
                        </Card>

                        {/* Night Routine */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Night Routine</h2>
                            {nightSteps.length > 0 ? (
                                <ol className="space-y-2">
                                    {nightSteps
                                        .sort((a, b) => a.order - b.order)
                                        .map((step, index) => (
                                            <li key={step.id} className="text-base">
                                                {index + 1}. {step.text}
                                            </li>
                                        ))}
                                </ol>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No night routine configured. Edit to add steps.
                                </p>
                            )}
                        </Card>
                    </>
                )}

                {/* Edit Button */}
                <div className="flex justify-center pt-4">
                    <Link href="/skincare/routines">
                        <Button size="lg">Edit Routines</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
