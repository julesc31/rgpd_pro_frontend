"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Plus, Trash2, Edit, Search, FileText, Clock, CheckCircle2, ArrowLeft } from "lucide-react"

interface Organization {
  id: string
  name: string
}

interface RightsRequest {
  id: string
  organization_id: string
  requester_name: string
  requester_email: string
  request_type: string
  request_date: string
  status: string
  response_date?: string
  notes: string
  created_at: string
  updated_at: string
}

export default function RightsRequestsPage() {
  const [requests, setRequests] = useState<RightsRequest[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<RightsRequest | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    requester_name: "",
    requester_email: "",
    request_type: "access",
    request_date: "",
    status: "pending",
    response_date: "",
    notes: "",
  })

  useEffect(() => {
    fetchRequests()
    fetchOrganizations()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await api.rightsRequests.list()
      setRequests(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load requests",
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
      if (editingRequest) {
        await api.rightsRequests.update(editingRequest.id, formData)
        toast({
          title: "Success",
          description: "Request updated successfully",
        })
      } else {
        await api.rightsRequests.create(formData)
        toast({
          title: "Success",
          description: "Request created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: editingRequest ? "Failed to update request" : "Failed to create request",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return

    try {
      await api.rightsRequests.delete(id)
      toast({
        title: "Success",
        description: "Request deleted successfully",
      })
      fetchRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (request: RightsRequest) => {
    setEditingRequest(request)
    setFormData({
      organization_id: request.organization_id,
      requester_name: request.requester_name,
      requester_email: request.requester_email,
      request_type: request.request_type,
      request_date: request.request_date.split("T")[0],
      status: request.status,
      response_date: request.response_date ? request.response_date.split("T")[0] : "",
      notes: request.notes,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      requester_name: "",
      requester_email: "",
      request_type: "access",
      request_date: "",
      status: "pending",
      response_date: "",
      notes: "",
    })
    setEditingRequest(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-400" />
      default:
        return <FileText className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      access: "Access",
      rectification: "Rectification",
      erasure: "Erasure",
      restriction: "Restriction",
      portability: "Portability",
      objection: "Objection",
    }
    return types[type] || type
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Unknown Organization"
  }

  const filteredRequests = requests.filter(
    (request) =>
      request.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requester_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOrganizationName(request.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
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
                Rights Requests
              </h1>
              <p className="text-gray-400 mt-2">Manage data subject rights requests</p>
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
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  {editingRequest ? "Edit Request" : "Create Request"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingRequest ? "Edit request information" : "Fill in request information"}
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
                    <Label htmlFor="request_type">Request Type</Label>
                    <Select
                      value={formData.request_type}
                      onValueChange={(value) => setFormData({ ...formData, request_type: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="access">Access</SelectItem>
                        <SelectItem value="rectification">Rectification</SelectItem>
                        <SelectItem value="erasure">Erasure</SelectItem>
                        <SelectItem value="restriction">Restriction</SelectItem>
                        <SelectItem value="portability">Portability</SelectItem>
                        <SelectItem value="objection">Objection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="requester_name">Requester Name</Label>
                    <Input
                      id="requester_name"
                      value={formData.requester_name}
                      onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="requester_email">Requester Email</Label>
                    <Input
                      id="requester_email"
                      type="email"
                      value={formData.requester_email}
                      onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                      placeholder="john.doe@example.com"
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="request_date">Request Date</Label>
                    <Input
                      id="request_date"
                      type="date"
                      value={formData.request_date}
                      onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  {formData.status === "completed" && (
                    <div>
                      <Label htmlFor="response_date">Response Date</Label>
                      <Input
                        id="response_date"
                        type="date"
                        value={formData.response_date}
                        onChange={(e) => setFormData({ ...formData, response_date: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes about the request"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {editingRequest ? "Update" : "Create"}
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
              placeholder="Search by name, email or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-blue-400">{request.requester_name}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {getOrganizationName(request.organization_id)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(request)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(request.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(request.status)}`}>
                    {request.status === "completed"
                      ? "Completed"
                      : request.status === "in_progress"
                        ? "In Progress"
                        : "Pending"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white ml-2">{getRequestTypeLabel(request.request_type)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2 text-xs">{request.requester_email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Request date:</span>
                    <span className="text-white ml-2">
                      {new Date(request.request_date).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  {request.response_date && (
                    <div>
                      <span className="text-gray-400">Response date:</span>
                      <span className="text-white ml-2">
                        {new Date(request.response_date).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  )}
                </div>

                {request.notes && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Notes:</div>
                    <p className="text-sm text-gray-300 line-clamp-2">{request.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}
