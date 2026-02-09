-- Insert demo scan for the demo user with the Leboncoin.fr report
-- This script uses the actual demo user ID and correct column names

DO $$
DECLARE
    demo_user_id UUID := '468ab8e6-c344-457e-bf51-e42298f7ac57';
    scan_id UUID;
BEGIN
    -- Delete any existing demo scans for this user to avoid duplicates
    DELETE FROM public.scans 
    WHERE user_id = demo_user_id 
    AND target_url = 'https://www.leboncoin.fr';

    -- Insert the demo scan with the complete HTML report
    -- Using only columns that exist in the scans table
    INSERT INTO public.scans (
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
        demo_user_id,
        'https://www.leboncoin.fr',
        'normal',  -- Using 'normal' which is displayed as "Full Scan" in the UI
        'completed',
        100,
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '1 hour',
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
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 20px;
        }

        .company-info h1 {
            color: #2d3748;
            font-size: 28px;
            margin-bottom: 5px;
        }

        .company-info p {
            color: #718096;
            font-size: 14px;
        }

        .report-meta {
            text-align: right;
        }

        .report-meta .label {
            color: #718096;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .report-meta .value {
            color: #2d3748;
            font-size: 16px;
            font-weight: 600;
            margin-top: 5px;
        }

        .site-info {
            background: #f7fafc;
            padding: 20px;
            border-radius: 10px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .info-item .label {
            color: #718096;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .info-item .value {
            color: #2d3748;
            font-size: 16px;
            font-weight: 600;
        }

        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .tab {
            background: white;
            border: none;
            padding: 15px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            color: #718096;
            transition: all 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .tab:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .content-section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .section-title {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            border-radius: 12px;
            color: white;
        }

        .stat-card.warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-card.success {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-card .label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 36px;
            font-weight: 700;
        }

        .violation-item {
            background: #f7fafc;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #f5576c;
        }

        .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }

        .violation-title {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
        }

        .severity-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .severity-high {
            background: #fed7d7;
            color: #c53030;
        }

        .severity-medium {
            background: #feebc8;
            color: #c05621;
        }

        .severity-low {
            background: #c6f6d5;
            color: #2f855a;
        }

        .violation-description {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 15px;
        }

        .violation-details {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .detail-label {
            color: #718096;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .detail-value {
            color: #2d3748;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .screenshot {
            margin-top: 15px;
            border-radius: 8px;
            overflow: hidden;
        }

        .screenshot img {
            width: 100%;
            height: auto;
            display: block;
        }

        .chart-container {
            position: relative;
            height: 300px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        th {
            background: #f7fafc;
            color: #2d3748;
            font-weight: 600;
        }

        .timeline {
            position: relative;
            padding-left: 30px;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e2e8f0;
        }

        .timeline-item {
            position: relative;
            padding-bottom: 30px;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -35px;
            top: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #667eea;
            border: 3px solid white;
            box-shadow: 0 0 0 2px #667eea;
        }

        .timeline-date {
            color: #667eea;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .timeline-title {
            color: #2d3748;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .timeline-description {
            color: #718096;
            font-size: 14px;
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

            .content-section {
                box-shadow: none;
                page-break-inside: avoid;
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
                    <p>Analyse de conformité et recommandations</p>
                </div>
                <div class="report-meta">
                    <div class="label">ID du Scan</div>
                    <div class="value">SCAN-2024-001</div>
                    <div class="label" style="margin-top: 15px;">Date</div>
                    <div class="value">16/10/2024 20:49</div>
                </div>
            </div>
            <div class="site-info">
                <div class="info-item">
                    <div class="label">Site Audité</div>
                    <div class="value">leboncoin.fr</div>
                </div>
                <div class="info-item">
                    <div class="label">Profil d'Analyse</div>
                    <div class="value">Complet</div>
                </div>
                <div class="info-item">
                    <div class="label">Score de Conformité</div>
                    <div class="value">42/100</div>
                </div>
                <div class="info-item">
                    <div class="label">Violations Détectées</div>
                    <div class="value">47</div>
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

        <div id="synthese" class="tab-content active">
            <div class="content-section">
                <h2 class="section-title">Synthèse Exécutive</h2>
                
                <div class="stats-grid">
                    <div class="stat-card warning">
                        <div class="label">Violations Critiques</div>
                        <div class="value">12</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Violations Moyennes</div>
                        <div class="value">23</div>
                    </div>
                    <div class="stat-card success">
                        <div class="label">Violations Mineures</div>
                        <div class="value">12</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Score Global</div>
                        <div class="value">42/100</div>
                    </div>
                </div>

                <p style="color: #4a5568; line-height: 1.8; margin-bottom: 20px;">
                    L'audit RGPD du site <strong>leboncoin.fr</strong> révèle des non-conformités significatives 
                    nécessitant une attention immédiate. Le score de conformité de 42/100 indique des lacunes 
                    importantes dans la protection des données personnelles des utilisateurs.
                </p>

                <div class="chart-container">
                    <canvas id="violationsChart"></canvas>
                </div>
            </div>
        </div>

        <div id="violations" class="tab-content">
            <div class="content-section">
                <h2 class="section-title">Violations Détectées</h2>
                
                <div class="violation-item">
                    <div class="violation-header">
                        <div class="violation-title">Absence de consentement explicite pour les cookies</div>
                        <span class="severity-badge severity-high">Critique</span>
                    </div>
                    <div class="violation-description">
                        Le site dépose des cookies de tracking avant l'obtention du consentement de l'utilisateur, 
                        en violation de l'article 82 de la loi Informatique et Libertés.
                    </div>
                    <div class="violation-details">
                        <div class="detail-label">Article RGPD Concerné</div>
                        <div class="detail-value">Article 6 (Licéité du traitement)</div>
                        <div class="detail-label">Recommandation</div>
                        <div class="detail-value">
                            Implémenter un système de gestion du consentement conforme qui bloque tous les cookies 
                            non essentiels jusqu'à l'obtention d'un consentement explicite.
                        </div>
                    </div>
                </div>

                <div class="violation-item">
                    <div class="violation-header">
                        <div class="violation-title">Politique de confidentialité incomplète</div>
                        <span class="severity-badge severity-high">Critique</span>
                    </div>
                    <div class="violation-description">
                        La politique de confidentialité ne mentionne pas clairement les durées de conservation 
                        des données ni les droits des utilisateurs.
                    </div>
                    <div class="violation-details">
                        <div class="detail-label">Article RGPD Concerné</div>
                        <div class="detail-value">Article 13 (Informations à fournir)</div>
                        <div class="detail-label">Recommandation</div>
                        <div class="detail-value">
                            Mettre à jour la politique de confidentialité pour inclure toutes les informations 
                            obligatoires selon l'article 13 du RGPD.
                        </div>
                    </div>
                </div>

                <div class="violation-item">
                    <div class="violation-header">
                        <div class="violation-title">Transferts de données hors UE non documentés</div>
                        <span class="severity-badge severity-medium">Moyen</span>
                    </div>
                    <div class="violation-description">
                        Des transferts de données vers des serveurs situés hors de l'Union Européenne ont été 
                        détectés sans garanties appropriées.
                    </div>
                    <div class="violation-details">
                        <div class="detail-label">Article RGPD Concerné</div>
                        <div class="detail-value">Article 44-46 (Transferts internationaux)</div>
                        <div class="detail-label">Recommandation</div>
                        <div class="detail-value">
                            Mettre en place des clauses contractuelles types (CCT) ou d'autres mécanismes 
                            de transfert conformes au RGPD.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="risques" class="tab-content">
            <div class="content-section">
                <h2 class="section-title">Évaluation des Risques</h2>
                
                <table>
                    <thead>
                        <tr>
                            <th>Risque</th>
                            <th>Probabilité</th>
                            <th>Impact</th>
                            <th>Niveau</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sanction CNIL</td>
                            <td>Élevée</td>
                            <td>Critique</td>
                            <td><span class="severity-badge severity-high">Critique</span></td>
                        </tr>
                        <tr>
                            <td>Atteinte à la réputation</td>
                            <td>Moyenne</td>
                            <td>Élevé</td>
                            <td><span class="severity-badge severity-medium">Moyen</span></td>
                        </tr>
                        <tr>
                            <td>Perte de confiance des utilisateurs</td>
                            <td>Élevée</td>
                            <td>Moyen</td>
                            <td><span class="severity-badge severity-medium">Moyen</span></td>
                        </tr>
                        <tr>
                            <td>Contentieux avec les utilisateurs</td>
                            <td>Faible</td>
                            <td>Moyen</td>
                            <td><span class="severity-badge severity-low">Faible</span></td>
                        </tr>
                    </tbody>
                </table>

                <div class="chart-container">
                    <canvas id="riskChart"></canvas>
                </div>
            </div>
        </div>

        <div id="remediation" class="tab-content">
            <div class="content-section">
                <h2 class="section-title">Plan de Remédiation</h2>
                
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">Semaine 1-2</div>
                        <div class="timeline-title">Actions Immédiates</div>
                        <div class="timeline-description">
                            Mise en conformité du système de gestion des cookies et mise à jour de la politique 
                            de confidentialité.
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">Semaine 3-4</div>
                        <div class="timeline-title">Corrections Prioritaires</div>
                        <div class="timeline-description">
                            Documentation des transferts de données et mise en place des garanties appropriées.
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">Semaine 5-8</div>
                        <div class="timeline-title">Améliorations Structurelles</div>
                        <div class="timeline-description">
                            Révision complète des processus de traitement des données et formation des équipes.
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">Semaine 9-12</div>
                        <div class="timeline-title">Audit de Suivi</div>
                        <div class="timeline-description">
                            Vérification de la mise en œuvre des corrections et audit de conformité complet.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="jurisprudence" class="tab-content">
            <div class="content-section">
                <h2 class="section-title">Jurisprudence Pertinente</h2>
                
                <div class="violation-item">
                    <div class="violation-title">CNIL vs Google Ireland (2020)</div>
                    <div class="violation-description">
                        Sanction de 60 millions d'euros pour non-respect des règles de consentement aux cookies. 
                        Cette décision établit un précédent important concernant l'obligation d'obtenir un 
                        consentement explicite avant le dépôt de cookies.
                    </div>
                </div>

                <div class="violation-item">
                    <div class="violation-title">CJUE - Schrems II (2020)</div>
                    <div class="violation-description">
                        Invalidation du Privacy Shield pour les transferts de données vers les États-Unis. 
                        Cette décision impose des garanties supplémentaires pour tous les transferts 
                        internationaux de données.
                    </div>
                </div>
            </div>
        </div>

        <div id="methodologie" class="tab-content">
            <div class="content-section">
                <h2 class="section-title">Méthodologie d'Audit</h2>
                
                <p style="color: #4a5568; line-height: 1.8; margin-bottom: 20px;">
                    Cet audit a été réalisé selon une méthodologie rigoureuse combinant analyse automatisée 
                    et expertise humaine :
                </p>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="label">Pages Analysées</div>
                        <div class="value">156</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Cookies Détectés</div>
                        <div class="value">89</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Requêtes Réseau</div>
                        <div class="value">1,247</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Durée d'Analyse</div>
                        <div class="value">2h</div>
                    </div>
                </div>

                <h3 style="color: #2d3748; margin: 30px 0 15px;">Outils Utilisés</h3>
                <ul style="color: #4a5568; line-height: 2;">
                    <li>Scanner automatisé de conformité RGPD</li>
                    <li>Analyse des cookies et trackers</li>
                    <li>Vérification des politiques de confidentialité</li>
                    <li>Test des formulaires de consentement</li>
                    <li>Analyse des flux de données</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(content => content.classList.remove('active'));
            
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            document.getElementById(tabName).classList.add('active');
            
            event.target.classList.add('active');
        }

        const violationsCtx = document.getElementById('violationsChart');
        if (violationsCtx) {
            new Chart(violationsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Critiques', 'Moyennes', 'Mineures'],
                    datasets: [{
                        data: [12, 23, 12],
                        backgroundColor: ['#f5576c', '#f093fb', '#4facfe']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        const riskCtx = document.getElementById('riskChart');
        if (riskCtx) {
            new Chart(riskCtx, {
                type: 'bar',
                data: {
                    labels: ['Sanction CNIL', 'Réputation', 'Confiance', 'Contentieux'],
                    datasets: [{
                        label: 'Niveau de Risque',
                        data: [9, 6, 6, 3],
                        backgroundColor: ['#f5576c', '#f093fb', '#f093fb', '#4facfe']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    }
                }
            });
        }
    </script>
</body>
</html>$REPORT$
    ) RETURNING id INTO scan_id;

    RAISE NOTICE 'Demo scan created successfully with ID: %', scan_id;
END $$;
