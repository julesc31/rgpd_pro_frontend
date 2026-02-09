"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ShieldAlert, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  dpiaApi,
  organizationsApi,
  dataProcessingApi,
  type DPIA,
  type Organization,
  type DataProcessing,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function DPIAPage() {
  const [dpias, setDpias] = useState<DPIA[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [processings, setProcessings] = useState<DataProcessing[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DPIA | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    processing_id: "",
    title: "",
    description: "",
    necessity_assessment: "",
    proportionality_assessment: "",
    risk_level: "",
    mitigation_measures: "",
    status: "draft",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dpiasData, orgs, procs] = await Promise.all([
        dpiaApi.getAll(),
        organizationsApi.getAll(),
        dataProcessingApi.getAll(),
      ])
      setDpias(dpiasData)
      setOrganizations(orgs)
      setProcessings(procs)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        organization_id: Number.parseInt(formData.organization_id),
        processing_id: formData.processing_id ? Number.parseInt(formData.processing_id) : undefined,
      }
      if (editing) {
        await dpiaApi.update(editing.id, payload)
        toast({ title: "DPIA updated successfully" })
      } else {
        await dpiaApi.create(payload)
        toast({ title: "DPIA created successfully" })
      }
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this DPIA?")) return
    try {
      await dpiaApi.delete(id)
      toast({ title: "DPIA deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to delete DPIA",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: DPIA) => {
    setEditing(item)
    setFormData({
      organization_id: item.organization_id.toString(),
      processing_id: item.processing_id?.toString() || "",
      title: item.title,
      description: item.description || "",
      necessity_assessment: item.necessity_assessment || "",
      proportionality_assessment: item.proportionality_assessment || "",
      risk_level: item.risk_level || "",
      mitigation_measures: item.mitigation_measures || "",
      status: item.status,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      organization_id: "",
      processing_id: "",
      title: "",
      description: "",
      necessity_assessment: "",
      proportionality_assessment: "",
      risk_level: "",
      mitigation_measures: "",
      status: "draft",
    })
  }

  const getOrgName = (orgId: number) => {
    return organizations.find((o) => o.id === orgId)?.name || "N/A"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/50"
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/50"
      case "draft":
        return "bg-slate-500/10 text-slate-400 border-slate-500/50"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/50"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
      case "élevé":
        return "bg-red-500/10 text-red-400 border-red-500/50"
      case "medium":
      case "moyen":
        return "bg-orange-500/10 text-orange-400 border-orange-500/50"
      case "low":
      case "faible":
        return "bg-green-500/10 text-green-400 border-green-500/50"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="icon"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-cyan-500 text-slate-100 hover:text-cyan-400"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                DPIA (Impact Assessments)
              </h1>
              <p className="text-slate-400">Data Protection Impact Assessments</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New DPIA
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit DPIA" : "New DPIA"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization_id">Organization *</Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="processing_id">Associated Processing</Label>
                    <Select
                      value={formData.processing_id}
                      onValueChange={(value) => setFormData({ ...formData, processing_id: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Select a processing" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {processings.map((proc) => (
                          <SelectItem key={proc.id} value={proc.id.toString()}>
                            {proc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="necessity_assessment">Necessity Assessment</Label>
                    <Textarea
                      id="necessity_assessment"
                      value={formData.necessity_assessment}
                      onChange={(e) => setFormData({ ...formData, necessity_assessment: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="proportionality_assessment">Proportionality Assessment</Label>
                    <Textarea
                      id="proportionality_assessment"
                      value={formData.proportionality_assessment}
                      onChange={(e) => setFormData({ ...formData, proportionality_assessment: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="risk_level">Risk Level</Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="mitigation_measures">Mitigation Measures</Label>
                    <Textarea
                      id="mitigation_measures"
                      value={formData.mitigation_measures}
                      onChange={(e) => setFormData({ ...formData, mitigation_measures: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="bg-slate-700 border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600">
                    {editing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : dpias.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <ShieldAlert className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No DPIA</h3>
            <p className="text-slate-400 mb-6">Start by creating your first impact assessment</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New DPIA
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {dpias.map((item) => (
              <Card
                key={item.id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-slate-100">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === "draft"
                            ? "Draft"
                            : item.status === "in_progress"
                              ? "In Progress"
                              : "Completed"}
                        </Badge>
                        {item.risk_level && (
                          <Badge className={getRiskColor(item.risk_level)}>
                            Risk: {item.risk_level === "low" ? "Low" : item.risk_level === "medium" ? "Medium" : "High"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{getOrgName(item.organization_id)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(item)}
                      className="h-8 w-8 text-slate-400 hover:text-purple-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {item.description && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-300">{item.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {item.necessity_assessment && (
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <span className="text-slate-400 font-medium block mb-1">Necessity:</span>
                      <p className="text-slate-200">{item.necessity_assessment}</p>
                    </div>
                  )}
                  {item.proportionality_assessment && (
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <span className="text-slate-400 font-medium block mb-1">Proportionality:</span>
                      <p className="text-slate-200">{item.proportionality_assessment}</p>
                    </div>
                  )}
                  {item.mitigation_measures && (
                    <div className="bg-slate-900/50 p-3 rounded-lg md:col-span-2">
                      <span className="text-slate-400 font-medium block mb-1">Mitigation Measures:</span>
                      <p className="text-slate-200">{item.mitigation_measures}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
