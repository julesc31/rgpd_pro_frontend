"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Plus, Trash2, Edit, Search, AlertTriangle, Clock, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface DataBreach {
  id: string
  organization_id: string
  breach_date: string
  discovery_date: string
  description: string
  affected_individuals: number
  severity: string
  notification_sent: boolean
  notification_date?: string
  mitigation_actions: string
  created_at: string
  updated_at: string
}

export default function DataBreachesPage() {
  const [breaches, setBreaches] = useState<DataBreach[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBreach, setEditingBreach] = useState<DataBreach | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    breach_date: "",
    discovery_date: "",
    description: "",
    affected_individuals: 0,
    severity: "low",
    notification_sent: false,
    notification_date: "",
    mitigation_actions: "",
  })

  useEffect(() => {
    fetchBreaches()
    fetchOrganizations()
  }, [])

  const fetchBreaches = async () => {
    try {
      const data = await api.dataBreaches.list()
      setBreaches(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load breaches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const data = await api.organizations.list()
      setOrganizations(data)
    } catch (error) {
      console.error("Error loading organizations:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBreach) {
        await api.dataBreaches.update(editingBreach.id, formData)
        toast({
          title: "Success",
          description: "Breach updated successfully",
        })
      } else {
        await api.dataBreaches.create(formData)
        toast({
          title: "Success",
          description: "Breach created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchBreaches()
    } catch (error) {
      toast({
        title: "Error",
        description: editingBreach ? "Failed to update breach" : "Failed to create breach",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this breach?")) return

    try {
      await api.dataBreaches.delete(id)
      toast({
        title: "Success",
        description: "Breach deleted successfully",
      })
      fetchBreaches()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete breach",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (breach: DataBreach) => {
    setEditingBreach(breach)
    setFormData({
      organization_id: breach.organization_id,
      breach_date: breach.breach_date.split("T")[0],
      discovery_date: breach.discovery_date.split("T")[0],
      description: breach.description,
      affected_individuals: breach.affected_individuals,
      severity: breach.severity,
      notification_sent: breach.notification_sent,
      notification_date: breach.notification_date ? breach.notification_date.split("T")[0] : "",
      mitigation_actions: breach.mitigation_actions,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      breach_date: "",
      discovery_date: "",
      description: "",
      affected_individuals: 0,
      severity: "low",
      notification_sent: false,
      notification_date: "",
      mitigation_actions: "",
    })
    setEditingBreach(null)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Unknown Organization"
  }

  const filteredBreaches = breaches.filter(
    (breach) =>
      breach.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOrganizationName(breach.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Data Breaches
              </h1>
              <p className="text-gray-400 mt-2">Manage and track data breaches</p>
            </div>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                New Breach
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  {editingBreach ? "Edit Breach" : "Create Breach"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingBreach ? "Edit breach information" : "Fill in breach information"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="breach_date">Breach Date</Label>
                    <Input
                      id="breach_date"
                      type="date"
                      value={formData.breach_date}
                      onChange={(e) => setFormData({ ...formData, breach_date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discovery_date">Discovery Date</Label>
                    <Input
                      id="discovery_date"
                      type="date"
                      value={formData.discovery_date}
                      onChange={(e) => setFormData({ ...formData, discovery_date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="affected_individuals">Affected Individuals</Label>
                    <Input
                      id="affected_individuals"
                      type="number"
                      min="0"
                      value={formData.affected_individuals}
                      onChange={(e) =>
                        setFormData({ ...formData, affected_individuals: Number.parseInt(e.target.value) })
                      }
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      id="notification_sent"
                      type="checkbox"
                      checked={formData.notification_sent}
                      onChange={(e) => setFormData({ ...formData, notification_sent: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="notification_sent" className="font-normal">
                      Notification sent
                    </Label>
                  </div>

                  {formData.notification_sent && (
                    <div>
                      <Label htmlFor="notification_date">Notification Date</Label>
                      <Input
                        id="notification_date"
                        type="date"
                        value={formData.notification_date}
                        onChange={(e) => setFormData({ ...formData, notification_date: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the data breach"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mitigation_actions">Mitigation Actions</Label>
                  <Textarea
                    id="mitigation_actions"
                    value={formData.mitigation_actions}
                    onChange={(e) => setFormData({ ...formData, mitigation_actions: e.target.value })}
                    placeholder="Describe actions taken"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {editingBreach ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                    className="flex-1 border-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by description or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBreaches.map((breach) => (
            <Card key={breach.id} className="bg-slate-900/50 border-slate-700 hover:border-red-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-blue-400">
                      {getOrganizationName(breach.organization_id)}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">Data Breach</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(breach)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(breach.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(breach.severity)}
                  <span className={`px-2 py-1 rounded-md text-xs border ${getSeverityColor(breach.severity)}`}>
                    {breach.severity === "critical"
                      ? "Critical"
                      : breach.severity === "high"
                        ? "High"
                        : breach.severity === "medium"
                          ? "Medium"
                          : "Low"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Breach date:</span>
                    <span className="text-white ml-2">{new Date(breach.breach_date).toLocaleDateString("en-US")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Discovery date:</span>
                    <span className="text-white ml-2">
                      {new Date(breach.discovery_date).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Affected individuals:</span>
                    <span className="text-white ml-2">{breach.affected_individuals.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {breach.notification_sent ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Notification sent</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400">Notification pending</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Description:</div>
                  <p className="text-sm text-gray-300 line-clamp-2">{breach.description}</p>
                </div>

                {breach.mitigation_actions && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Mitigation Actions:</div>
                    <p className="text-sm text-gray-300 line-clamp-2">{breach.mitigation_actions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBreaches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No breaches found</p>
          </div>
        )}
      </div>
    </div>
  )
}
