import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Server, Bell, Shield, Database, Save } from "lucide-react"

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "admin") redirect("/dashboard")
  const user = session.user
  const token = session.backendToken

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <AdminNav userEmail={user.email || ""} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="text-slate-400">Configure system-wide settings and preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Configuration */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Server className="mr-2 h-5 w-5 text-cyan-500" />
                System Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxScans" className="text-slate-300">
                  Max Concurrent Scans
                </Label>
                <Input
                  id="maxScans"
                  type="number"
                  defaultValue="10"
                  className="bg-slate-800/50 border-slate-700/50 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scanTimeout" className="text-slate-300">
                  Scan Timeout (minutes)
                </Label>
                <Input
                  id="scanTimeout"
                  type="number"
                  defaultValue="30"
                  className="bg-slate-800/50 border-slate-700/50 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">Maintenance Mode</p>
                  <p className="text-sm text-slate-400">Disable new scans temporarily</p>
                </div>
                <Switch />
              </div>

              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-cyan-500" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Manage security configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">Require 2FA for Admins</p>
                  <p className="text-sm text-slate-400">Enforce two-factor authentication</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">Session Timeout</p>
                  <p className="text-sm text-slate-400">Auto-logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDuration" className="text-slate-300">
                  Session Duration (hours)
                </Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  defaultValue="24"
                  className="bg-slate-800/50 border-slate-700/50 text-slate-100"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Bell className="mr-2 h-5 w-5 text-cyan-500" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">Critical Alerts</p>
                  <p className="text-sm text-slate-400">Notify admins of critical issues</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">Daily Reports</p>
                  <p className="text-sm text-slate-400">Send daily activity summaries</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">User Activity Alerts</p>
                  <p className="text-sm text-slate-400">Notify on suspicious activity</p>
                </div>
                <Switch />
              </div>

              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Database className="mr-2 h-5 w-5 text-cyan-500" />
                Database Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Manage database and storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retentionPeriod" className="text-slate-300">
                  Data Retention Period (days)
                </Label>
                <Input
                  id="retentionPeriod"
                  type="number"
                  defaultValue="90"
                  className="bg-slate-800/50 border-slate-700/50 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-slate-200 font-medium">Auto Backup</p>
                  <p className="text-sm text-slate-400">Daily automated backups</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Run Manual Backup
              </Button>

              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Database Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
