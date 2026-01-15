import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MorningReminderForm from './MorningReminderForm'

// TODO: Replace with actual user_id from Supabase auth once implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

export default async function SkincareSettingsPage() {
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('skincare_settings')
    .select('*')
    .eq('user_id', TEMP_USER_ID)
    .maybeSingle()

  if (error) {
    console.error('Error fetching skincare settings:', error)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Skincare Settings</h1>

        <Card className="bg-muted/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Morning Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            {!settings ? (
              <p className="text-muted-foreground mb-4">
                Configure your skincare reminders below
              </p>
            ) : null}
            <MorningReminderForm initialSettings={settings} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
