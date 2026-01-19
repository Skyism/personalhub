import { useState, useEffect } from 'react';
import TopAppBar from '@/components/navigation/TopAppBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DAYS_OF_WEEK } from '@/lib/skincare-seed';
import { getRoutines } from './actions';

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

export default function RoutinesPage() {
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
    }, []);

    const selectedDayName = DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.label || '';

    return (
        <div className="min-h-screen pb-20">
            <TopAppBar title="Edit Routines" fallbackHref="/skincare" />

            <div className="container mx-auto px-4 py-6 space-y-6">
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

                {/* Selected Day Display */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{selectedDayName}'s Routine</h1>
                </div>

                {/* Morning Routine Placeholder */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Morning Routine</h2>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Routine editor coming soon (Plan 9.2-02)
                        </p>
                    )}
                </Card>

                {/* Night Routine Placeholder */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Night Routine</h2>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Routine editor coming soon (Plan 9.2-02)
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}
