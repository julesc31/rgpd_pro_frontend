import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Activity, Search, Filter, CheckCircle, Clock, XCircle } from "lucide-react"

export default async function AdminScansPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch all scans with user information
  const { data: allScans } = await supabase
    .from("scans")
    .select(
      `
      *,
      profiles (
        full_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false })

  const totalScans = allScans?.length || 0
  const runningScans = allScans?.filter((s) => s.status === "running").length || 0
  const completedScans = allScans?.filter((s) => s.status === "completed").length || 0
  const failedScans = allScans?.filter((s) => s.status === "failed").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <AdminNav userEmail={user.email || ""} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Scan Management
            </h1>
            <p className="text-slate-400">Monitor and manage all security scans</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Scans" value={totalScans.toString()} icon={Activity} color="cyan" />
          <StatCard title="Running" value={runningScans.toString()} icon={Clock} color="blue" />
          <StatCard title="Completed" value={completedScans.toString()} icon={CheckCircle} color="green" />
          <StatCard title="Failed" value={failedScans.toString()} icon={XCircle} color="red" />
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search scans by URL or user..."
                  className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scans Table */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-cyan-500" />
              All Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allScans && allScans.length > 0 ? (
                allScans.map((scan) => <ScanRow key={scan.id} scan={scan} />)
              ) : (
                <div className="text-center py-8 text-slate-400">No scans found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
}) {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-500 border-cyan-500/30",
    blue: "from-blue-500 to-indigo-500 border-blue-500/30",
    green: "from-green-500 to-emerald-500 border-green-500/30",
    red: "from-red-500 to-rose-500 border-red-500/30",
  }

  return (
    <Card className={`bg-slate-900/50 border backdrop-blur-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{title}</span>
          <Icon className="h-5 w-5 text-cyan-500" />
        </div>
        <div className="text-3xl font-bold text-slate-100">{value}</div>
      </CardContent>
    </Card>
  )
}

function ScanRow({ scan }: { scan: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "running":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Running
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-slate-200 font-medium">{scan.target_url}</h3>
          {getStatusBadge(scan.status)}
        </div>
        <div className="flex items-center space-x-4 text-xs text-slate-500">
          <span>User: {scan.profiles?.email || "Unknown"}</span>
          <span>•</span>
          <span className="capitalize">{scan.scan_type} scan</span>
          <span>•</span>
          <span>{new Date(scan.created_at).toLocaleString()}</span>
          {scan.status === "running" && (
            <>
              <span>•</span>
              <span className="text-cyan-400">{scan.progress}% complete</span>
            </>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
        View Details
      </Button>
    </div>
  )
}
