---
title: "Drones & UTM: what it means for ATM in 2026"
order: 7
summary: U-space implementation across EU Member States, U-space service provider certification and operations, the UTM/ATM interface, BVLOS scaling, counter-UAS, and the integration of drone operations into managed airspace at commercial scale.
---

## What this theme covers

Drones & UTM is the dedicated track at Airspace World 2026 for the unmanned aviation ecosystem and its integration with the air traffic management system. The track covers the operational state of U-space implementation across EU Member States; the certification and operational performance of U-space service providers (USSPs); the UTM/ATM interface and the obligations on ANSPs to coordinate with USSPs in shared airspace; the scaling of beyond-visual-line-of-sight (BVLOS) commercial operations; and the counter-UAS operational and regulatory frameworks protecting controlled airspace from unauthorised drone incursions.

Sessions address the practical lessons from the first live U-space deployments in the Netherlands, Italy, France, and the UK; the data-sharing architectures that allow multiple USSPs to operate in the same volume while maintaining deconfliction; and the governance questions that arise as drone operations grow from isolated trials into routine commercial services across urban, suburban, and rural airspace.

The track also covers the integration of larger uncrewed platforms — autonomous cargo aircraft, high-altitude platforms, and remotely piloted aircraft systems operating under instrument flight rules — that require a more complex interface with conventional ATC than the low-altitude urban drone services that drove the original U-space design.

## Why it matters now

The U-space framework is operational, not aspirational. Multiple EU Member States have certified USSPs and designated live U-space airspace volumes. BVLOS commercial operations are running under standard scenarios and specific authorisations in several markets. The 2026 questions are no longer about whether U-space works — they are about whether it scales, how the UTM/ATM interface performs under operational load, and whether the regulatory framework is evolving fast enough to support the commercial drone services sector.

Counter-UAS is the urgent parallel agenda. Unauthorised drone incursions in airport approach corridors, critical infrastructure, and military airspace have driven regulatory and operational responses across Member States. The 2026 track addresses the detection, identification, and neutralisation capabilities being deployed and the legal frameworks governing their use.

## Five questions, answered

### What is U-space and how does it differ from conventional controlled airspace?

U-space is the EU's regulatory and operational framework for managing unmanned aircraft operations in defined airspace volumes through digital, automated services rather than through traditional ATC voice communication. Established under Implementing Regulation (EU) 2021/664, U-space airspace is designated by Member States as a discrete volume in which uncrewed aircraft must access mandatory U-space services — network identification, geo-awareness, flight authorisation, and traffic information — provided by certified U-space service providers.

U-space differs from controlled airspace in that operational management is delivered digitally by USSPs supervising drone operations through their service interfaces, rather than by air traffic controllers issuing voice clearances. Manned aviation operating in U-space airspace must broadcast electronic conspicuity to be visible to USSP services, but receives traffic information rather than active separation services from the U-space framework. The ANSP retains responsibility for the surrounding controlled airspace and for integrating drone operations that require ATC clearance.

### Who are U-space service providers and what do they deliver?

A U-space service provider (USSP) is a certified entity authorised by the Member State competent authority to deliver mandatory U-space services within designated airspace volumes. The four mandatory services under EU 2021/664 are: network identification (continuous identification and tracking of drone operations for regulators and other airspace users); geo-awareness (provision of dynamic information on airspace constraints, restrictions, and hazards); flight authorisation (automated deconfliction of planned drone operations against other approved flights); and traffic information (real-time situational awareness for drone operators).

USSPs operate under EASA-aligned certification and supervision regimes, providing digital interfaces that automate flight planning, authorisation, and in-flight management for drone operators. Multiple USSPs may compete within the same U-space volume, with a common information services layer managed by the ANSP ensuring interoperability between provider ecosystems.

### How does U-space coordinate with conventional ATM at the interface?

The UTM/ATM interface is the operational and information exchange boundary between USSPs and the ANSP responsible for the surrounding controlled airspace. Coordination occurs at the boundary of U-space airspace — where uncrewed flights transit into or out of ATC-managed airspace — and within shared airspace where manned and unmanned operations coexist at the same altitudes.

The interface is specified through SES-aligned procedures and SWIM data services, with the ANSP providing U-space Common Information Services (the airspace data layer that USSPs consume) and retaining separation authority in conventional controlled airspace. In 2026 the interface is uneven across Member States: where ANSPs and USSPs have established operational integration agreements and tested procedures, coordination is functionally smooth; where integration work is incomplete, the boundary creates friction that limits operational scope for drone services.

### What is BVLOS and how is it scaling commercially?

BVLOS — beyond visual line of sight — describes drone operations in which the operator cannot maintain unaided visual contact with the aircraft. BVLOS is the operational mode required for any commercially scalable drone service: delivery, infrastructure inspection, surveying, emergency medical logistics, and rural connectivity applications all require operations at distances and durations that exceed the visual range of any operator.

