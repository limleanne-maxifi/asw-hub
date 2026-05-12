---
title: "AI in Air Traffic Control: what it means for ATM in 2026"
order: 5
summary: The EASA AI certification framework, the first operationally certified conflict detection tools, arrival management ML systems, and the human factors research informing AI-assisted ATC in 2026.
---

## What this theme covers

AI in air traffic control has spent five years in demonstration. ASW 2026 is the first major industry event since EASA's revised Concept Paper on AI guidance moved from draft into operational reference, and since the first generation of AI-assisted decision support tools entered certified operational service at multiple European ANSPs.

The track addresses four operational domains: AI-assisted conflict detection (the most mature category, with measured operational data now available from at least three European deployments); machine learning arrival management systems that optimise sequencing into busy terminal areas; and complexity prediction tools that help supervisors plan sector configurations and staffing.

The track also covers the certification methodology itself, which has had to adapt to safety-critical systems whose behaviour cannot be fully specified through traditional requirements-based engineering. Additional focus addresses human factors — controller training for AI-assisted operations, trust calibration, and the deliberate design of human–AI interfaces that keep the controller in command authority rather than degrading to a passive monitoring role.

## Why it matters now

The first AI tools certified for operational ATC use entered service in 2025–26. The questions are no longer "can AI work in ATC?" but "what does measured operational performance show?", "how is the certification framework evolving in light of operational data?", and "what is the next class of AI applications being prepared for certification submission?".

> EASA's 2024 update to the Concept Paper on AI guidance described **a roadmap towards Level 2 (human–AI teaming) and Level 3 (advanced automation) AI applications in ATM**, with the first operational Level 1 (assistance) AI tools certified in European ATC by end of 2025 [verify].

## Five questions, answered

### How is AI being used in air traffic control in 2026?

In 2026 AI is in operational use in three primary categories. First, AI-assisted conflict detection: machine learning systems that analyse the trajectories of aircraft pairs and alert controllers to potential separation infringements earlier or with fewer false alarms than conventional algorithms. Second, machine learning arrival management: optimising the sequence and spacing of arrivals into busy terminal areas, reducing fuel burn and runway wait times.

Third, complexity prediction: supervisor support tools that forecast sector workload over the planning horizon and inform decisions on sector configuration and controller staffing. Each of these has moved from demonstration into operational use at multiple European ANSPs in 2025–26, with measured performance data presented at ASW 2026 for the first time.

### What is the EASA Concept Paper on AI and why does it matter?

The EASA Concept Paper on AI is the European Union Aviation Safety Agency's published guidance on the certification of AI-based systems in aviation, including air traffic management. The paper, first issued in 2021 and revised through subsequent iterations, establishes a level-based framework: Level 1 covers AI as a controller assistance tool (the controller retains decision authority); Level 2 covers human–AI teaming (shared authority for specific decisions); Level 3 covers advanced automation.

Each level carries different certification expectations around training data assurance, operational data monitoring, and explainability. The Concept Paper matters because it provides ANSPs and suppliers with a stable reference against which AI products can be designed and certified. Without it, AI in ATC would have remained in indefinite demonstration.

### What is the difference between AI assistance and AI automation in ATC?

AI assistance refers to systems that present information, predictions, or recommendations to a controller who retains full decision authority. The controller sees the AI output and decides whether and how to act on it. AI automation refers to systems that take operational decisions directly — issuing clearances, adjusting trajectories, or rejecting separation infringements — without an explicit controller decision in the immediate loop.

The certified AI tools in operational service in 2026 are overwhelmingly assistance tools (EASA Level 1). Automation in ATC is constrained by the certification path, by the safety case for shared command authority, and by the controller licensing framework, none of which is yet positioned for routine Level 2 deployment. ASW 2026 sessions address what would have to change for that step.

### How is AI in ATC certified for operational use?

Certification of AI in ATC follows the European safety regulatory framework adapted to the specific characteristics of machine learning systems. The applicant must demonstrate that the AI system meets the safety performance requirements equivalent to a conventional system.

