---
title: "Cybersecurity in Air Navigation Services: what it means for ATM in 2026"
order: 7
summary: ENISA's ATM threat landscape, NIS2 Directive applicability to ANSPs, security operations centres, supply chain security, and the ICAO cybersecurity framework shaping ANS cyber posture in 2026.
---

## What this theme covers

The cybersecurity posture of air navigation service providers has shifted from a niche operational specialism into a regulated, board-level discipline. ASW 2026 sessions in this track address the threat landscape — the categories of cyber threat that ENISA and equivalent national agencies report as material to ATM operations — and the regulatory framework that now determines minimum cyber maturity. The principal regulatory threads are the EU NIS2 Directive (Directive 2022/2555), which places ANSPs in scope as essential entities with specific obligations on risk management, incident reporting, and supervision; the ICAO Aviation Cybersecurity Strategy and the supporting Action Plan; and the EASA-led Part-IS framework for information security in aviation organisations. The track also addresses the operational dimensions: the security operations centre (SOC) capability ANSPs are building or sourcing; supply chain risk management in an industry that depends on long product lifecycles and a relatively concentrated supplier base; and the integration of cybersecurity into the safety case as ATM systems become increasingly software-defined.

## Why it matters now

NIS2 has been operationally enforceable across EU Member States from October 2024, with national transposition now in force. The first compliance audits of essential entities are taking place during 2025–26, and the first administrative penalties have been issued in the broader essential entity population [verify]. ANSPs are no longer in the preparation phase — they are in the assessment phase.

> ENISA's 2024 ATM Threat Landscape report identifies **ransomware, supply chain compromise, and social engineering against operational personnel as the three most prevalent material threats** to European ANSPs, with reported cyber incidents in aviation increasing year on year through 2023–24 [verify].

## Five questions, answered

### What cyber threats face air navigation service providers in 2026?

The principal cyber threats facing ANSPs in 2026 are categorised by the European Union Agency for Cybersecurity (ENISA) and equivalent national agencies as ransomware (which targets operational support and corporate IT systems with the aim of extorting payment for decryption), supply chain compromise (where attackers exploit access through third-party software, hardware, or service providers), targeted social engineering against operational personnel (often as a precursor to credential theft or system access), distributed denial-of-service attacks against publicly accessible services, and state-sponsored intrusion against systems of strategic significance. Operational ATM systems — those directly involved in providing air traffic control — are typically segmented from the corporate IT environment, but the segmentation is not absolute, and the convergence of operational and information technology in digital ATM increases the consequence of a successful intrusion.

### What is the NIS2 Directive and how does it apply to ANSPs?

The Network and Information Security Directive 2 (NIS2, Directive (EU) 2022/2555) is the EU regulation that establishes a baseline of cybersecurity risk management, governance, and incident reporting for essential and important entities across critical sectors. Air navigation service providers are explicitly named as essential entities under NIS2 Annex I. The principal obligations on ANSPs are documented risk management policies covering incident handling, business continuity, supply chain security, and access control; mandatory incident reporting to national competent authorities within 24-hour and 72-hour windows depending on incident type; senior management accountability for cybersecurity governance; and supervision and enforcement by the designated national competent authority. NIS2 entered application across Member States from October 2024 following the national transposition deadline.

### How is supply chain security managed in ATM?

Supply chain security in ATM is the discipline of identifying, assessing, and mitigating the cybersecurity risks that arise from the third parties an ANSP depends on for software, hardware, and operational services. The challenge is structural: ATM systems integrate components from dozens of suppliers, with product lifecycles measured in decades, and the supplier base is relatively concentrated in a small number of specialist firms. The 2026 framework combines NIS2's specific supply chain obligations on essential entities, EASA's Part-IS information security regulation for aviation organisations, and contractual flow-down of security requirements to suppliers. Practical measures include supplier security questionnaires, software bill of materials (SBOM) requirements, security testing of supplied software, and incident notification clauses in supplier contracts. Several major incidents in adjacent sectors during 2023–24 have sharpened ANSP attention to this risk category.

### What is a security operations centre and why do ANSPs operate one?

