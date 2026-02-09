-- Insert demo scan for the demo user with Leboncoin.fr report
-- This script inserts a completed scan with the full HTML report

-- Insert the scan with the complete HTML report
INSERT INTO public.scans (
  id,
  user_id,
  target_url,
  scan_type,
  status,
  progress,
  started_at,
  completed_at,
  created_at,
  report_html
) VALUES (
  gen_random_uuid(),
  '468ab8e6-c344-457e-bf51-e42298f7ac57'::uuid,
  'https://www.leboncoin.fr',
  'normal',
  'completed',
  100,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '2 hours',
  $REPORT$<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Audit RGPD - leboncoin.fr</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
        }

        .company-info h1 {
            font-size: 32px;
            color: #1a1a1a;
            margin-bottom: 10px;
        }

        .company-info p {
            color: #666;
            font-size: 14px;
        }

        .scan-meta {
            text-align: right;
        }

        .scan-meta .label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .scan-meta .value {
            font-size: 16px;
            color: #333;
            font-weight: 600;
            margin-top: 5px;
        }

        .tabs {
            display: flex;
            gap: 10px;
            border-bottom: 2px solid #f0f0f0;
        }

        .tab {
            padding: 15px 30px;
            background: none;
            border: none;
            font-size: 16px;
            font-weight: 500;
            color: #666;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }

        .tab.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }

        .tab:hover {
            color: #667eea;
        }

        .content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            color: white;
        }

        .stat-card.success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .stat-card.warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-card.info {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-value {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 24px;
            color: #1a1a1a;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }

        .violation-card {
            background: #f8f9fa;
            border-left: 4px solid #f5576c;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 20px;
        }

        .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }

        .violation-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
        }

        .severity-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .severity-critical {
            background: #fee;
            color: #c00;
        }

        .severity-high {
            background: #fff3cd;
            color: #856404;
        }

        .severity-medium {
            background: #d1ecf1;
            color: #0c5460;
        }

        .violation-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }

        .violation-details {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }

        .detail-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: 600;
            color: #333;
            min-width: 150px;
        }

        .detail-value {
            color: #666;
        }

        .screenshot {
            margin-top: 20px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .screenshot img {
            width: 100%;
            display: block;
        }

        .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
        }

        .recommendation {
            background: #e7f3ff;
            border-left: 4px solid #4facfe;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }

        .recommendation-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
        }

        .timeline {
            position: relative;
            padding-left: 40px;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e0e0e0;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 30px;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -29px;
            top: 5px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #667eea;
            border: 3px solid white;
            box-shadow: 0 0 0 2px #667eea;
        }

        .timeline-date {
            font-weight: 600;
            color: #667eea;
            margin-bottom: 5px;
        }

        .timeline-content {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .tabs {
                display: none;
            }
            
            .tab-content {
                display: block !important;
                page-break-after: always;
            }
            
            .header, .content {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-top">
                <div class="company-info">
                    <h1>Rapport d'Audit RGPD</h1>
                    <p>Analyse de conformité pour leboncoin.fr</p>
                </div>
                <div class="scan-meta">
                    <div>
                        <div class="label">Date du scan</div>
                        <div class="value">16 octobre 2025</div>
                    </div>
                    <div style="margin-top: 15px;">
                        <div class="label">ID du scan</div>
                        <div class="value">#SCAN-2025-1016</div>
                    </div>
                </div>
            </div>
            
            <div class="tabs">
                <button class="tab active" onclick="showTab('synthese')">Synthèse</button>
                <button class="tab" onclick="showTab('violations')">Violations</button>
                <button class="tab" onclick="showTab('risques')">Risques</button>
                <button class="tab" onclick="showTab('remediation')">Remédiation</button>
                <button class="tab" onclick="showTab('jurisprudence')">Jurisprudence</button>
                <button class="tab" onclick="showTab('methodologie')">Méthodologie</button>
            </div>
        </div>

        <div class="content">
            <!-- Synthèse Tab -->
            <div id="synthese" class="tab-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">67/100</div>
                        <div class="stat-label">Score de conformité</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-value">12</div>
                        <div class="stat-label">Violations détectées</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-value">8</div>
                        <div class="stat-label">Cookies tiers</div>
                    </div>
                    <div class="stat-card success">
                        <div class="stat-value">5</div>
                        <div class="stat-label">Bonnes pratiques</div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Résumé exécutif</h2>
                    <p style="line-height: 1.8; color: #666; margin-bottom: 20px;">
                        L'audit RGPD du site leboncoin.fr révèle un score de conformité de 67/100, indiquant des améliorations nécessaires. 
                        12 violations ont été identifiées, dont 3 critiques nécessitant une action immédiate. Les principales préoccupations 
                        concernent la gestion des cookies, le consentement utilisateur et la transparence des traitements de données.
                    </p>
                    
                    <div class="chart-container">
                        <canvas id="complianceChart" height="80"></canvas>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Points clés</h2>
                    <div class="recommendation">
                        <div class="recommendation-title">✓ Points positifs</div>
                        <ul style="margin-left: 20px; color: #666; line-height: 1.8;">
                            <li>Politique de confidentialité accessible</li>
                            <li>Mécanisme de suppression de compte présent</li>
                            <li>Chiffrement HTTPS activé</li>
                            <li>Formulaire de contact DPO disponible</li>
                        </ul>
                    </div>
                    
                    <div class="violation-card">
                        <div class="violation-header">
                            <div class="violation-title">✗ Points d'amélioration prioritaires</div>
                            <span class="severity-badge severity-critical">Critique</span>
                        </div>
                        <ul style="margin-left: 20px; color: #666; line-height: 1.8;">
                            <li>Cookies déposés avant consentement</li>
                            <li>Absence de granularité dans le consentement</li>
                            <li>Transferts de données hors UE non documentés</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Violations Tab -->
            <div id="violations" class="tab-content">
                <div class="section">
                    <h2 class="section-title">Violations détectées (12)</h2>
                    
                    <div class="violation-card">
                        <div class="violation-header">
                            <div class="violation-title">Cookies déposés avant consentement</div>
                            <span class="severity-badge severity-critical">Critique</span>
                        </div>
                        <div class="violation-description">
                            Des cookies non essentiels sont déposés sur le terminal de l'utilisateur avant l'obtention de son consentement explicite, 
                            en violation de l'article 82 de la loi Informatique et Libertés et des lignes directrices de la CNIL.
                        </div>
                        <div class="violation-details">
                            <div class="detail-row">
                                <div class="detail-label">Article RGPD</div>
                                <div class="detail-value">Article 6(1)(a) - Consentement</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Cookies concernés</div>
                                <div class="detail-value">_ga, _fbp, _hjid, doubleclick</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Impact</div>
                                <div class="detail-value">Traçage non consenti de 100% des visiteurs</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Sanction potentielle</div>
                                <div class="detail-value">Jusqu'à 20M€ ou 4% du CA annuel mondial</div>
                            </div>
                        </div>
                    </div>

                    <div class="violation-card">
                        <div class="violation-header">
                            <div class="violation-title">Absence de granularité du consentement</div>
                            <span class="severity-badge severity-high">Élevée</span>
                        </div>
                        <div class="violation-description">
                            Le bandeau de consentement ne permet pas à l'utilisateur de choisir de manière granulaire les finalités 
                            pour lesquelles il consent au dépôt de cookies, contrairement aux exigences de la CNIL.
                        </div>
                        <div class="violation-details">
                            <div class="detail-row">
                                <div class="detail-label">Article RGPD</div>
                                <div class="detail-value">Article 7 - Conditions applicables au consentement</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Recommandation CNIL</div>
                                <div class="detail-value">Lignes directrices cookies - Octobre 2020</div>
                            </div>
                        </div>
                    </div>

                    <div class="violation-card">
                        <div class="violation-header">
                            <div class="violation-title">Transferts hors UE non documentés</div>
                            <span class="severity-badge severity-critical">Critique</span>
                        </div>
                        <div class="violation-description">
                            Des transferts de données personnelles vers des pays tiers (États-Unis) ont été détectés sans information 
                            claire sur les garanties appropriées mises en place.
                        </div>
                        <div class="violation-details">
                            <div class="detail-row">
                                <div class="detail-label">Article RGPD</div>
                                <div class="detail-value">Chapitre V - Articles 44-50</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Destinataires</div>
                                <div class="detail-value">Google Analytics, Facebook Pixel, Doubleclick</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Risques Tab -->
            <div id="risques" class="tab-content">
                <div class="section">
                    <h2 class="section-title">Analyse des risques</h2>
                    
                    <div class="chart-container">
                        <canvas id="riskChart" height="100"></canvas>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Risque</th>
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Probabilité</th>
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Impact</th>
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Niveau</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Sanction CNIL</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Élevée</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Très élevé</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;"><span class="severity-badge severity-critical">Critique</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Atteinte à la réputation</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Moyenne</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Élevé</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;"><span class="severity-badge severity-high">Élevé</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Perte de confiance utilisateurs</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Élevée</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Moyen</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;"><span class="severity-badge severity-high">Élevé</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Remédiation Tab -->
            <div id="remediation" class="tab-content">
                <div class="section">
                    <h2 class="section-title">Plan de remédiation</h2>
                    
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-date">Semaine 1-2 (Urgent)</div>
                            <div class="timeline-content">
                                <strong>Mise en conformité des cookies</strong>
                                <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                                    <li>Bloquer le dépôt de cookies avant consentement</li>
                                    <li>Implémenter un bandeau granulaire</li>
                                    <li>Documenter tous les cookies utilisés</li>
                                </ul>
                            </div>
                        </div>

                        <div class="timeline-item">
                            <div class="timeline-date">Semaine 3-4</div>
                            <div class="timeline-content">
                                <strong>Documentation des transferts</strong>
                                <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                                    <li>Identifier tous les transferts hors UE</li>
                                    <li>Mettre en place les garanties appropriées</li>
                                    <li>Informer les utilisateurs</li>
                                </ul>
                            </div>
                        </div>

                        <div class="timeline-item">
                            <div class="timeline-date">Mois 2</div>
                            <div class="timeline-content">
                                <strong>Amélioration de la transparence</strong>
                                <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                                    <li>Réviser la politique de confidentialité</li>
                                    <li>Créer un centre de préférences</li>
                                    <li>Former les équipes</li>
                                </ul>
                            </div>
                        </div>

                        <div class="timeline-item">
                            <div class="timeline-date">Mois 3</div>
                            <div class="timeline-content">
                                <strong>Audit de suivi</strong>
                                <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                                    <li>Vérifier la mise en œuvre</li>
                                    <li>Mesurer l'amélioration du score</li>
                                    <li>Ajuster si nécessaire</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Jurisprudence Tab -->
            <div id="jurisprudence" class="tab-content">
                <div class="section">
                    <h2 class="section-title">Jurisprudence pertinente</h2>
                    
                    <div class="violation-card">
                        <div class="violation-header">
                            <div class="violation-title">Google Ireland et Google LLC (CNIL - 2020)</div>
                            <span class="severity-badge severity-critical">90M€</span>
                        </div>
                        <div class="violation-description">
                            Sanction pour dépôt de cookies publicitaires sans consentement préalable et information insuffisante.
                        </div>
                        <div class="violation-details">
                            <div class="detail-row">
                                <div class="detail-label">Référence</div>
                                <div class="detail-value">Délibération SAN-2020-012 du 7 décembre 2020</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Montant</div>
                                <div class="detail-value">90 000 000 €</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Pertinence</div>
                                <div class="detail-value">Violation similaire détectée sur votre site</div>
                            </div>
                        </div>
                    </div>

                    <div class="violation-card">
                        <div class="violation-header">
                            <div class="violation-title">Amazon Europe Core (CNIL - 2021)</div>
                            <span class="severity-badge severity-critical">746M€</span>
                        </div>
                        <div class="violation-description">
                            Sanction record pour traitement de données publicitaires sans base légale appropriée.
                        </div>
                        <div class="violation-details">
                            <div class="detail-row">
                                <div class="detail-label">Référence</div>
                                <div class="detail-value">Décision du 16 juillet 2021</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Montant</div>
                                <div class="detail-value">746 000 000 €</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Méthodologie Tab -->
            <div id="methodologie" class="tab-content">
                <div class="section">
                    <h2 class="section-title">Méthodologie d'audit</h2>
                    
                    <div class="recommendation">
                        <div class="recommendation-title">Périmètre de l'audit</div>
                        <p style="color: #666; line-height: 1.8; margin-top: 10px;">
                            Cet audit couvre l'ensemble du site web leboncoin.fr, incluant toutes les pages publiques, 
                            les formulaires de collecte de données, les cookies et traceurs, ainsi que les flux de données 
                            vers des tiers.
                        </p>
                    </div>

                    <h3 style="margin: 30px 0 15px 0; color: #1a1a1a;">Outils utilisés</h3>
                    <ul style="margin-left: 20px; color: #666; line-height: 2;">
                        <li>Scanner automatisé de conformité RGPD</li>
                        <li>Analyse des cookies et traceurs</li>
                        <li>Inspection du code source</li>
                        <li>Tests de consentement</li>
                        <li>Analyse des flux réseau</li>
                        <li>Revue documentaire (politique de confidentialité, CGU)</li>
                    </ul>

                    <h3 style="margin: 30px 0 15px 0; color: #1a1a1a;">Critères d'évaluation</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Catégorie</th>
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Points</th>
                                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Score obtenu</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Consentement et cookies</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">30</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">15/30</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Transparence et information</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">25</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">18/25</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Droits des personnes</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">20</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">16/20</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Sécurité des données</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">15</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">12/15</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">Transferts internationaux</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">10</td>
                                <td style="padding: 15px; border-bottom: 1px solid #dee2e6;">6/10</td>
                            </tr>
                            <tr style="background: #f8f9fa; font-weight: 600;">
                                <td style="padding: 15px;">TOTAL</td>
                                <td style="padding: 15px;">100</td>
                                <td style="padding: 15px;">67/100</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }

        // Initialize charts
        window.addEventListener('load', function() {
            // Compliance Chart
            const complianceCtx = document.getElementById('complianceChart').getContext('2d');
            new Chart(complianceCtx, {
                type: 'bar',
                data: {
                    labels: ['Consentement', 'Transparence', 'Droits', 'Sécurité', 'Transferts'],
                    datasets: [{
                        label: 'Score obtenu',
                        data: [50, 72, 80, 80, 60],
                        backgroundColor: 'rgba(102, 126, 234, 0.8)'
                    }, {
                        label: 'Score requis',
                        data: [100, 100, 100, 100, 100],
                        backgroundColor: 'rgba(200, 200, 200, 0.3)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });

            // Risk Chart
            const riskCtx = document.getElementById('riskChart').getContext('2d');
            new Chart(riskCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Critique', 'Élevé', 'Moyen', 'Faible'],
                    datasets: [{
                        data: [3, 4, 3, 2],
                        backgroundColor: [
                            'rgba(245, 87, 108, 0.8)',
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(79, 172, 254, 0.8)',
                            'rgba(56, 239, 125, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        });
    </script>
</body>
</html>$REPORT$
)
ON CONFLICT (id) DO NOTHING;
