import { DocumentId, DocumentNode } from '../context/types';

export const REQUIREMENTS_GRAPH: Record<DocumentId, DocumentNode> = {
  // FOUNDATION DOCUMENTS
  psa_birth_cert: {
    id: 'psa_birth_cert',
    label: 'PSA Birth Certificate',
    agency: 'PSA',
    prerequisites: [],
    fees: '₱155 (CRS Outlet Walk-in) / ₱330 (Online via PSA Serbilis) / ₱365 (Online via PSA Helpline)',
    typicalDays: '1 working day (CRS Outlet) / 3–5 working days (Delivery - Metro Manila) / 4–9 working days (Provincial)',
    officeType: 'PSA CRS Outlet (Appointment required) or Online Portal',
    notes: 'Online ordering includes nationwide door-to-door delivery. Physical outlet walk-ins strictly require a free online appointment scheduled via appointment.psa.gov.ph beforehand. A digital "Viewable Online" copy is also available via PSA Serbilis for ₱130.',
    requirements: [
      'Valid Government-issued ID (Original & 1 Photocopy)',
      'Printed PSA Online Appointment Slip (if requesting walk-in at CRS Outlet)',
      'Duly accomplished yellow Application Form (for walk-ins)',
      'Authorization Letter and ID of parent/relative (if requesting for someone else)'
    ],
    detailedSteps: [
      'Option A (Walk-in via PSA CRS Outlet):',
      '1. Mag-book ng libreng appointment online sa appointment.psa.gov.ph at i-print ang appointment slip.',
      '2. Pumunta sa napiling PSA CRS Outlet sa itinakdang araw at oras ng iyong schedule.',
      '3. Kumuha at punan ang yellow Application Form sa loob ng outlet.',
      '4. Ipresenta ang form, valid ID, at appointment slip sa Verification Counter.',
      '5. Magbayad ng ₱155 sa cashier at siguraduhing itago ang opisyal na risibo.',
      '6. Maghintay sa releasing area hanggang tawagin ang pangalan para makuha ang printed certificate.',
      'Option B (Online Delivery - PSA Serbilis or PSA Helpline):',
      '1. Bisitahin ang psaserbilis.com.ph (₱330) o psahelpline.ph (₱365).',
      '2. Punan ang online request form ng kumpletong detalye ng kapanganakan at delivery address.',
      '3. Magbayad ng kaukulang fee gamit ang GCash, Maya, credit card, o over-the-counter payments.',
      '4. Maghintay ng 3-5 working days (Metro Manila) o 4-9 working days (Provincial) para sa ligtas na home delivery.'
    ]
  },
  barangay_cert: {
    id: 'barangay_cert',
    label: 'Barangay Certificate / Cedula',
    agency: 'BARANGAY',
    prerequisites: [],
    fees: '₱50–₱150 (Clearance) / ₱20–₱100 (Cedula base + income tax)',
    typicalDays: 'Same day (usually within 15–30 minutes)',
    officeType: 'Local Barangay Hall (or LGU E-Services portal)',
    notes: 'Community Tax Certificate (Cedula) fee depends on your annual income (₱1 per ₱1,000 declared). Select progressive LGUs (e.g., Quezon City, Manila) allow requesting Barangay Clearance online via their central e-services portal.',
    requirements: [
      'Proof of residency (Billing statement, lease contract, or home-owner endorsement)',
      'Anumang valid government-issued ID (or Barangay ID)',
      'Sapat na bayad para sa Cedula at Clearance'
    ],
    detailedSteps: [
      '1. Pumunta sa Barangay Hall na may sakop sa iyong tinitirhan (o mag-apply sa LGU E-services portal kung mayroon).',
      '2. Humingi ng Application Form para sa Barangay Clearance at Cedula.',
      '3. Isumite ang form kasama ang proof of residency sa assessment desk.',
      '4. Kalkulahin at bayaran ang Cedula base sa iyong declared income, pagkatapos ay pirmahan at lagyan ng thumbmark ang Cedula.',
      '5. Magbayad ng kaukulang clearance fee sa barangay cashier at kunin ang printed Barangay Certificate na may opisyal na pirma ng Barangay Captain.'
    ]
  },
  lto_medical_cert: {
    id: 'lto_medical_cert',
    label: 'LTO-Accredited Medical Certificate',
    agency: 'LTO',
    prerequisites: [],
    fees: '₱300–₱500 (standard clinic fee)',
    typicalDays: 'Same day (within 30 minutes)',
    officeType: 'LTO-Accredited Medical Clinic',
    notes: 'The medical certificate must be electronically transmitted by the clinic to the LTO Land Transportation Management System (LTMS). The physical printed copy is also given to you for physical submission.',
    requirements: [
      'LTO Client ID (from your LTMS account registration at portal.lto.gov.ph)',
      'Original physical Valid ID',
      'Sapat na bayad para sa clinic fee'
    ],
    detailedSteps: [
      '1. Pumunta sa alinmang LTO-accredited clinic (karaniwang katabi lang ng mga LTO branch).',
      '2. Ibigay ang iyong LTO Client ID o personal na detalye sa reception desk.',
      '3. Isailalim sa pagsusuri ng doktor (paningin/vision test, color-blindness check, presyon ng dugo, timbang, at taas).',
      '4. Siguraduhing i-encode at ipadala ng clinic ang iyong medical certificate nang elektroniko sa iyong LTMS profile.',
      '5. Kunin ang printed physical copy ng medical certificate at ang risibo nito.'
    ]
  },

  // PRIMARY IDS
  voters_id: {
    id: 'voters_id',
    label: "Voter's Certification (COMELEC)",
    agency: 'COMELEC',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: '₱75 (Free for Senior Citizens, PWDs, and Indigent citizens)',
    typicalDays: 'Same day (usually within 30–60 minutes)',
    officeType: 'COMELEC Office of the Election Officer (OEO)',
    notes: "COMELEC has permanently suspended the printing of physical plastic Voter's ID cards. The Voter's Certification is issued in its place and is fully accepted by all government agencies and banks as a valid primary ID. Request indigent fee waiver with a Barangay Certificate of Indigency.",
    requirements: [
      'Original and photocopy of PSA Birth Certificate',
      'Original Barangay Certificate or Cedula',
      'One (1) valid photo-bearing government ID',
      'Barangay Certificate of Indigency (kung hihingi ng fee waiver)'
    ],
    detailedSteps: [
      '1. Bisitahin ang COMELEC Office of the Election Officer (OEO) sa munisipyo o lungsod kung saan ka nakarehistro.',
      '2. Ipa-check ang iyong voter record sa active registration database sa verification desk.',
      '3. Punan ang Voter\'s Certification Request Form.',
      '4. Ipresenta ang iyong valid ID at PSA Birth Certificate para sa validation.',
      '5. Magbayad ng ₱75 sa COMELEC cashier (o ipakita ang ID/Indigency Cert para sa waiver) at kunin ang iyong authenticated Voter\'s Certification.'
    ]
  },
  philsys_id: {
    id: 'philsys_id',
    label: 'PhilSys National ID',
    agency: 'PHILSYS',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free (Initial registration and delivery)',
    typicalDays: '30–90 working days for delivery (ePhilID paper version is same day)',
    officeType: 'PhilSys Registration Center or Mall Satellite Office',
    notes: 'The National ID system includes three formats: the physical plastic card, the printable ePhilID, and the Digital National ID available via national-id.gov.ph. Registration is 100% free under RA 11055. You can track delivery status on the PHLPost website.',
    requirements: [
      'Original PSA Birth Certificate',
      'Barangay Certificate or Cedula',
      'One (1) supporting photo-bearing valid ID',
      'Personal appearance for biometrics capture'
    ],
    detailedSteps: [
      '1. Pumunta sa pinakamalapit na permanent o temporary PhilSys Registration Center (matatagpuan sa mga mall, barangay hall, o PSA offices).',
      '2. Isumite ang orihinal na requirements (PSA Birth Certificate at Barangay Certificate) para sa profiling at screening.',
      '3. Isagawa ang biometrics capture: pagkuha ng mukha, fingerprints ng sampung daliri, at high-precision iris scan.',
      '4. I-verify ang lahat ng impormasyon sa screen ng encoder bago magbigay ng digital signature.',
      '5. Kunin ang iyong Transaction Slip (may transaction number). I-keep ito para magamit sa pag-track ng physical card sa delivery.phlpost.gov.ph o pag-download ng ePhilID.'
    ]
  },
  passport_regular: {
    id: 'passport_regular',
    label: 'Philippine Passport (Regular)',
    agency: 'DFA',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: '₱950 (Regular - 12 working days) / ₱1,200 (Expedited - 6 working days) + ₱50 Convenience Fee',
    typicalDays: '6–12 working days + delivery time (2–3 working days)',
    officeType: 'DFA Consular Office (Booking required via passport.gov.ph)',
    notes: 'Walk-in applications are strictly prohibited (except for Courtesy Lane: seniors, PWDs, pregnant women, infants). You must complete online booking and prepayment first. The entire application packet must be printed on A4-sized paper.',
    requirements: [
      'Printed DFA Passport Appointment Packet on A4 paper (Application Form, E-Receipt, Checklist)',
      'Original and photocopy of PSA Birth Certificate',
      'Original and photocopy of Voter\'s Certification or PhilSys National ID',
      'Official receipt from the online payment center'
    ],
    detailedSteps: [
      '1. Mag-book ng appointment online sa passport.gov.ph sa iyong napiling DFA Consular Office.',
      '2. Punan ang application form nang may katumpakan at piliin ang processing type (Regular o Expedited).',
      '3. Magbayad ng kaukulang fee (₱950 o ₱1,200 + ₱50 convenience fee) online gamit ang GCash, Maya, credit card, o accredited centers.',
      '4. I-print ang kumpirmadong application form, e-receipt, at checklist sa A4 bond paper.',
      '5. Pumunta sa DFA branch sa araw at eksaktong oras ng iyong appointment (huwag ma-late).',
      '6. Ipakita ang mga orihinal na dokumento sa evaluator counter para sa screening.',
      '7. Sumailalim sa biometric processing (pagkuha ng litrato ng mukha, fingerprints, at digital na pirma).',
      '8. Magbayad sa courier section sa loob ng DFA kung nais mong i-deliver ang passport sa iyong bahay, o pumili para sa personal pickup.'
    ]
  },
  nbi_clearance: {
    id: 'nbi_clearance',
    label: 'NBI Clearance',
    agency: 'NBI',
    prerequisites: ['voters_id'],
    fees: '₱155 total (₱130 clearance fee + ₱25 online payment service fee)',
    typicalDays: 'Same day (no hit) / 5–15 working days (with hit)',
    officeType: 'NBI Clearance Center / Branch (Mandatory online booking & prepayment)',
    notes: 'NBI branches do not accept direct over-the-counter payments anymore. You must schedule and pay online via clearance.nbi.gov.ph before visiting. Under the First-Time Jobseekers Assistance Act (RA 11261), the fee is 100% free if you have a Barangay First-Time Jobseeker Certificate. A "hit" occurs when someone with a similar name has a pending record, requiring a 5-15 day verification period.',
    requirements: [
      'NBI Online Reference Number (from your scheduled portal account)',
      'Two (2) Valid Government-issued IDs (Original & Photocopy)',
      'Official proof of payment (GCash receipt, bank confirmation, etc.)',
      'Barangay Certification for First-Time Jobseekers (kung libre)'
    ],
    detailedSteps: [
      '1. Magrehistro ng account sa clearance.nbi.gov.ph at punan ang iyong personal profile.',
      '2. Pindot sa Apply for Clearance at piliin ang preferred mong NBI branch, petsa, at oras.',
      '3. Magbayad ng ₱155 online gamit ang GCash, Maya, o over-the-counter channels bago ang iyong iskedyul.',
      '4. I-save o i-print ang generated NBI Online Reference Number at proof of payment.',
      '5. Pumunta sa NBI branch sa takdang oras. Ipresenta ang dalawang valid IDs at reference number.',
      '6. Isagawa ang biometric capture (litrato ng mukha, fingerprints, at digital signature) sa database terminal.',
      '7. Maghintay sa Releasing section. Kung walang "hit," makukuha mo agad ang printed NBI Clearance. Kung may "hit," bumalik pagkatapos ng 5-15 working days para sa clearing at release.'
    ]
  },

  // LICENSES
  lto_student_permit: {
    id: 'lto_student_permit',
    label: 'LTO Student Permit',
    agency: 'LTO',
    prerequisites: ['psa_birth_cert', 'lto_medical_cert'],
    fees: '₱317.63 (LTO fee) + ₱500–₱1,500 (Theoretical Driving Course)',
    typicalDays: 'Same day (within 2–4 hours)',
    officeType: 'LTO Licensing Center / District Office',
    notes: 'You must complete a mandatory 15-hour Theoretical Driving Course (TDC) from an LTO-accredited driving school. The school will electronically transmit your TDC certificate to LTO, but keep a printed copy. The LTO Medical Certificate must also be electronically transmitted. Register an account at portal.lto.gov.ph beforehand.',
    requirements: [
      'Mandatory 15-hour Theoretical Driving Course (TDC) Certificate',
      'LTO-Accredited Medical Certificate (transmitted electronically)',
      'Original and photocopy of PSA Birth Certificate',
      'Printed LTO Client ID from portal.lto.gov.ph',
      'Parental Consent and Valid ID of parent (if minor applicant, 16-17 years old)'
    ],
    detailedSteps: [
      '1. Magrehistro ng account sa LTO LTMS portal (portal.lto.gov.ph) at i-save ang iyong LTO Client ID.',
      '2. Kumpletuhin ang mandatory 15-hour TDC sa driving school at kumuha ng electronically transmitted certificate.',
      '3. Kumuha ng medical certificate mula sa LTO-accredited clinic na awtomatikong mag-a-upload nito sa LTMS.',
      '4. Bisitahin ang pinakamalapit na LTO Licensing Center o District Office.',
      '5. Isumite the TDC Certificate, Medical Certificate, PSA Birth Certificate, at LTMS Client ID sa evaluation window.',
      '6. Pumunta sa biometrics capture section para sa pagkuha ng mukha, fingerprints, at lagda.',
      '7. Magbayad ng ₱317.63 sa cashier at tanggapin ang iyong printed Student Permit card or paper.'
    ]
  },
  lto_nonpro_license: {
    id: 'lto_nonpro_license',
    label: 'LTO Non-Professional Driver\'s License',
    agency: 'LTO',
    prerequisites: ['lto_student_permit', 'lto_medical_cert'],
    fees: '₱685 (LTO transaction fee) + ₱1,500–₱4,000 (Practical Driving Course)',
    typicalDays: 'Same day (usually takes 3–5 hours)',
    officeType: 'LTO Licensing Center or District Office',
    notes: 'You must have held your Student Permit for at least thirty (30) days and it must be active. You must complete a mandatory Practical Driving Course (PDC) of at least 8 hours for your desired vehicle category. You must pass both the computerized LTMS written exam and the actual practical driving test.',
    requirements: [
      'Active LTO Student Permit (must be held for at least 30 days)',
      'LTO-Accredited Medical Certificate (transmitted electronically)',
      'Mandatory Practical Driving Course (PDC) Certificate (minimum 8 hours)',
      'LTO LTMS portal account credentials',
      'Own vehicle for practical exam or cash for vehicle rental on-site'
    ],
    detailedSteps: [
      '1. Kumpletuhin ang mandatory Practical Driving Course (PDC) sa accredited driving school at kunin ang digital/printed certificate.',
      '2. Kumuha ng panibagong medical certificate sa LTO-accredited clinic (na may 15-day validity).',
      '3. Pumunta sa LTO Licensing Center. Isumite ang Student Permit, Medical Cert, at PDC Certificate sa evaluator.',
      '4. Mag-login sa LTMS kiosk terminal at kunin ang computerized LTO Written Exam. Kailangang makakuha ng passing rate.',
      '5. Magpatuloy sa LTO test track para sa actual practical driving test gamit ang iyong sasakyan o pag-upa doon.',
      '6. Matapos pumasa sa practical exam, magbayad ng ₱685 sa cashier.',
      '7. Sumailalim sa biometrics check at kunin ang iyong physical Non-Professional Driver\'s License card (valid for 5 or 10 years).'
    ]
  },

  // PROFESSIONAL / EMPLOYMENT
  official_tor: {
    id: 'official_tor',
    label: 'Official Transcript of Records',
    agency: 'SCHOOL',
    prerequisites: ['psa_birth_cert'],
    fees: 'Varies by school (₱50–₱250 per page / ₱200–₱1,000 package fee)',
    typicalDays: '3–10 working days',
    officeType: 'University or College Registrar\'s Office',
    notes: 'Issued exclusively by your alma mater\'s registrar. Note that school clearances are required, meaning you must not have outstanding financial, library, or document obligations to your school.',
    requirements: [
      'School Registrar Request Form',
      'Fully signed School Clearance Form (no library, financial, or academic liabilities)',
      'Two (2) valid government-issued IDs',
      'Recent passport size photos with white background (some schools require)'
    ],
    detailedSteps: [
      '1. Pumunta sa Registrar\'s Office ng iyong huling pinasukang paaralan o unibersidad.',
      '2. Humingi ng Transcript of Records (TOR) Request Form at punan ang hinihinging impormasyon.',
      '3. Kumuha ng Clearance Form at ipapirma ito sa library, accounting, at academic departments upang patunayang wala kang utang o liabilities.',
      '4. Isumite ang clearance at application form sa registrar window.',
      '5. Magbayad sa cashier ng paaralan ayon sa presyo ng bawat pahina o set.',
      '6. Bumalik sa itinakdang araw (pagkatapos ng 3-10 working days) para kunin ang opisyal, selyado, at pirmadong TOR.'
    ]
  },
  prc_board_app: {
    id: 'prc_board_app',
    label: 'PRC Licensure Exam Application',
    agency: 'PRC',
    prerequisites: ['psa_birth_cert', 'official_tor', 'nbi_clearance'],
    fees: '₱900 (Baccalaureate/Board Exam) / ₱600 (Non-Baccalaureate) / ₱450 (Removal exam)',
    typicalDays: 'Varies by exam schedules (Processing is same-day upon appointment)',
    officeType: 'PRC Regional Office or Mall Service Center',
    notes: 'All applications must be lodged online via the PRC LERIS portal (online.prc.gov.ph). Keep your profile updated and upload a high-quality 2x2 picture with a white background and wearing a collared shirt. Your TOR must specifically state "For Board Exam Purposes" with the school dry seal.',
    requirements: [
      'Official Transcript of Records (TOR) with dry seal and stamp "For Board Exam Purposes"',
      'Original and photocopy of PSA Birth Certificate',
      'Original and photocopy of NBI Clearance (active)',
      'Printed PRC LERIS Application Form and online payment receipt',
      'Four (4) pieces passport-size photos with white background and name tag'
    ],
    detailedSteps: [
      '1. Magrehistro o mag-login sa PRC LERIS portal sa online.prc.gov.ph at kumpletuhin ang iyong profile.',
      '2. Pumuli ng "Transaction: Examination" at piliin ang iyong licensure board exam type at preferred PRC schedule/location.',
      '3. Magbayad ng kaukulang exam fee (₱900 o ₱600) online gamit ang GCash, Maya, credit card, o LandBank.',
      '4. I-download at i-print ang generated PRC Application Form kasama ang payment receipt.',
      '5. Pumunta sa napiling PRC branch sa araw at oras ng iyong online appointment.',
      '6. Isumite ang printed form, TOR, PSA Birth Certificate, at NBI Clearance sa evaluator counter.',
      '7. Kunin ang iyong Notice of Admission (NOA) na iyong opisyal na slip upang makapasok sa testing center.'
    ]
  },
  sss_id: {
    id: 'sss_id',
    label: 'MySSS Card (formerly UMID)',
    agency: 'SSS',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: 'Free (Initial issuance) / ₱200 (Replacement fee due to loss/damage)',
    typicalDays: '15–20 working days for delivery (RCBC ATM Card is instant virtual)',
    officeType: 'SSS Branch with Biometric Facility & Online My.SSS',
    notes: 'Standard generic physical UMID card printing is suspended. SSS now issues the MySSS Card (EMV-equipped ID and ATM pay/disbursement card co-branded with RCBC or UnionBank). Verification is fully integrated with PhilSys National ID eVerify. Members must have an active My.SSS account at member.sss.gov.ph and complete online facial authentication beforehand.',
    requirements: [
      'Original and photocopy of PSA Birth Certificate',
      'Original Voter\'s Certification, PhilSys National ID, or valid passport',
      'My.SSS member portal account credentials',
      'Selfie and biometric verification on SSS portal'
    ],
    detailedSteps: [
      '1. Mag-login sa iyong My.SSS Member Portal at pumunta sa "Services" tapos piliin ang "Apply for MySSS Card".',
      '2. Basahin ang mga kondisyon at sumailalim sa digital facial scanning at National ID eVerify integration.',
      '3. Piliin ang iyong preferred partner bank (RCBC DiskarTech o UnionBank) at ibigay ang pahintulot na ibahagi ang iyong impormasyon.',
      '4. Punan ang online bank account opening forms sa pamamagitan ng portal o ng app ng bangko (tulad ng DiskarTech).',
      '5. Kumpirmahin ang details at i-print ang generated transaction receipt/barcode.',
      '6. Pumunta sa pinakamalapit na SSS branch na may biometric terminal kung kinakailangan ng karagdagang fingerprint at iris capture.',
      '7. Maghintay ng SMS o email notification kapag handa na ang card. Ang MySSS Card ay ipapadala ng bangko sa iyong tirahan o kukunin sa branch.'
    ]
  },
  gsis_ecard: {
    id: 'gsis_ecard',
    label: 'GSIS eCard',
    agency: 'GSIS',
    prerequisites: ['psa_birth_cert'],
    fees: 'Free (For active government employees)',
    typicalDays: '5–10 working days',
    officeType: 'GSIS Regional Branch or Agency Liaison Officer',
    notes: 'Serves as both the official GSIS ID card and the ATM pension/disbursement card (partnered with LandBank or UnionBank) for government workers. You must be registered in the GSIS database by your employer\'s HR department beforehand.',
    requirements: [
      'GSIS Member Information Sheet (MIS) duly accomplished',
      'Agency HR endorsement and Certification of Employment',
      'Two (2) valid government-issued IDs (Original & Photocopy)'
    ],
    detailedSteps: [
      '1. Siguraduhing na-upload at na-activate na ng iyong Agency HR ang iyong record sa GSIS database.',
      '2. Pumunta sa pinakamalapit na GSIS Branch Office.',
      '3. Kumuha at punan ang Member Information Sheet (MIS) sa assistance counter.',
      '4. Isumite ang MIS kasama ang HR Endorsement at valid IDs sa GSIS enrollment counter.',
      '5. Magpakuha ng mukha, fingerprints, at lagda sa biometric capture terminal.',
      '6. Maghintay habang ginagawa ang card at tanggapin ang iyong printed GSIS eCard at ang PIN mailer envelope.'
    ]
  },
  bir_tin: {
    id: 'bir_tin',
    label: 'BIR Tax Identification Number (TIN) Card',
    agency: 'BIR',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free (TIN generation and initial card) / ₱100 (Replacement for lost card)',
    typicalDays: 'Same day (usually within 1–2 hours)',
    officeType: 'BIR Revenue District Office (RDO) or Online via ORUS Portal',
    notes: 'You can now register for a TIN and download a digital TIN ID 100% online using the BIR ORUS (Online Registration and Update System) portal at orus.bir.gov.ph. Issuance of TIN and the digital/physical card is entirely free. Beware of online fixers charging fees.',
    requirements: [
      'Original and photocopy of PSA Birth Certificate',
      'Original Barangay Certificate or Cedula',
      'Duly accomplished BIR Form 1904 (if walk-in)',
      'Active email address (for ORUS online portal registration)'
    ],
    detailedSteps: [
      'Option A (Online Registration via ORUS Portal):',
      '1. Bisitahin ang orus.bir.gov.ph at gumawa ng taxpayer account gamit ang iyong email.',
      '2. Punan ang online registration forms at i-upload ang digital copy ng iyong PSA Birth Certificate.',
      '3. Maghintay ng verification at matapos ma-approve, ma-ge-generate ang iyong Taxpayer Identification Number (TIN).',
      '4. I-download at i-print ang iyong Digital TIN ID na may lagda at QR code.',
      'Option B (Walk-in via RDO):',
      '1. Alamin ang tamang BIR Revenue District Office (RDO) na may sakop sa iyong tirahan.',
      '2. Pumunta sa RDO at humingi ng BIR Form 1904.',
      '3. Punan ang form at isumite sa Registration window kasama ang iyong PSA Birth Certificate at Barangay Certificate.',
      '4. Maghintay sa processing counter habang ginagawa ang iyong TIN sa database.',
      '5. Kunin ang printed physical TIN Card mula sa releasing officer sa loob ng araw na iyon.'
    ]
  },
  philhealth_id: {
    id: 'philhealth_id',
    label: 'PhilHealth Member ID Card',
    agency: 'PHILHEALTH',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: 'Free (Registration and paper card) / Premium contribution depends on income',
    typicalDays: 'Same day (usually within 30–60 minutes)',
    officeType: 'PhilHealth Local Health Insurance Office (LHIO) or Online Portal',
    notes: 'Registration and card printing are free. Self-employed or voluntary members must pay the minimum monthly premium contribution (starting at ₱500 per month or based on declared salary bracket) at the cashier to activate benefits. Online registration is available via memberinquiry.philhealth.gov.ph.',
    requirements: [
      'Two (2) copies of PhilHealth Member Registration Form (PMRF) duly filled out',
      'Original and photocopy of PSA Birth Certificate',
      'One (1) valid government-issued ID',
      'Premium contribution payment (para sa voluntary members)'
    ],
    detailedSteps: [
      '1. Pumunta sa pinakamalapit na PhilHealth Local Health Insurance Office (LHIO).',
      '2. Punan ang PhilHealth Member Registration Form (PMRF) ng kumpleto at tamang detalye.',
      '3. Isumite ang PMRF at photocopy ng iyong PSA Birth Certificate sa receiving clerk.',
      '4. Kung ikaw ay voluntary o self-employed member, bayaran ang unang buwan o quarter ng premium contribution sa cashier window.',
      '5. Maghintay habang ipinapasok ang iyong data sa PhilHealth system.',
      '6. Kunin ang iyong printed PhilHealth ID card na may kasamang PhilHealth Identification Number (PIN).'
    ]
  },
  pagibig_loyalty: {
    id: 'pagibig_loyalty',
    label: 'Pag-IBIG Loyalty Card Plus',
    agency: 'PAGIBIG',
    prerequisites: ['psa_birth_cert', 'voters_id'],
    fees: '₱125 (cash paid directly to bank partner inside branch)',
    typicalDays: 'Same day (printed on-site)',
    officeType: 'Pag-IBIG Member Services Branch',
    notes: 'To apply for the Loyalty Card Plus (co-branded with UnionBank or AUB), you must have an active Pag-IBIG MID (Membership ID) number and at least one (1) posted monthly contribution. The card serves as a government ID and a cash card for loans and benefits.',
    requirements: [
      'Duly accomplished Pag-IBIG Loyalty Card Plus Application Form',
      'One (1) active primary government-issued ID (e.g., Voter\'s Cert, PhilSys ID, Passport)',
      'Active Pag-IBIG MID number',
      '₱125 payment fee'
    ],
    detailedSteps: [
      '1. I-download at punan ang Loyalty Card Plus Application Form mula sa pagibigfund.gov.ph o kumuha nito sa branch.',
      '2. Bisitahin ang pinakamalapit na Pag-IBIG Member Services Branch.',
      '3. Isumite ang form sa evaluation officer upang ma-verify ang iyong MID status at contributions.',
      '4. Magbayad ng ₱125 sa kinatawan ng partner bank (UnionBank o AUB) na nakaupo sa loob ng Pag-IBIG branch.',
      '5. Magpakuha ng litrato, fingerprints, at pirma sa biometrics capturing terminal.',
      '6. Maghintay ng ilang minuto habang inililimbag ang iyong card. Kunin ang physical card kasama ang bank PIN mailer.'
    ]
  },
  postal_id: {
    id: 'postal_id',
    label: 'PHLPost Postal ID',
    agency: 'PHLPOST',
    prerequisites: ['psa_birth_cert', 'barangay_cert'],
    fees: '₱550 (Regular Processing) / ₱650 (Rush Processing) inclusive of home delivery and VAT',
    typicalDays: '15–30 working days (Regular delivery) / 1–3 working days (Rush delivery)',
    officeType: 'PHLPost Post Office / Processing Center',
    notes: 'Excellent Update: Regular and rush applications for the Improved Postal ID have fully resumed nationwide as of March 2026. The Improved Postal ID is valid for three (3) years for Filipinos. Rush applications are processed within 1-3 working days in specific central branches (like Manila Central or regional hubs) with card delivery.',
    requirements: [
      'Two (2) copies of duly accomplished Postal ID Application Form',
      'Original and photocopy of PSA Birth Certificate',
      'Original and photocopy of Barangay Certificate or Cedula (Proof of Address)',
      '₱550 or ₱650 fee'
    ],
    detailedSteps: [
      '1. Bisitahin ang pinakamalapit na Post Office ng PHLPost (o regular na branch).',
      '2. Humingi ng dalawang kopya ng Postal ID Application Form at punan ang mga ito.',
      '3. Ipresenta ang iyong PSA Birth Certificate (Proof of Identity) at Barangay Certificate (Proof of Address) sa assessor.',
      '4. Bayaran ang fee sa cashier: ₱550 para sa regular processing o ₱650 para sa rush processing.',
      '5. Sumailalim sa biometrics capture (litrato ng mukha, fingerprints, at digital signature) sa capturing booth.',
      '6. Maghintay para sa delivery ng iyong secure Improved Postal ID card sa pamamagitan ng PHLPost courier sa iyong bahay (15-30 araw para sa regular, 1-3 araw para sa rush).'
    ]
  }
};

export const DOCUMENT_CATEGORIES: Record<string, DocumentId[]> = {
  'Foundation Documents': ['psa_birth_cert', 'barangay_cert', 'lto_medical_cert'],
  'Primary IDs': [
    'voters_id',
    'philsys_id',
    'passport_regular',
    'nbi_clearance',
    'postal_id',
    'bir_tin',
  ],
  'Licenses': ['lto_student_permit', 'lto_nonpro_license'],
  'Professional / Employment': [
    'official_tor',
    'prc_board_app',
    'sss_id',
    'gsis_ecard',
    'philhealth_id',
    'pagibig_loyalty',
  ],
};

export function validateGraph(graph: Record<DocumentId, DocumentNode>): void {
  const missingPrerequisites: string[] = [];
  for (const node of Object.values(graph)) {
    for (const prereqId of node.prerequisites) {
      if (!graph[prereqId]) {
        missingPrerequisites.push(prereqId);
      }
    }
  }
  if (missingPrerequisites.length > 0) {
    throw new Error(
      `Cycle or validation error: Prerequisite(s) not found in graph: ${missingPrerequisites.join(
        ', '
      )}`
    );
  }
}

// Run validation at module load time
validateGraph(REQUIREMENTS_GRAPH);
