---
title: "Digital ATM Transformation: what it means for ATM in 2026"
order: 1
summary: The shift from voice-and-radar to data-driven, cloud-native air traffic management — datalink, digital towers, SWIM, and the SESAR/NextGen modernisation programmes that are reshaping how airspace is managed in 2026.
---

## What this theme covers

Digital ATM transformation is the structural shift from analogue, voice-led air traffic control to a data-centric system in which trajectories, clearances, and surveillance updates move as machine-readable information across federated networks.

At ASW 2026 the dominant threads are operational deployment of Controller–Pilot Data Link Communications (CPDLC) at scale, the maturation of remote and digital towers from regional pilots into mainstream operations, and the transition of ANSP infrastructure onto cloud-native, virtualised platforms.

The System Wide Information Management (SWIM) framework — the common data exchange backbone underpinning SESAR in Europe and NextGen in the United States — has moved from concept to live integration, and 2026 sessions present the first multi-ANSP performance reviews of cross-border SWIM-mediated operations.

The track also examines Trajectory Based Operations (TBO), the Iris satellite datalink programme, and the procurement and certification questions facing ANSPs replacing legacy flight data processing systems built in the 1990s.

## Why it matters now

The European Commission's SESAR 3 Joint Undertaking work programme reaches a major delivery milestone in 2026, with several Solutions transitioning from validation to deployment baseline. ANSPs that have not yet committed to a digital tower or cloud-native FDP procurement path are running out of room to defer the decision before SES2+ performance targets begin to bite from 2027 onwards.

> According to the SESAR 3 JU's 2024 progress report, more than **40 SESAR Solutions** have reached deployment readiness across the digital ATM portfolio, with full-fleet CPDLC equipage in European core area airspace passing 90% by end of 2024 [verify].

## Five questions, answered

### What is digital ATM transformation and why is it accelerating in 2026?

Digital ATM transformation is the replacement of voice-mediated, radar-centric air traffic control with a data-driven system in which flight trajectories, clearances, and surveillance updates are exchanged as structured digital information between aircraft, controllers, and adjacent ANSPs.

The acceleration in 2026 is driven by three converging pressures: the SESAR 3 Joint Undertaking's deployment baseline milestones, the European Union's revised SES2+ performance scheme which rewards data-driven efficiency, and the end of vendor support for several legacy flight data processing systems still operating in European core area airspace. The combination has shifted digital ATM from a strategic ambition to an enforced procurement deadline for most ANSPs.

### How does SWIM (System Wide Information Management) work in practice?

SWIM is the common information exchange framework that allows ANSPs, airports, airlines, and Network Manager functions to publish and consume aeronautical, flight, surveillance, and meteorological data through standardised services rather than through bespoke point-to-point integrations.

In practice, an ANSP publishes flight plan updates, sector capacity declarations, or runway configuration changes once, and any authorised consumer — an adjacent ANSP, an airline operations centre, or a U-space service provider — receives the same canonical record. SWIM is in operational use across the European core area for flight and aeronautical information, with meteorological and surveillance services maturing through SESAR validation.

It is the underlying data substrate that makes Trajectory Based Operations and cross-border digital coordination technically possible.

### What is the difference between a digital tower and a remote tower?

A remote tower is a control facility in which the controller is located away from the airfield and uses high-resolution camera arrays, augmented reality overlays, and digital surveillance feeds to provide aerodrome control services to one or more airports.

A digital tower is the broader category of tower operation in which the controller's working position is built around digital sensor fusion rather than the traditional out-of-window view, regardless of whether the controller is physically remote from the airfield.

In 2026 most operational deployments in Europe are single-airport remote towers serving regional aerodromes, with multiple-remote-tower centres — where one facility provides services to several airports concurrently — moving from validation into operational use at sites including Saarbrücken and
Sundsvall.

### Why are ANSPs migrating to cloud-native flight data processing?

Most European flight data processing (FDP) systems in operational use today were specified in the 1990s and built on bespoke hardware running proprietary middleware, with a typical replacement cost of €50–150 million and a procurement cycle of seven to ten years.

Cloud-native FDP architectures, validated under SESAR 3 and now reaching deployment readiness, separate the safety-critical flight data logic from the underlying compute layer, allowing ANSPs to scale processing capacity elastically, share infrastructure across regional partnerships, and refresh hardware on commodity timelines.