Additionally, the system must address AI-specific concerns including training data quality and representativeness, operational performance monitoring, robustness to data drift, and the explainability of system outputs sufficient for the controller to calibrate trust. The European Plan for Aviation Safety identifies AI-specific safety questions for ongoing work. EASA has published guidance materials and has worked with ANSPs and suppliers on individual certification submissions through the Concept Paper framework.

### What are the human factors challenges of AI-assisted air traffic control?

The principal human factors challenges of AI-assisted ATC are trust calibration, automation complacency, and skill retention. 

**Trust calibration:** Controllers must develop accurate intuition about when the AI is reliable and when it is not, neither over-trusting nor under-trusting outputs. **Automation complacency:** A controller who is monitoring an AI tool in routine conditions may be slower to detect AI failures than a controller actively performing the same task manually. **Skill retention:** If an AI tool removes the need for a particular skill in routine operation, that skill may degrade and become unavailable when needed.

Operational deployments in 2025–26 have generated training and procedural innovations that ASW 2026 sessions present and debate.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is AI being used in air traffic control in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In 2026 AI is in operational use in three primary categories. AI-assisted conflict detection: machine learning systems alert controllers to potential separation infringements earlier or with fewer false alarms. Machine learning arrival management: optimising the sequence and spacing of arrivals into busy terminal areas. Complexity prediction: supervisor support tools that forecast sector workload over the planning horizon. Each has moved from demonstration into operational use at multiple European ANSPs in 2025–26."
      }
    },
    {
      "@type": "Question",
      "name": "What is the EASA Concept Paper on AI and why does it matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The EASA Concept Paper on AI is the European Union Aviation Safety Agency's published guidance on the certification of AI-based systems in aviation, including ATM. The paper establishes a level-based framework: Level 1 covers AI as a controller assistance tool; Level 2 covers human–AI teaming; Level 3 covers advanced automation. Each carries different certification expectations around training data assurance, operational data monitoring, and explainability. It provides ANSPs and suppliers with a stable reference for designing and certifying AI products."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between AI assistance and AI automation in ATC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI assistance refers to systems that present information, predictions, or recommendations to a controller who retains full decision authority. AI automation refers to systems that take operational decisions directly — issuing clearances or adjusting trajectories — without an explicit controller decision in the immediate loop. The certified AI tools in operational service in 2026 are overwhelmingly assistance tools (EASA Level 1). Automation in ATC is constrained by the certification path and the controller licensing framework."
      }
    },
    {
      "@type": "Question",
      "name": "How is AI in ATC certified for operational use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Certification of AI in ATC follows the European safety regulatory framework adapted to machine learning. The applicant must demonstrate the AI system meets safety performance requirements equivalent to a conventional system, and must address AI-specific concerns including training data quality and representativeness, operational performance monitoring, robustness to data drift, and the explainability of system outputs sufficient for the controller to calibrate trust. EASA has published guidance materials and worked with ANSPs and suppliers on individual certification submissions through the Concept Paper framework."
      }
    },
    {
      "@type": "Question",
      "name": "What are the human factors challenges of AI-assisted air traffic control?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The principal human factors challenges are trust calibration, automation complacency, and skill retention. Trust calibration: controllers must develop accurate intuition about when the AI is reliable and when it is not. Automation complacency: a controller monitoring an AI tool in routine conditions may be slower to detect AI failures than a controller actively performing the task manually. Skill retention: if an AI tool removes the need for a particular skill in routine operation, that skill may degrade and become unavailable when needed."
      }
    }
  ]
}
</script>

## Sessions covering this theme

ASW 2026 hosts dedicated AI in ATC sessions covering certification, operational deployment, and human factors.

[View sessions covering this theme →](/sessions/)


## What ASW 2025 told us about this theme

ASW 2025 saw the first public operational trial results for AI-assisted conflict detection at London Terminal Control. [Read the ASW 2025 retrospective](/asw-2025/)
---

**For organisations exhibiting at ASW 2026:** Your AI in ATC content can be structured like this. Maxifi Digital turns conference sessions into AI-citable authority pages in four weeks. [See the Conference Sprint →](https://maxifidigital.com/services/conference-sprint/)
