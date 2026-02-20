import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { apiGet } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, Filter, MoreVertical, Shield, CheckCircle } from "lucide-react"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")
  if (session.user.role !== "admin") redirect("/dashboard")

  const user = session.user
  let usersWithStats: any[] = []
  try {
    usersWithStats = await apiGet<any[]>("/admin/users", session.backendToken)
  } catch { /* données non disponibles */ }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto p-4">
        <AdminNav userEmail={user.email || ""} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-slate-400">Manage all registered users and their accounts</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={usersWithStats.length.toString()} color="cyan" />
          <StatCard
            title="Active Users"
            value={usersWithStats.filter((u) => u.subscription_status === "active").length.toString()}
            color="green"
          />
          <StatCard
            title="Free Tier"
            value={usersWithStats.filter((u) => u.subscription_status === "free").length.toString()}
            color="blue"
          />
          <StatCard
            title="Admin Users"
            value={usersWithStats.filter((u) => u.role === "admin").length.toString()}
            color="purple"
          />
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search users by name or email..."
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

        {/* Users Table */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Users className="mr-2 h-5 w-5 text-cyan-500" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersWithStats.map((userProfile) => (
                <UserRow key={userProfile.id} user={userProfile} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-500 border-cyan-500/30",
    green: "from-green-500 to-emerald-500 border-green-500/30",
    blue: "from-blue-500 to-indigo-500 border-blue-500/30",
    purple: "from-purple-500 to-pink-500 border-purple-500/30",
  }

  return (
    <Card className={`bg-slate-900/50 border backdrop-blur-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardContent className="p-6">
        <div className="text-sm text-slate-400 mb-2">{title}</div>
        <div className="text-3xl font-bold text-slate-100">{value}</div>
      </CardContent>
    </Card>
  )
}

function UserRow({ user }: { user: any }) {
  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }
    return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50">User</Badge>
  }

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
    return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50">Free</Badge>
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <Avatar>
          <AvatarFallback className="bg-slate-700 text-cyan-500">
            {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-slate-200 font-medium">{user.full_name || "Unnamed User"}</h3>
            {getRoleBadge(user.role)}
            {getStatusBadge(user.subscription_status)}
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>{user.email}</span>
            <span>•</span>
            <span>{user.scanCount} scans</span>
            <span>•</span>
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  )
}