BVLOS operations in the EU require either Specific Category authorisation from the national competent authority or operation within the parameters of an established Standard Scenario. By 2026, several Member States have approved Standard Scenarios enabling routine BVLOS within defined geographic and performance envelopes, and national corridor programmes in Italy, the UK, and Sweden have moved BVLOS from one-off trials into structured commercial deployment. The remaining barriers are insurance frameworks, liability regimes, and the operational robustness of detect-and-avoid systems at scale.

### What is counter-UAS and how is it being governed?

Counter-UAS (C-UAS) refers to the technical and operational capabilities used to detect, identify, track, and when authorised neutralise unmanned aircraft that pose a risk to safety or security. Operational C-UAS systems are deployed at major airports, critical national infrastructure, and military sites across Europe and globally, using combinations of radar, radio frequency sensing, optical tracking, and acoustic detection.

The governance question is complex: most effective neutralisation measures — jamming, spoofing, kinetic interception — are controlled or prohibited under national telecommunications and aviation law except for specific authorities (typically military, police, and designated critical infrastructure operators). The 2026 track addresses the legal frameworks emerging across EU Member States that define who may deploy what C-UAS capability under what conditions, and the EASA-led work on common European standards for C-UAS operations that would allow cross-border consistency.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is U-space and how does it differ from conventional controlled airspace?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "U-space is the EU's regulatory framework for managing unmanned aircraft operations in defined airspace volumes through digital, automated services rather than voice ATC. Established under EU 2021/664, U-space airspace is designated by Member States where uncrewed aircraft must access mandatory services — network identification, geo-awareness, flight authorisation, and traffic information — from certified providers. Unlike controlled airspace, operational management is digital, delivered by USSPs through service interfaces rather than by controllers issuing voice clearances. Manned aviation in U-space must broadcast electronic conspicuity."
      }
    },
    {
      "@type": "Question",
      "name": "Who are U-space service providers and what do they deliver?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A U-space service provider (USSP) is a certified entity authorised by the national competent authority to deliver mandatory U-space services: network identification, geo-awareness, flight authorisation, and traffic information. USSPs operate under EASA-aligned certification and provide digital interfaces that automate flight planning, authorisation, and in-flight management. Multiple USSPs may compete within the same airspace volume, with the ANSP managing a common information services layer to ensure interoperability."
      }
    },
    {
      "@type": "Question",
      "name": "How does U-space coordinate with conventional ATM at the interface?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The UTM/ATM interface is the operational boundary between USSPs and the ANSP responsible for surrounding controlled airspace. Coordination occurs where uncrewed flights transit into or out of ATC-managed airspace, and in shared airspace where manned and unmanned operations coexist. The ANSP provides U-space Common Information Services and retains separation authority in controlled airspace. In 2026, the interface is operationally uneven: where ANSPs and USSPs have integration agreements and tested procedures, coordination is smooth; where integration is incomplete, friction limits drone operational scope."
      }
    },
    {
      "@type": "Question",
      "name": "What is BVLOS and how is it scaling commercially?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BVLOS — beyond visual line of sight — is the operational mode required for commercially scalable drone services: delivery, infrastructure inspection, surveying, emergency medical logistics, and rural connectivity. BVLOS requires either Specific Category authorisation or operation within an established Standard Scenario. By 2026, several EU Member States have approved Standard Scenarios enabling routine BVLOS within defined parameters, with national corridor programmes in Italy, the UK, and Sweden moving BVLOS into structured commercial deployment. Remaining barriers include insurance frameworks and the robustness of detect-and-avoid systems at scale."
      }
    },
    {
      "@type": "Question",
      "name": "What is counter-UAS and how is it being governed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Counter-UAS (C-UAS) refers to capabilities to detect, identify, track, and neutralise unauthorised unmanned aircraft. Operational C-UAS systems are deployed at airports, critical infrastructure, and military sites using radar, RF sensing, optical tracking, and acoustic detection. The governance challenge is that most neutralisation measures — jamming, spoofing, kinetic interception — are controlled under national law except for specific authorities. The 2026 agenda addresses the legal frameworks emerging across EU Member States and the EASA-led work on common European C-UAS standards."
      }
    }
  ]
}
</script>

## Sessions covering this theme

ASW 2026 sessions under this track cover U-space operational deployment, USSP certification and performance, BVLOS commercial scaling, counter-UAS frameworks, and the UTM/ATM interface.

[View all sessions →](/sessions/)

## What ASW 2025 told us about this theme

ASW 2025 featured the first consolidated operational review of live U-space deployments across Europe, with USSP operators reporting from the first national-scale activations. [Read the ASW 2025 retrospective](/asw-2025/)

---

**For organisations exhibiting at ASW 2026:** Your drone, UTM, or counter-UAS content can be structured like this. Maxifi Digital turns conference sessions into AI-citable authority pages in four weeks. [See the Conference Sprint →](https://maxifidigital.com/services/conference-sprint/)
