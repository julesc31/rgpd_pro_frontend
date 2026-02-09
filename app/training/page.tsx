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
import { Plus, Trash2, Edit, Search, BookOpen, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface TrainingModule {
  id: string
  organization_id: string
  module_name: string
  description: string
  duration_minutes: number
  content: string
  required: boolean
  completion_tracking: boolean
  created_at: string
  updated_at: string
}

export default function TrainingModulesPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    module_name: "",
    description: "",
    duration_minutes: 30,
    content: "",
    required: false,
    completion_tracking: true,
  })

  useEffect(() => {
    fetchModules()
    fetchOrganizations()
  }, [])

  const fetchModules = async () => {
    try {
      const data = await api.trainingModules.list()
      setModules(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load modules",
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
      if (editingModule) {
        await api.trainingModules.update(editingModule.id, formData)
        toast({
          title: "Success",
          description: "Module updated successfully",
        })
      } else {
        await api.trainingModules.create(formData)
        toast({
          title: "Success",
          description: "Module created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchModules()
    } catch (error) {
      toast({
        title: "Error",
        description: editingModule ? "Failed to update module" : "Failed to create module",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return

    try {
      await api.trainingModules.delete(id)
      toast({
        title: "Success",
        description: "Module deleted successfully",
      })
      fetchModules()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (module: TrainingModule) => {
    setEditingModule(module)
    setFormData({
      organization_id: module.organization_id,
      module_name: module.module_name,
      description: module.description,
      duration_minutes: module.duration_minutes,
      content: module.content,
      required: module.required,
      completion_tracking: module.completion_tracking,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      module_name: "",
      description: "",
      duration_minutes: 30,
      content: "",
      required: false,
      completion_tracking: true,
    })
    setEditingModule(null)
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Unknown organization"
  }

  const filteredModules = modules.filter(
    (module) =>
      module.module_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOrganizationName(module.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
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
                Training Modules
              </h1>
              <p className="text-gray-400 mt-2">Manage your GDPR training modules</p>
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
                New Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  {editingModule ? "Edit Module" : "Create Module"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingModule ? "Edit the module information" : "Fill in the module information"}
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
                    <Label htmlFor="module_name">Module Name</Label>
                    <Input
                      id="module_name"
                      value={formData.module_name}
                      onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
                      placeholder="e.g., Introduction to GDPR"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-6">
                    <div className="flex items-center space-x-2">
                      <input
                        id="required"
                        type="checkbox"
                        checked={formData.required}
                        onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="required" className="font-normal">
                        Required Module
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="completion_tracking"
                        type="checkbox"
                        checked={formData.completion_tracking}
                        onChange={(e) => setFormData({ ...formData, completion_tracking: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="completion_tracking" className="font-normal">
                        Completion Tracking
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the training module"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Training module content"
                    className="bg-slate-800 border-slate-700 min-h-[200px]"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {editingModule ? "Update" : "Create"}
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
              placeholder="Search by name, description, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-xl text-blue-400">{module.module_name}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                      {getOrganizationName(module.organization_id)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(module)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(module.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span className="text-white">{module.duration_minutes} min</span>
                  </div>
                  {module.required && (
                    <span className="px-2 py-1 rounded-md text-xs border bg-red-500/10 text-red-400 border-red-500/20">
                      Required
                    </span>
                  )}
                  {module.completion_tracking && (
                    <span className="px-2 py-1 rounded-md text-xs border bg-green-500/10 text-green-400 border-green-500/20">
                      Tracking Active
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Description:</div>
                  <p className="text-sm text-gray-300 line-clamp-2">{module.description}</p>
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Content:</div>
                  <p className="text-sm text-gray-300 line-clamp-3">{module.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No modules found</p>
          </div>
        )}
      </div>
    </div>
  )
}