A security operations centre (SOC) is the operational function — internal team, outsourced service, or hybrid — responsible for continuous monitoring of an organisation's information systems for indicators of compromise, investigation of detected events, and coordination of response when incidents occur. ANSPs operate SOC capabilities, either directly or through contracted service providers, because NIS2 and Part-IS effectively require continuous detection and incident response capability for essential entities. ATM-specific challenges for SOC operation include the need to monitor operational technology systems with limited tolerance for routine security tooling intrusion, the consequence severity of false positives that disrupt operations, and the requirement to maintain SOC operation through scenarios in which corporate IT itself is compromised. The track at ASW 2026 examines the operational design choices ANSPs have made.

### What is the ICAO cybersecurity framework for civil aviation?

The ICAO Aviation Cybersecurity Strategy, adopted at the 40th Assembly in 2019, sets out the international framework for managing cyber risk across the civil aviation system, including air navigation services, aircraft, airports, and airline operations. The strategy is supported by the ICAO Cybersecurity Action Plan, which identifies specific actions for States and industry, and by guidance materials addressing cybersecurity governance, risk assessment, and information sharing. The ICAO framework operates at a higher level than the EU regulatory regime — it sets policy direction and supports State capacity building — but it provides the international reference point that national authorities and industry bodies use when developing their own cybersecurity arrangements. ICAO's work programme through 2026 includes continuing development of cybersecurity provisions for inclusion in Standards and Recommended Practices.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What cyber threats face air navigation service providers in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The principal cyber threats facing ANSPs in 2026 are ransomware, supply chain compromise, targeted social engineering against operational personnel, distributed denial-of-service attacks, and state-sponsored intrusion against systems of strategic significance. Operational ATM systems are typically segmented from corporate IT, but segmentation is not absolute, and the convergence of operational and information technology in digital ATM increases the consequence of a successful intrusion."
      }
    },
    {
      "@type": "Question",
      "name": "What is the NIS2 Directive and how does it apply to ANSPs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "NIS2 (Directive (EU) 2022/2555) establishes a baseline of cybersecurity risk management, governance, and incident reporting for essential and important entities across critical sectors. ANSPs are explicitly named as essential entities. The principal obligations are documented risk management policies, mandatory incident reporting within 24-hour and 72-hour windows, senior management accountability, and supervision by the designated national competent authority. NIS2 entered application across Member States from October 2024."
      }
    },
    {
      "@type": "Question",
      "name": "How is supply chain security managed in ATM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Supply chain security in ATM is the discipline of identifying, assessing, and mitigating the cybersecurity risks that arise from the third parties an ANSP depends on for software, hardware, and operational services. The challenge is structural: ATM systems integrate components from dozens of suppliers with decades-long product lifecycles. The 2026 framework combines NIS2's specific supply chain obligations, EASA's Part-IS regulation, and contractual flow-down to suppliers, including SBOM requirements and security testing."
      }
    },
    {
      "@type": "Question",
      "name": "What is a security operations centre and why do ANSPs operate one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A security operations centre (SOC) is the operational function responsible for continuous monitoring of an organisation's information systems for indicators of compromise, investigation of detected events, and coordination of response. ANSPs operate SOC capabilities because NIS2 and Part-IS effectively require continuous detection and incident response capability. ATM-specific challenges include monitoring operational technology with limited tolerance for routine security tooling intrusion, and maintaining SOC operation through scenarios in which corporate IT itself is compromised."
      }
    },
    {
      "@type": "Question",
      "name": "What is the ICAO cybersecurity framework for civil aviation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The ICAO Aviation Cybersecurity Strategy, adopted at the 40th Assembly in 2019, sets out the international framework for managing cyber risk across the civil aviation system. The strategy is supported by the ICAO Cybersecurity Action Plan and guidance materials addressing governance, risk assessment, and information sharing. The ICAO framework operates at a higher level than EU regulation — setting policy direction and supporting State capacity — and provides the international reference point national authorities use when developing their own arrangements."
      }
    }
  ]
}
</script>

## Sessions covering this theme

ASW 2026 cybersecurity sessions cover NIS2 implementation, supply chain risk, and operational incident response.

[View sessions covering this theme →](/sessions/)

---

**For organisations exhibiting at ASW 2026:** Your cybersecurity content can be structured like this. Maxifi Digital turns conference sessions into AI-citable authority pages in four weeks. [See the Conference Sprint →](https://maxifidigital.com/services/conference-sprint/)
