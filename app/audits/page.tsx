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
import { ScanImporter, type ScanData } from "@/lib/scan-importer"
import { ClipboardCheck, Plus, Pencil, Trash2, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface Audit {
  id: string
  organization_id: string
  audit_type: string
  scope: string
  scheduled_date: string
  completion_date?: string
  status: string
  findings: string
  recommendations: string
  auditor_name: string
  created_at: string
  updated_at: string
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    audit_type: "",
    scope: "",
    scheduled_date: "",
    completion_date: "",
    status: "planned",
    findings: "",
    recommendations: "",
    auditor_name: "",
  })

  useEffect(() => {
    fetchAudits()
    fetchOrganizations()
  }, [])

  const fetchAudits = async () => {
    try {
      const data = await api.audits.list()
      setAudits(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audits",
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
      if (editingAudit) {
        await api.audits.update(editingAudit.id, formData)
        toast({
          title: "Success",
          description: "Audit updated successfully",
        })
      } else {
        await api.audits.create(formData)
        toast({
          title: "Success",
          description: "Audit created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchAudits()
    } catch (error) {
      toast({
        title: "Error",
        description: editingAudit ? "Failed to update audit" : "Failed to create audit",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audit?")) return

    try {
      await api.audits.delete(id)
      toast({
        title: "Success",
        description: "Audit deleted successfully",
      })
      fetchAudits()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete audit",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (audit: Audit) => {
    setEditingAudit(audit)
    setFormData({
      organization_id: audit.organization_id,
      audit_type: audit.audit_type,
      scope: audit.scope,
      scheduled_date: audit.scheduled_date.split("T")[0],
      completion_date: audit.completion_date ? audit.completion_date.split("T")[0] : "",
      status: audit.status,
      findings: audit.findings,
      recommendations: audit.recommendations,
      auditor_name: audit.auditor_name,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      audit_type: "",
      scope: "",
      scheduled_date: "",
      completion_date: "",
      status: "planned",
      findings: "",
      recommendations: "",
      auditor_name: "",
    })
    setEditingAudit(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <ClipboardCheck className="h-4 w-4 text-green-400" />
      case "in_progress":
        return <Plus className="h-4 w-4 text-blue-400" />
      case "planned":
        return <Plus className="h-4 w-4 text-yellow-400" />
      default:
        return <Pencil className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "planned":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Unknown Organization"
  }

  const handleImportScan = async (file: File) => {
    setImportLoading(true)
    setImportResult(null)

    try {
      const fileContent = await file.text()
      const scanData: ScanData = JSON.parse(fileContent)

      const importer = new ScanImporter(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
      const result = await importer.importScan(scanData)

      setImportResult(result)

      if (result.success) {
        toast({
          title: "Success",
          description: "Scan data imported successfully",
        })
        fetchAudits()
        fetchOrganizations()
      } else {
        toast({
          title: "Partial Import",
          description: `Import completed with ${result.errors.length} errors`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to import scan: ${error.message}`,
        variant: "destructive",
      })
      setImportResult({
        success: false,
        created: {},
        errors: [error.message],
      })
    } finally {
      setImportLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImportScan(file)
    }
  }

  const filteredAudits = audits.filter(
    (audit) =>
      audit.audit_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.auditor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOrganizationName(audit.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Audits
              </h1>
              <p className="text-slate-400">Compliance audits and reports</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Scan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Import Scan Data
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Upload a JSON scan file to automatically populate all GDPR modules
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                    <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                    <Label htmlFor="scan-file" className="cursor-pointer">
                      <div className="text-lg font-medium text-white mb-2">Click to upload or drag and drop</div>
                      <div className="text-sm text-gray-400">JSON scan file (max 10MB)</div>
                    </Label>
                    <Input
                      id="scan-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={importLoading}
                    />
                  </div>

                  {importLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                      <span className="ml-4 text-gray-400">Importing scan data...</span>
                    </div>
                  )}

                  {importResult && (
                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-lg border ${
                          importResult.success
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-yellow-500/10 border-yellow-500/20"
                        }`}
                      >
                        <div className="font-medium text-white mb-2">
                          {importResult.success ? "Import Successful" : "Import Completed with Errors"}
                        </div>
                        <div className="text-sm text-gray-400">
                          Created: {importResult.created.organization && "1 Organization, "}
                          {importResult.created.audit && "1 Audit, "}
                          {importResult.created.dpia && "1 DPIA, "}
                          {importResult.created.complianceScore && "1 Compliance Score, "}
                          {importResult.created.dataBreaches?.length > 0 &&
                            `${importResult.created.dataBreaches.length} Data Breaches, `}
                          {importResult.created.dataProcessing?.length > 0 &&
                            `${importResult.created.dataProcessing.length} Data Processing records`}
                        </div>
                      </div>

                      {importResult.errors.length > 0 && (
                        <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/20">
                          <div className="font-medium text-white mb-2">Errors:</div>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {importResult.errors.map((error: string, idx: number) => (
                              <li key={idx}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        onClick={() => {
                          setIsImportDialogOpen(false)
                          setImportResult(null)
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

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
                  Create Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    {editingAudit ? "Edit Audit" : "Create Audit"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingAudit ? "Edit audit information" : "Fill in the audit information"}
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
                      <Label htmlFor="audit_type">Audit Type</Label>
                      <Input
                        id="audit_type"
                        value={formData.audit_type}
                        onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                        placeholder="e.g. Security Audit"
                        className="bg-slate-800 border-slate-700"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="auditor_name">Auditor Name</Label>
                      <Input
                        id="auditor_name"
                        value={formData.auditor_name}
                        onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="bg-slate-800 border-slate-700"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="scheduled_date">Scheduled Date</Label>
                      <Input
                        id="scheduled_date"
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="completion_date">Completion Date</Label>
                      <Input
                        id="completion_date"
                        type="date"
                        value={formData.completion_date}
                        onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scope">Scope</Label>
                    <Textarea
                      id="scope"
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      placeholder="Describe the audit scope"
                      className="bg-slate-800 border-slate-700 min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="findings">Findings</Label>
                    <Textarea
                      id="findings"
                      value={formData.findings}
                      onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                      placeholder="Describe the audit findings"
                      className="bg-slate-800 border-slate-700 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <Textarea
                      id="recommendations"
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      placeholder="Describe the recommendations"
                      className="bg-slate-800 border-slate-700 min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      {editingAudit ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 border-slate-700 hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by type, auditor or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAudits.map((audit) => (
            <Card key={audit.id} className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-blue-400">{audit.audit_type}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {getOrganizationName(audit.organization_id)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(audit)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(audit.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(audit.status)}
                  <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(audit.status)}`}>
                    {audit.status === "completed"
                      ? "Completed"
                      : audit.status === "in_progress"
                        ? "In Progress"
                        : "Planned"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Auditor:</span>
                    <span className="text-white ml-2">{audit.auditor_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Scheduled Date:</span>
                    <span className="text-white ml-2">
                      {new Date(audit.scheduled_date).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  {audit.completion_date && (
                    <div>
                      <span className="text-gray-400">Completion Date:</span>
                      <span className="text-white ml-2">
                        {new Date(audit.completion_date).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Scope:</div>
                  <p className="text-sm text-gray-300 line-clamp-2">{audit.scope}</p>
                </div>

                {audit.findings && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Findings:</div>
                    <p className="text-sm text-gray-300 line-clamp-2">{audit.findings}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAudits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No audit found</p>
          </div>
        )}
      </div>
    </div>
  )
}
