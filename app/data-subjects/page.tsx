"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Trash2, Edit, Search, User, Mail, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface DataSubject {
  id: string
  organization_id: string
  name: string
  email: string
  phone?: string
  data_categories: string
  consent_given: boolean
  consent_date?: string
  created_at: string
  updated_at: string
}

export default function DataSubjectsPage() {
  const [subjects, setSubjects] = useState<DataSubject[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<DataSubject | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    name: "",
    email: "",
    phone: "",
    data_categories: "",
    consent_given: false,
    consent_date: "",
  })

  useEffect(() => {
    fetchSubjects()
    fetchOrganizations()
  }, [])

  const fetchSubjects = async () => {
    try {
      const data = await api.dataSubjects.list()
      setSubjects(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to load data subjects",
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
      if (editingSubject) {
        await api.dataSubjects.update(editingSubject.id, formData)
        toast({
          title: "Success",
          description: "Data subject updated successfully",
        })
      } else {
        await api.dataSubjects.create(formData)
        toast({
          title: "Success",
          description: "Data subject created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchSubjects()
    } catch (error) {
      toast({
        title: "Error",
        description: editingSubject ? "Unable to update data subject" : "Unable to create data subject",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this data subject?")) return

    try {
      await api.dataSubjects.delete(id)
      toast({
        title: "Success",
        description: "Data subject deleted successfully",
      })
      fetchSubjects()
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete data subject",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (subject: DataSubject) => {
    setEditingSubject(subject)
    setFormData({
      organization_id: subject.organization_id,
      name: subject.name,
      email: subject.email,
      phone: subject.phone || "",
      data_categories: subject.data_categories,
      consent_given: subject.consent_given,
      consent_date: subject.consent_date ? subject.consent_date.split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      name: "",
      email: "",
      phone: "",
      data_categories: "",
      consent_given: false,
      consent_date: "",
    })
    setEditingSubject(null)
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Unknown Organization"
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOrganizationName(subject.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
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
              <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Data Subjects
              </h1>
              <p className="text-slate-400">Manage data subjects and their consents</p>
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
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSubject ? "Edit Data Subject" : "New Data Subject"}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingSubject ? "Update data subject information" : "Add a new data subject to the system"}
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
                        <SelectValue placeholder="Select organization" />
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
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: John Doe"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@example.com"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="data_categories">Data Categories</Label>
                    <Input
                      id="data_categories"
                      value={formData.data_categories}
                      onChange={(e) => setFormData({ ...formData, data_categories: e.target.value })}
                      placeholder="Ex: Identity, Contact, Financial"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      id="consent_given"
                      type="checkbox"
                      checked={formData.consent_given}
                      onChange={(e) => setFormData({ ...formData, consent_given: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="consent_given" className="font-normal">
                      Consent given
                    </Label>
                  </div>

                  {formData.consent_given && (
                    <div>
                      <Label htmlFor="consent_date">Consent Date</Label>
                      <Input
                        id="consent_date"
                        type="date"
                        value={formData.consent_date}
                        onChange={(e) => setFormData({ ...formData, consent_date: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    {editingSubject ? "Update" : "Create"}
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
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-xl text-blue-400">{subject.name}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                      {getOrganizationName(subject.organization_id)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(subject)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(subject.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    <span className="text-white text-xs">{subject.email}</span>
                  </div>
                  {subject.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-400" />
                      <span className="text-white">{subject.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Data Categories:</div>
                  <p className="text-sm text-gray-300">{subject.data_categories}</p>
                </div>

                <div className="flex items-center gap-2">
                  {subject.consent_given ? (
                    <>
                      <span className="px-2 py-1 rounded-md text-xs border bg-green-500/10 text-green-400 border-green-500/20">
                        Consent given
                      </span>
                      {subject.consent_date && (
                        <span className="text-xs text-gray-400">
                          {new Date(subject.consent_date).toLocaleDateString("en-US")}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="px-2 py-1 rounded-md text-xs border bg-red-500/10 text-red-400 border-red-500/20">
                      No consent
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No subjects found</p>
          </div>
        )}
      </div>
    </div>
  )
}
