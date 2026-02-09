"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { dataProcessingApi, organizationsApi, type DataProcessing, type Organization } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function DataProcessingPage() {
  const [dataProcessings, setDataProcessings] = useState<DataProcessing[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DataProcessing | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    name: "",
    purpose: "",
    legal_basis: "",
    data_categories: "",
    retention_period: "",
    recipients: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [processings, orgs] = await Promise.all([dataProcessingApi.getAll(), organizationsApi.getAll()])
      setDataProcessings(processings)
      setOrganizations(orgs)
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
      }
      if (editing) {
        await dataProcessingApi.update(editing.id, payload)
        toast({ title: "Processing updated successfully" })
      } else {
        await dataProcessingApi.create(payload)
        toast({ title: "Processing created successfully" })
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
    if (!confirm("Are you sure you want to delete this processing?")) return
    try {
      await dataProcessingApi.delete(id)
      toast({ title: "Processing deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to delete processing",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: DataProcessing) => {
    setEditing(item)
    setFormData({
      organization_id: item.organization_id.toString(),
      name: item.name,
      purpose: item.purpose,
      legal_basis: item.legal_basis,
      data_categories: item.data_categories || "",
      retention_period: item.retention_period || "",
      recipients: item.recipients || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditing(null)
    setFormData({
      organization_id: "",
      name: "",
      purpose: "",
      legal_basis: "",
      data_categories: "",
      retention_period: "",
      recipients: "",
    })
  }

  const getOrgName = (orgId: number) => {
    return organizations.find((o) => o.id === orgId)?.name || "N/A"
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Data Processing
              </h1>
              <p className="text-slate-400">Record of processing activities</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Processing
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Processing" : "New Processing"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
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
                  <div className="col-span-2">
                    <Label htmlFor="name">Processing Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="legal_basis">Legal Basis *</Label>
                    <Input
                      id="legal_basis"
                      value={formData.legal_basis}
                      onChange={(e) => setFormData({ ...formData, legal_basis: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder="e.g. Consent, Contract, Legitimate Interest..."
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="data_categories">Data Categories</Label>
                    <Textarea
                      id="data_categories"
                      value={formData.data_categories}
                      onChange={(e) => setFormData({ ...formData, data_categories: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder="e.g. Identity, Contact, Professional Data..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="retention_period">Retention Period</Label>
                    <Input
                      id="retention_period"
                      value={formData.retention_period}
                      onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder="e.g. 3 years"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input
                      id="recipients"
                      value={formData.recipients}
                      onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder="e.g. HR Department, Subcontractors..."
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
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">
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
        ) : dataProcessings.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Processing Activities</h3>
            <p className="text-slate-400 mb-6">Start by creating your first data processing activity</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Processing
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataProcessings.map((item) => (
              <Card
                key={item.id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-100">{item.name}</h3>
                      <p className="text-sm text-slate-400">{getOrgName(item.organization_id)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(item)}
                      className="h-8 w-8 text-slate-400 hover:text-blue-400"
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
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400 font-medium">Purpose: </span>
                    <p className="text-slate-200 mt-1">{item.purpose}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Legal Basis: </span>
                    <span className="text-slate-200">{item.legal_basis}</span>
                  </div>
                  {item.data_categories && (
                    <div>
                      <span className="text-slate-400 font-medium">Categories: </span>
                      <p className="text-slate-200 mt-1">{item.data_categories}</p>
                    </div>
                  )}
                  {item.retention_period && (
                    <div>
                      <span className="text-slate-400 font-medium">Retention: </span>
                      <span className="text-slate-200">{item.retention_period}</span>
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
