export interface ScanData {
  metadata: {
    scan_id: string
    url: string
    domain: string
    timestamp: string
    company: {
      sector: string
      revenue_range: string
      employee_count: string
    }
  }
  compliance_timeline: {
    violations_count: number
    risk_level: string
    estimated_fine: {
      minimum: number
      maximum: number
    }
    remediation_plan: {
      phases: Array<{
        name: string
        duration: string
        actions: string[]
        estimated_cost: string
      }>
    }
  }
  executive_summary: {
    overall_risk_level: string
    total_violations: number
    estimated_fine_range: string
    recommendations_summary: string
  }
  violations: Array<{
    category: string
    severity: string
    article: string
    description: string
    current_status: string
    remediation_steps: string[]
    estimated_cost: string
    priority: string
  }>
  risk_assessment: {
    necessity_assessment: string
    proportionality_assessment: string
    risk_level: string
    mitigation_measures: string[]
  }
  jurisprudential_analysis: {
    similar_cases: Array<{
      case_name: string
      jurisdiction: string
      fine_amount: string
      key_factors: string[]
    }>
  }
}

export class ScanImporter {
  private apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  async importScan(scanData: ScanData): Promise<{
    success: boolean
    created: {
      organization?: any
      audit?: any
      dpia?: any
      complianceScore?: any
      dataBreaches?: any[]
      dataProcessing?: any[]
    }
    errors: string[]
  }> {
    const created: any = {}
    const errors: string[] = []

    try {
      // 1. Create Organization
      console.log("[v0] Creating organization from scan...")
      try {
        const orgResponse = await fetch(`${this.apiBaseUrl}/organizations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: scanData.metadata.domain,
            sector: scanData.metadata.company.sector,
            revenue_range: scanData.metadata.company.revenue_range,
            employee_count: scanData.metadata.company.employee_count,
            contact_email: `contact@${scanData.metadata.domain}`,
          }),
        })
        if (orgResponse.ok) {
          created.organization = await orgResponse.json()
          console.log("[v0] Organization created:", created.organization.id)
        } else {
          errors.push(`Failed to create organization: ${await orgResponse.text()}`)
        }
      } catch (e: any) {
        errors.push(`Organization creation error: ${e.message}`)
      }

      const organizationId = created.organization?.id

      // 2. Create Audit
      console.log("[v0] Creating audit from scan...")
      try {
        const auditResponse = await fetch(`${this.apiBaseUrl}/audits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_id: organizationId,
            audit_type: "compliance",
            audit_date: scanData.metadata.timestamp,
            auditor_name: "Automated GDPR Scanner",
            scope: `Full GDPR compliance scan of ${scanData.metadata.domain}`,
            findings: scanData.executive_summary.recommendations_summary,
            recommendations: JSON.stringify(scanData.compliance_timeline.remediation_plan),
            status: "completed",
          }),
        })
        if (auditResponse.ok) {
          created.audit = await auditResponse.json()
          console.log("[v0] Audit created:", created.audit.id)
        } else {
          errors.push(`Failed to create audit: ${await auditResponse.text()}`)
        }
      } catch (e: any) {
        errors.push(`Audit creation error: ${e.message}`)
      }

      // 3. Create DPIA
      console.log("[v0] Creating DPIA from scan...")
      try {
        const dpiaResponse = await fetch(`${this.apiBaseUrl}/dpia`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_id: organizationId,
            processing_activity: `Data processing activities on ${scanData.metadata.domain}`,
            description: `Automated risk assessment for ${scanData.metadata.domain}`,
            necessity_assessment: scanData.risk_assessment.necessity_assessment,
            proportionality_assessment: scanData.risk_assessment.proportionality_assessment,
            risk_level: scanData.risk_assessment.risk_level,
            mitigation_measures: scanData.risk_assessment.mitigation_measures.join("; "),
            status: "completed",
          }),
        })
        if (dpiaResponse.ok) {
          created.dpia = await dpiaResponse.json()
          console.log("[v0] DPIA created:", created.dpia.id)
        } else {
          errors.push(`Failed to create DPIA: ${await dpiaResponse.text()}`)
        }
      } catch (e: any) {
        errors.push(`DPIA creation error: ${e.message}`)
      }

      // 4. Create Compliance Score
      console.log("[v0] Creating compliance score from scan...")
      try {
        const score = Math.max(0, 100 - scanData.compliance_timeline.violations_count * 5)
        const complianceResponse = await fetch(`${this.apiBaseUrl}/compliance-scores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_id: organizationId,
            score: score,
            category: "gdpr",
            assessment_date: scanData.metadata.timestamp,
            details: JSON.stringify({
              violations_count: scanData.compliance_timeline.violations_count,
              risk_level: scanData.compliance_timeline.risk_level,
              estimated_fine: scanData.compliance_timeline.estimated_fine,
            }),
          }),
        })
        if (complianceResponse.ok) {
          created.complianceScore = await complianceResponse.json()
          console.log("[v0] Compliance score created:", created.complianceScore.id)
        } else {
          errors.push(`Failed to create compliance score: ${await complianceResponse.text()}`)
        }
      } catch (e: any) {
        errors.push(`Compliance score creation error: ${e.message}`)
      }

      // 5. Create Data Breaches for security violations
      console.log("[v0] Creating data breaches from violations...")
      created.dataBreaches = []
      const securityViolations = scanData.violations.filter(
        (v) => v.category.toLowerCase().includes("security") || v.severity === "critical",
      )

      for (const violation of securityViolations) {
        try {
          const breachResponse = await fetch(`${this.apiBaseUrl}/data-breaches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organization_id: organizationId,
              incident_date: scanData.metadata.timestamp,
              discovery_date: scanData.metadata.timestamp,
              breach_type: violation.category,
              severity: violation.severity,
              description: violation.description,
              affected_individuals: 0, // Unknown from scan
              notification_status: "pending",
              containment_measures: violation.remediation_steps.join("; "),
            }),
          })
          if (breachResponse.ok) {
            const breach = await breachResponse.json()
            created.dataBreaches.push(breach)
            console.log("[v0] Data breach created:", breach.id)
          }
        } catch (e: any) {
          errors.push(`Data breach creation error: ${e.message}`)
        }
      }

      // 6. Create Data Processing records for violations
      console.log("[v0] Creating data processing records from violations...")
      created.dataProcessing = []
      const processingViolations = scanData.violations.filter(
        (v) =>
          v.category.toLowerCase().includes("processing") ||
          v.category.toLowerCase().includes("consent") ||
          v.category.toLowerCase().includes("data collection"),
      )

      for (const violation of processingViolations) {
        try {
          const processingResponse = await fetch(`${this.apiBaseUrl}/data-processing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organization_id: organizationId,
              processing_purpose: violation.description,
              legal_basis: "consent", // Default
              data_categories: violation.category,
              retention_period: "12 months", // Default
              description: `${violation.description}\nRemediation: ${violation.remediation_steps.join(", ")}`,
            }),
          })
          if (processingResponse.ok) {
            const processing = await processingResponse.json()
            created.dataProcessing.push(processing)
            console.log("[v0] Data processing created:", processing.id)
          }
        } catch (e: any) {
          errors.push(`Data processing creation error: ${e.message}`)
        }
      }

      return {
        success: errors.length === 0,
        created,
        errors,
      }
    } catch (error: any) {
      console.error("[v0] Import failed:", error)
      return {
        success: false,
        created,
        errors: [...errors, error.message],
      }
    }
  }
}