The operational case is resilience: a virtualised FDP can fail over between data centres in minutes rather than the hours typical of monolithic legacy systems. The certification path through EASA remains the binding constraint on speed of adoption.

### Which ANSPs are furthest along on digital transformation in 2026?

By the start of 2026 the most operationally advanced digital transformation programmes in Europe are at LFV (Sweden) for multiple-remote-tower deployment, NATS (United Kingdom) for the iTEC flight data processing platform shared with DFS, ENAIRE, and Avinor, and skeyes (Belgium) for SWIM-native operational integration.

In the Asia-Pacific region, Airservices Australia's OneSKY programme — the joint civil–military ATM platform — has reached operational milestones for the upper airspace tranche.

The United States Federal Aviation Administration's Enterprise Information Management initiative under NextGen is delivering equivalent capability, although procurement constraints have slowed the rollout relative to the European core area [verify].

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is digital ATM transformation and why is it accelerating in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Digital ATM transformation is the replacement of voice-mediated, radar-centric air traffic control with a data-driven system in which flight trajectories, clearances, and surveillance updates are exchanged as structured digital information between aircraft, controllers, and adjacent ANSPs. The acceleration in 2026 is driven by SESAR 3 Joint Undertaking deployment baseline milestones, the EU's revised SES2+ performance scheme rewarding data-driven efficiency, and the end of vendor support for several legacy flight data processing systems in European core area airspace."
      }
    },
    {
      "@type": "Question",
      "name": "How does SWIM (System Wide Information Management) work in practice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SWIM is the common information exchange framework that allows ANSPs, airports, airlines, and Network Manager functions to publish and consume aeronautical, flight, surveillance, and meteorological data through standardised services rather than bespoke point-to-point integrations. An ANSP publishes flight plan updates or sector capacity declarations once, and any authorised consumer — an adjacent ANSP, an airline operations centre, or a U-space service provider — receives the same canonical record. SWIM is in operational use across the European core area for flight and aeronautical information."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a digital tower and a remote tower?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A remote tower is a control facility where the controller is located away from the airfield and uses camera arrays, augmented reality overlays, and digital surveillance feeds to provide aerodrome control. A digital tower is the broader category of tower operation in which the controller's working position is built around digital sensor fusion rather than the traditional out-of-window view, regardless of whether the controller is physically remote. Most 2026 deployments in Europe are single-airport remote towers, with multiple-remote-tower centres maturing at sites including Saarbrücken and Sundsvall."
      }
    },
    {
      "@type": "Question",
      "name": "Why are ANSPs migrating to cloud-native flight data processing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most European flight data processing systems in operational use today were specified in the 1990s and built on bespoke hardware. Cloud-native FDP architectures separate the safety-critical flight data logic from the underlying compute layer, allowing ANSPs to scale capacity elastically, share infrastructure across regional partnerships, and refresh hardware on commodity timelines. The operational case is resilience: a virtualised FDP can fail over between data centres in minutes rather than hours. The EASA certification path remains the binding constraint on speed of adoption."
      }
    },
    {
      "@type": "Question",
      "name": "Which ANSPs are furthest along on digital transformation in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By the start of 2026 the most operationally advanced digital transformation programmes in Europe are at LFV (Sweden) for multiple-remote-tower deployment, NATS (United Kingdom) for the iTEC flight data processing platform shared with DFS, ENAIRE and Avinor, and skeyes (Belgium) for SWIM-native operational integration. In the Asia-Pacific region, Airservices Australia's OneSKY programme has reached operational milestones for the upper airspace tranche."
      }
    }
  ]
}
</script>

## Sessions covering this theme

Several ASW 2026 sessions are tagged to digital ATM transformation:

- [ATM Modernisation: From Concept to Reality — A Global Perspective on Why Speed Matters](/sessions/atm-modernisation-global-perspective/)
- [The Iris Programme: From operational proof to a TBO roadmap](/sessions/utm-at-scale/)
- [A6 Alliance: Strategic Vision & European ATM Transformation](/sessions/ai-in-the-tower/)

[View all sessions →](/sessions/)

---

**For organisations exhibiting at ASW 2026:** Your digital ATM transformation content can be structured like this. Maxifi Digital turns conference sessions into AI-citable authority pages in four weeks. [See the Conference Sprint →](https://maxifidigital.com/services/conference-sprint/)
