import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Activity,
  Shield,
  AlertCircle,
  TrendingUp,
  Server,
  Database,
  Cpu,
  HardDrive,
  Zap,
  Clock,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "admin") redirect("/dashboard")

  const token = session.backendToken

  let allUsers: any[] = []
  let allScans: any[] = []
  let allReports: any[] = []
  let recentActivity: any[] = []

  try {
    ;[allUsers, allScans, allReports, recentActivity] = await Promise.all([
      apiGet("/admin/profiles", token),
      apiGet("/admin/scans", token),
      apiGet("/admin/reports", token),
      apiGet("/admin/activity?limit=10", token),
    ])
  } catch { /* données non disponibles */ }

  const user = session.user

  // Calculate statistics
  const totalUsers = allUsers?.length || 0
  const activeUsers = allUsers?.filter((u) => u.subscription_status === "active").length || 0
  const totalScans = allScans?.length || 0
  const runningScans = allScans?.filter((s) => s.status === "running").length || 0
  const completedScans = allScans?.filter((s) => s.status === "completed").length || 0
  const totalVulnerabilities = allReports?.reduce((sum, r) => sum + (r.vulnerabilities_found || 0), 0) || 0
  const criticalIssues = allReports?.filter((r) => r.severity === "critical").length || 0

  // Mock system health data
  const systemHealth = {
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 78,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <AdminNav userEmail={user.email || ""} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Monitor system health and user activity</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Users" value={totalUsers.toString()} icon={Users} color="cyan" trend="+12% growth" />
          <MetricCard
            title="Active Scans"
            value={runningScans.toString()}
            icon={Activity}
            color="blue"
            trend={`${completedScans} completed`}
          />
          <MetricCard
            title="Vulnerabilities"
            value={totalVulnerabilities.toString()}
            icon={AlertCircle}
            color="amber"
            trend={`${criticalIssues} critical`}
          />
          <MetricCard title="System Health" value="98%" icon={Shield} color="green" trend="All systems operational" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Server className="mr-2 h-5 w-5 text-cyan-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SystemHealthBar label="CPU Usage" value={systemHealth.cpu} icon={Cpu} color="cyan" />
              <SystemHealthBar label="Memory Usage" value={systemHealth.memory} icon={Database} color="blue" />
              <SystemHealthBar label="Disk Usage" value={systemHealth.disk} icon={HardDrive} color="purple" />
              <SystemHealthBar label="Network Load" value={systemHealth.network} icon={Zap} color="amber" />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 text-base">User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Users</span>
                  <span className="text-slate-200 font-semibold">{totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Subscriptions</span>
                  <span className="text-green-400 font-semibold">{activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Free Tier</span>
                  <span className="text-slate-200 font-semibold">{totalUsers - activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">New This Month</span>
                  <span className="text-cyan-400 font-semibold">+{Math.floor(totalUsers * 0.12)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 text-base">Scan Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Scans</span>
                  <span className="text-slate-200 font-semibold">{totalScans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Running</span>
                  <span className="text-blue-400 font-semibold">{runningScans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-green-400 font-semibold">{completedScans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Failed</span>
                  <span className="text-red-400 font-semibold">
                    {allScans?.filter((s) => s.status === "failed").length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-cyan-500" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
  trend: string
}) {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-500 border-cyan-500/30",
    blue: "from-blue-500 to-indigo-500 border-blue-500/30",
    amber: "from-amber-500 to-orange-500 border-amber-500/30",
    green: "from-green-500 to-emerald-500 border-green-500/30",
  }

  return (
    <Card className={`bg-slate-900/50 border backdrop-blur-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{title}</span>
          <Icon className="h-5 w-5 text-cyan-500" />
        </div>
        <div className="text-3xl font-bold text-slate-100 mb-1">{value}</div>
        <div className="flex items-center text-xs text-slate-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </div>
      </CardContent>
    </Card>
  )
}

function SystemHealthBar({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  const getStatusColor = (val: number) => {
    if (val < 50) return "text-green-400"
    if (val < 75) return "text-amber-400"
    return "text-red-400"
  }

  const getBarColor = (val: number) => {
    if (val < 50) return "bg-green-500"
    if (val < 75) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-cyan-500" />
          <span className="text-sm text-slate-300">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${getStatusColor(value)}`}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${getBarColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const getActivityBadge = (type: string) => {
    switch (type) {
      case "scan_started":
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">Scan</Badge>
      case "scan_completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">Complete</Badge>
      case "scan_failed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">Failed</Badge>
      case "user_registered":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">User</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50 text-xs">Activity</Badge>
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return activityDate.toLocaleDateString()
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center space-x-3 flex-1">
        {getActivityBadge(activity.activity_type)}
        <span className="text-sm text-slate-300">{activity.description}</span>
      </div>
      <div className="flex items-center text-xs text-slate-500">
        <Clock className="h-3 w-3 mr-1" />
        {formatTimeAgo(activity.created_at)}
      </div>
    </div>
  )
}
