import { createFileRoute } from '@tanstack/react-router';
import { Bell, Megaphone, Send, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/superadmin/notifications')({
  component: NotificationsManagement,
});

function NotificationsManagement() {
  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Global Notifications</h1>
          <p className="text-muted-foreground">
            Broadcast announcements and manage notification templates.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Broadcast Announcement
              </CardTitle>
              <CardDescription>
                Send a system-wide alert to all hospitals or specific roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>All Users</option>
                  <option>All Hospital Admins</option>
                  <option>All Doctors</option>
                  <option>Specific Hospital</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Scheduled maintenance on Sunday..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Body</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Type your announcement here..."
                ></textarea>
              </div>
              <div className="pt-2 flex justify-end">
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">SMS</span>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  Config Needed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">In-App Alerts</span>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
