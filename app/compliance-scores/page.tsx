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
import { Plus, Trash2, Edit, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
}

interface ComplianceScore {
  id: string
  organization_id: string
  score: number
  assessment_date: string
  next_assessment_date: string
  areas_of_concern: string
  improvement_actions: string
  created_at: string
  updated_at: string
}

export default function ComplianceScoresPage() {
  const [scores, setScores] = useState<ComplianceScore[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScore, setEditingScore] = useState<ComplianceScore | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    organization_id: "",
    score: 0,
    assessment_date: "",
    next_assessment_date: "",
    areas_of_concern: "",
    improvement_actions: "",
  })

  useEffect(() => {
    fetchScores()
    fetchOrganizations()
  }, [])

  const fetchScores = async () => {
    try {
      const data = await api.complianceScores.list()
      setScores(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to load scores",
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
      if (editingScore) {
        await api.complianceScores.update(editingScore.id, formData)
        toast({
          title: "Success",
          description: "Score updated successfully",
        })
      } else {
        await api.complianceScores.create(formData)
        toast({
          title: "Success",
          description: "Score created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchScores()
    } catch (error) {
      toast({
        title: "Error",
        description: editingScore ? "Unable to update score" : "Unable to create score",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return

    try {
      await api.complianceScores.delete(id)
      toast({
        title: "Success",
        description: "Score deleted successfully",
      })
      fetchScores()
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete score",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (score: ComplianceScore) => {
    setEditingScore(score)
    setFormData({
      organization_id: score.organization_id,
      score: score.score,
      assessment_date: score.assessment_date.split("T")[0],
      next_assessment_date: score.next_assessment_date.split("T")[0],
      areas_of_concern: score.areas_of_concern,
      improvement_actions: score.improvement_actions,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      organization_id: "",
      score: 0,
      assessment_date: "",
      next_assessment_date: "",
      areas_of_concern: "",
      improvement_actions: "",
    })
    setEditingScore(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20"
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20"
    if (score >= 40) return "bg-orange-500/10 border-orange-500/20"
    return "bg-red-500/10 border-red-500/20"
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || "Unknown Organization"
  }

  const filteredScores = scores.filter((score) =>
    getOrganizationName(score.organization_id).toLowerCase().includes(searchQuery.toLowerCase()),
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
              <Button
                variant="outline"
                size="icon"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-cyan-500 text-slate-100 hover:text-cyan-400"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Compliance Scores
              </h1>
              <p className="text-gray-400 mt-2">Track GDPR compliance scores</p>
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
                New Score
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  {editingScore ? "Edit Score" : "Create Score"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingScore ? "Edit score information" : "Fill in score information"}
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
                    <Label htmlFor="score">Score (0-100)</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: Number.parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="assessment_date">Assessment Date</Label>
                    <Input
                      id="assessment_date"
                      type="date"
                      value={formData.assessment_date}
                      onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_assessment_date">Next Assessment</Label>
                    <Input
                      id="next_assessment_date"
                      type="date"
                      value={formData.next_assessment_date}
                      onChange={(e) => setFormData({ ...formData, next_assessment_date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="areas_of_concern">Areas of Concern</Label>
                  <Textarea
                    id="areas_of_concern"
                    value={formData.areas_of_concern}
                    onChange={(e) => setFormData({ ...formData, areas_of_concern: e.target.value })}
                    placeholder="Describe areas needing attention"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="improvement_actions">Improvement Actions</Label>
                  <Textarea
                    id="improvement_actions"
                    value={formData.improvement_actions}
                    onChange={(e) => setFormData({ ...formData, improvement_actions: e.target.value })}
                    placeholder="Describe planned improvement actions"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {editingScore ? "Update" : "Create"}
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
              placeholder="Search by organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScores.map((score) => (
            <Card
              key={score.id}
              className={`bg-slate-900/50 border-2 hover:border-blue-500/50 transition-all ${getScoreBgColor(score.score)}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-blue-400">
                      {getOrganizationName(score.organization_id)}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">GDPR Compliance Score</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(score)}
                      className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(score.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-6xl font-bold">
                    <span className={getScoreColor(score.score)}>{score.score}</span>
                    <span className="text-2xl text-gray-400">/100</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Assessment:</span>
                    <span className="text-white ml-2">
                      {new Date(score.assessment_date).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Next:</span>
                    <span className="text-white ml-2">
                      {new Date(score.next_assessment_date).toLocaleDateString("en-US")}
                    </span>
                  </div>
                </div>

                {score.areas_of_concern && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Areas of Concern:</div>
                    <p className="text-sm text-gray-300 line-clamp-2">{score.areas_of_concern}</p>
                  </div>
                )}

                {score.improvement_actions && (
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Improvement Actions:</div>
                    <p className="text-sm text-gray-300 line-clamp-2">{score.improvement_actions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No scores found</p>
          </div>
        )}
      </div>
    </div>
  )
}
