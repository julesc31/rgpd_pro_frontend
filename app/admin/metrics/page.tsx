import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, Users, Shield, AlertCircle } from "lucide-react"

export default async function AdminMetricsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "admin") redirect("/dashboard")
  const user = session.user
  const token = session.backendToken

  // Fetch metrics data via backend API
  let allUsers: any[] = []
  let allScans: any[] = []
  let allReports: any[] = []
  try {
    ;[allUsers, allScans, allReports] = await Promise.all([
      apiGet("/admin/profiles", token),
      apiGet("/admin/scans", token),
      apiGet("/admin/reports", token),
    ])
  } catch { /* données non disponibles */ }

  // Calculate metrics
  const totalUsers = allUsers?.length || 0
  const totalScans = allScans?.length || 0
  const totalVulnerabilities = allReports?.reduce((sum: number, r: any) => sum + (r.vulnerabilities_found || 0), 0) || 0
  const avgSecurityScore =
    allReports && allReports.length > 0
      ? Math.round(allReports.reduce((sum: number, r: any) => sum + (r.security_score || 0), 0) / allReports.length)
      : 0

  // Mock time-series data for charts
  const monthlyData = [
    { month: "Jan", users: 45, scans: 120, vulnerabilities: 340 },
    { month: "Feb", users: 52, scans: 145, vulnerabilities: 380 },
    { month: "Mar", users: 61, scans: 178, vulnerabilities: 420 },
    { month: "Apr", users: 73, scans: 210, vulnerabilities: 390 },
    { month: "May", users: 89, scans: 267, vulnerabilities: 450 },
    { month: "Jun", users: totalUsers, scans: totalScans, vulnerabilities: totalVulnerabilities },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <AdminNav userEmail={user.email || ""} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Analytics & Metrics
          </h1>
          <p className="text-slate-400">Comprehensive platform analytics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={totalUsers.toString()}
            change="+12.5%"
            icon={Users}
            color="cyan"
            positive
          />
          <MetricCard
            title="Total Scans"
            value={totalScans.toString()}
            change="+18.2%"
            icon={Activity}
            color="blue"
            positive
          />
          <MetricCard
            title="Vulnerabilities Found"
            value={totalVulnerabilities.toString()}
            change="-5.3%"
            icon={AlertCircle}
            color="amber"
            positive
          />
          <MetricCard
            title="Avg Security Score"
            value={`${avgSecurityScore}%`}
            change="+3.1%"
            icon={Shield}
            color="green"
            positive
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Users className="mr-2 h-5 w-5 text-cyan-500" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{data.month}</span>
                      <span className="text-slate-200 font-semibold">{data.users} users</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${(data.users / totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                Scan Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{data.month}</span>
                      <span className="text-slate-200 font-semibold">{data.scans} scans</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${(data.scans / totalScans) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 text-base">Scan Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DistributionBar
                label="Quick Scans"
                value={allScans?.filter((s) => s.scan_type === "quick").length || 0}
                total={totalScans}
                color="amber"
              />
              <DistributionBar
                label="Normal Scans"
                value={allScans?.filter((s) => s.scan_type === "normal").length || 0}
                total={totalScans}
                color="cyan"
              />
              <DistributionBar
                label="Forensic Scans"
                value={allScans?.filter((s) => s.scan_type === "forensic").length || 0}
                total={totalScans}
                color="purple"
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 text-base">Vulnerability Severity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DistributionBar
                label="Critical"
                value={allReports?.filter((r) => r.severity === "critical").length || 0}
                total={allReports?.length || 1}
                color="red"
              />
              <DistributionBar
                label="High"
                value={allReports?.filter((r) => r.severity === "high").length || 0}
                total={allReports?.length || 1}
                color="amber"
              />
              <DistributionBar
                label="Medium"
                value={allReports?.filter((r) => r.severity === "medium").length || 0}
                total={allReports?.length || 1}
                color="yellow"
              />
              <DistributionBar
                label="Low"
                value={allReports?.filter((r) => r.severity === "low").length || 0}
                total={allReports?.length || 1}
                color="blue"
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 text-base">Subscription Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DistributionBar
                label="Active Subscriptions"
                value={allUsers?.filter((u) => u.subscription_status === "active").length || 0}
                total={totalUsers}
                color="green"
              />
              <DistributionBar
                label="Free Tier"
                value={allUsers?.filter((u) => u.subscription_status === "free").length || 0}
                total={totalUsers}
                color="slate"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  positive,
}: {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: string
  positive: boolean
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
        <div className="flex items-center text-xs">
          <TrendingUp className={`h-3 w-3 mr-1 ${positive ? "text-green-400" : "text-red-400"}`} />
          <span className={positive ? "text-green-400" : "text-red-400"}>{change}</span>
          <span className="text-slate-500 ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  const colorClasses = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    slate: "bg-slate-500",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-slate-300">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
