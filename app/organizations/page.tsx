"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Building2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { organizationsApi, type Organization } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    dpo_name: "",
    dpo_email: "",
    address: "",
    phone: "",
    website: "",
  })

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const data = await organizationsApi.getAll()
      setOrganizations(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to load organizations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingOrg) {
        await organizationsApi.update(editingOrg.id, formData)
        toast({ title: "Organization updated successfully" })
      } else {
        await organizationsApi.create(formData)
        toast({ title: "Organization created successfully" })
      }
      setDialogOpen(false)
      resetForm()
      loadOrganizations()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this organization?")) return
    try {
      await organizationsApi.delete(id)
      toast({ title: "Organization deleted successfully" })
      loadOrganizations()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to delete organization",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org)
    setFormData({
      name: org.name,
      dpo_name: org.dpo_name || "",
      dpo_email: org.dpo_email || "",
      address: org.address || "",
      phone: org.phone || "",
      website: org.website || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingOrg(null)
    setFormData({
      name: "",
      dpo_name: "",
      dpo_email: "",
      address: "",
      phone: "",
      website: "",
    })
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Organizations
              </h1>
              <p className="text-slate-400">Manage organizations and their information</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingOrg ? "Edit Organization" : "New Organization"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dpo_name">DPO Name</Label>
                    <Input
                      id="dpo_name"
                      value={formData.dpo_name}
                      onChange={(e) => setFormData({ ...formData, dpo_name: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dpo_email">DPO Email</Label>
                    <Input
                      id="dpo_email"
                      type="email"
                      value={formData.dpo_email}
                      onChange={(e) => setFormData({ ...formData, dpo_email: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-slate-900 border-slate-700"
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
                  <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600">
                    {editingOrg ? "Update" : "Create"}
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
        ) : organizations.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Organizations</h3>
            <p className="text-slate-400 mb-6">Start by creating your first organization</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-100">{org.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(org)}
                      className="h-8 w-8 text-slate-400 hover:text-cyan-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(org.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {org.dpo_name && (
                    <div>
                      <span className="text-slate-400">DPO: </span>
                      <span className="text-slate-200">{org.dpo_name}</span>
                    </div>
                  )}
                  {org.dpo_email && (
                    <div>
                      <span className="text-slate-400">Email: </span>
                      <span className="text-slate-200">{org.dpo_email}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div>
                      <span className="text-slate-400">Phone: </span>
                      <span className="text-slate-200">{org.phone}</span>
                    </div>
                  )}
                  {org.website && (
                    <div>
                      <span className="text-slate-400">Website: </span>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline"
                      >
                        {org.website}
                      </a>
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
