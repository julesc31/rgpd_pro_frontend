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
import { Plus, Trash2, Edit, Search, FileText } from "lucide-react"

interface Organization {
  id: string
  name: string
}

interface NotificationTemplate {
  id: string
  organization_id: string
  template_name: string
  template_type: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    template_name: "",
    template_type: "breach_notification",
    subject: "",
    body: "",
  })

  useEffect(() => {
    fetchTemplates()
    fetchOrganizations()
  }, [])

  const fetchTemplates = async () => {
    try {
      const data = await api.notificationTemplates.list()
      setTemplates(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
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
      console.error("Erreur lors du chargement des organisations:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await api.notificationTemplates.update(editingTemplate.id, formData)
        toast({
          title: "Succès",
          description: "Template modifié avec succès",
        })
      } else {
        await api.notificationTemplates.create(formData)
        toast({
          title: "Succès",
          description: "Template créé avec succès",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchTemplates()
    } catch (error) {
      toast({
        title: "Erreur",
        description: editingTemplate ? "Impossible de modifier le template" : "Impossible de créer le template",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return

    try {
      await api.notificationTemplates.delete(id)
      toast({
        title: "Succès",
        description: "Template supprimé avec succès",
      })
      fetchTemplates()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setFormData({
      organization_id: template.organization_id,
      template_name: template.template_name,
      template_type: template.template_type,
      subject: template.subject,
      body: template.body,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      template_name: "",
      template_type: "breach_notification",
      subject: "",
      body: "",
    })
    setEditingTemplate(null)
  }

  const getTemplateTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      breach_notification: "Notification de violation",
      rights_request: "Demande de droits",
      consent_request: "Demande de consentement",
      audit_report: "Rapport d'audit",
    }
    return types[type] || type
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Organisation inconnue"
  }

  const filteredTemplates = templates.filter(
    (template) =>
      template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOrganizationName(template.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Templates de Notification
            </h1>
            <p className="text-gray-400 mt-2">Gérez vos templates de notification RGPD</p>
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
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  {editingTemplate ? "Modifier le template" : "Créer un template"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingTemplate
                    ? "Modifiez les informations du template"
                    : "Remplissez les informations du template"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization">Organisation</Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Sélectionner une organisation" />
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
                    <Label htmlFor="template_type">Type de template</Label>
                    <Select
                      value={formData.template_type}
                      onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="breach_notification">Notification de violation</SelectItem>
                        <SelectItem value="rights_request">Demande de droits</SelectItem>
                        <SelectItem value="consent_request">Demande de consentement</SelectItem>
                        <SelectItem value="audit_report">Rapport d'audit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="template_name">Nom du template</Label>
                    <Input
                      id="template_name"
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      placeholder="Ex: Notification violation de données"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="subject">Objet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Ex: Notification de violation de données personnelles"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="body">Corps du message</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Contenu du template de notification"
                    className="bg-slate-800 border-slate-700 min-h-[300px] font-mono"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {editingTemplate ? "Modifier" : "Créer"}
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
                    Annuler
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
              placeholder="Rechercher par nom, objet ou organisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-xl text-blue-400">{template.template_name}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                      {getOrganizationName(template.organization_id)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(template)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(template.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="px-2 py-1 rounded-md text-xs border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    {getTemplateTypeLabel(template.template_type)}
                  </span>
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Objet:</div>
                  <p className="text-sm text-white font-medium">{template.subject}</p>
                </div>

                <div>
                  <div className="text-gray-400 text-xs mb-1">Corps:</div>
                  <p className="text-sm text-gray-300 line-clamp-4 font-mono text-xs">{template.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun template trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
