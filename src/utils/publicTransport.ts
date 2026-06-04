export interface TransitOption {
  type: "BUS" | "CAB";
  title: string;
  pickupPoint: string;
  fare: string;
  timing: string;
  guideSteps: string[];
}

export interface PublicTransportData {
  spotName: string;
  startingFrom: string;
  options: TransitOption[];
}

export function getPublicTransportOptions(spotName: string, startingFrom: string = "Central Railway Junction"): PublicTransportData {
  const normSpot = spotName.toLowerCase();
  
  // Custom generator tailored to spot location
  const isJaipurSpot = normSpot.includes("palace") || normSpot.includes("mahal") || normSpot.includes("fort");
  const isAgraSpot = normSpot.includes("taj") || normSpot.includes("agra");
  const isMumbaiSpot = normSpot.includes("gateway") || normSpot.includes("colaba") || normSpot.includes("marine");
  const isMeghalayaSpot = 
    normSpot.includes("shillong") || 
    normSpot.includes("cherrapunji") || 
    normSpot.includes("sohra") || 
    normSpot.includes("rainbow") || 
    normSpot.includes("root") || 
    normSpot.includes("falls") || 
    normSpot.includes("canyon") || 
    normSpot.includes("arwah") || 
    normSpot.includes("museum") || 
    normSpot.includes("lake") ||
    normSpot.includes("ward") ||
    normSpot.includes("bosco") ||
    normSpot.includes("laitlum") ||
    normSpot.includes("elephant");

  const startName = isMeghalayaSpot 
    ? (startingFrom === "Central Railway Junction" ? "Shillong Center" : startingFrom)
    : (startingFrom || "Central Junction");
  const options: TransitOption[] = [];

  if (isJaipurSpot) {
    options.push({
      type: "BUS",
      title: "Jaipur City Bus (Route AC-1)",
      pickupPoint: `${startName} Bus Bay 3`,
      fare: "₹15 per passenger",
      timing: "Every 12 mins (6:00 AM - 10:00 PM)",
      guideSteps: [
        "Head to Bus Bay 3 inside the station depot.",
        "Purchase a paper ticket from the conductor upon boarding.",
        "Enjoy the scenic route passing Ajmeri Gate and Hawa Mahal.",
        "Alight at the Palace North Gate stop, then walk 2 mins."
      ]
    });

    options.push({
      type: "CAB",
      title: "Jaipur Shared E-TukTuk Cab",
      pickupPoint: `Pink City Shared Stand outside ${startName}`,
      fare: "₹25 per seat",
      timing: "Continuous Hailing (Runs when 4 board)",
      guideSteps: [
        "Exit the railway station and proceed to the E-TukTuk stand.",
        "Join the queue for the shared route toward Palace Gate.",
        "Wait 2-3 minutes for the vehicle to load 4 passengers.",
        "Cruises through historic Pink City lanes directly to the spot."
      ]
    });
  } else if (isAgraSpot) {
    options.push({
      type: "BUS",
      title: "Agra Heritage Electric Bus",
      pickupPoint: `${startName} Heritage Bus Lane`,
      fare: "₹20 per passenger",
      timing: "Every 10 mins (6:30 AM - 9:00 PM)",
      guideSteps: [
        "Locate the green electric bus shelter outside main terminal exit.",
        "Tap your card or pay cash at the digital ticket window.",
        "Ride the eco-friendly route via the Taj Protected Zone.",
        "Get down at the East Gate Transit Terminal, take free golf cart."
      ]
    });

    options.push({
      type: "CAB",
      title: "Agra Shared Heritage Cab",
      pickupPoint: `Heritage Taxi Stand opposite Exit Gate 1`,
      fare: "₹40 per seat",
      timing: "Continuous loading (Departs when full)",
      guideSteps: [
        "Walk to the government-approved Heritage Cab Booth opposite Gate 1.",
        "Request a seat on the Shared Shuttle Cab to the monument area.",
        "Departs within 5 mins as vehicles fill rapidly.",
        "Drops you off directly at the security check gate point."
      ]
    });
  } else if (isMumbaiSpot) {
    options.push({
      type: "BUS",
      title: "BEST Double-Decker (Route 124)",
      pickupPoint: `${startName} BEST Depot Gate A`,
      fare: "₹10 per passenger",
      timing: "Every 15 mins (5:30 AM - 11:30 PM)",
      guideSteps: [
        "Walk to BEST Depot Gate A and look for the red double-decker bus.",
        "Board and climb to the upper deck for the best city view.",
        "Conductor will issue your digital ticket onboard.",
        "Get down at the Chhatrapati Shivaji Museum stop and walk 3 mins."
      ]
    });

    options.push({
      type: "CAB",
      title: "Mumbai Shared Kaali-Peeli Cab",
      pickupPoint: `Kaali-Peeli Shared Taxi Bay outside ${startName}`,
      fare: "₹35 per seat",
      timing: "Immediate departure upon boarding",
      guideSteps: [
        "Head to the designated Kaali-Peeli taxi lane outside the terminal.",
        "Inform the marshal you want a shared seat to Gateway area.",
        "Board the taxi (runs on pre-fixed official shared rates).",
        "Enjoy a swift highway cruise, arriving directly at the waterfront."
      ]
    });
  } else if (isMeghalayaSpot) {
    options.push({
      type: "BUS",
      title: "MTC Government Bus Service",
      pickupPoint: "MTC Bus Stand, Police Bazar, Shillong",
      fare: "₹80 per passenger",
      timing: "Departs at 8:30 AM daily (Schedules may vary)",
      guideSteps: [
        "Head to the Meghalaya Transport Corporation (MTC) Bus Stand in Police Bazar, Shillong.",
        "Purchase your ticket at the government ticket counter.",
        "Enjoy the scenic 2-hour ride through the misty East Khasi Hills highway.",
        "Alight at the Cherrapunji (Sohra) Bus Stand in the main market area."
      ]
    });

    options.push({
      type: "CAB",
      title: "Shared Tata Sumo Shuttle",
      pickupPoint: "Bara Bazar Sumo Stand, Shillong",
      fare: "₹150 per seat",
      timing: "Continuous departures (7:00 AM - 5:00 PM as seats fill)",
      guideSteps: [
        "Head to the Cherrapunji Sumo Counter at Bara Bazar, Shillong.",
        "Request a seat on the next Sumo departing for Cherrapunji (Sohra).",
        "Wait a few minutes for all 10 passenger seats to be filled.",
        "Direct highway drop-off at the Cherrapunji Sumo Stand."
      ]
    });
  } else {
    // Generic fallback based on spotName
    options.push({
      type: "BUS",
      title: "Urban Transit City Bus",
      pickupPoint: `${startName} Bus Stop A`,
      fare: "₹12 per passenger",
      timing: "Every 15 mins (6:00 AM - 9:30 PM)",
      guideSteps: [
        "Walk to Bus Stop A in the main terminal circle.",
        "Board the bus heading in the direction of the sightseeing zone.",
        "Purchase ticket from the conductor or via the local transit app.",
        "De-board at the main entrance transit bay of the spot."
      ]
    });

    options.push({
      type: "CAB",
      title: "Local Shared Cab Express",
      pickupPoint: `Shared Cab Stand Bay B`,
      fare: "₹25 per seat",
      timing: "Runs continuously when filled",
      guideSteps: [
        "Head to Shared Cab Stand Bay B outside the station.",
        "State your destination to the dispatcher on duty.",
        "Wait for the cab to fill (usually less than 3 minutes).",
        "Direct point-to-point drop at the spot gates."
      ]
    });
  }

  return {
    spotName,
    startingFrom: startName,
    options
  };
}
