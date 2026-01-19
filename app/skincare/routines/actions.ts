'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

type RoutineStep = {
    id: string;
    order: number;
    text: string;
};

export async function getRoutines(dayOfWeek?: number) {
    const supabase = await createClient();

    let query = supabase
        .from('skincare_routines')
        .select('*')
        .eq('user_id', TEMP_USER_ID)
        .order('day_of_week', { ascending: true })
        .order('time_of_day', { ascending: true });

    if (dayOfWeek !== undefined) {
        query = query.eq('day_of_week', dayOfWeek);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch routines: ${error.message}`);

    return data || [];
}

export async function upsertRoutine(
    dayOfWeek: number,
    timeOfDay: 'morning' | 'night',
    steps: RoutineStep[]
) {
    const supabase = await createClient();

    const { error } = await supabase.from('skincare_routines').upsert(
        {
            user_id: TEMP_USER_ID,
            day_of_week: dayOfWeek,
            time_of_day: timeOfDay,
            steps: steps,
            updated_at: new Date().toISOString(),
        },
        {
            onConflict: 'user_id,day_of_week,time_of_day',
        }
    );

    if (error) throw new Error(`Failed to save routine: ${error.message}`);

    revalidatePath('/skincare/routines');
    return { success: true };
}

export async function deleteRoutine(dayOfWeek: number, timeOfDay: 'morning' | 'night') {
    const supabase = await createClient();

    const { error } = await supabase
        .from('skincare_routines')
        .delete()
        .eq('user_id', TEMP_USER_ID)
        .eq('day_of_week', dayOfWeek)
        .eq('time_of_day', timeOfDay);

    if (error) throw new Error(`Failed to delete routine: ${error.message}`);

    revalidatePath('/skincare/routines');
    return { success: true };
}
