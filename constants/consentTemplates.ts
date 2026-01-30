/**
 * Predefined consent form templates for different treatment types
 * These templates can be loaded into the database or used as fallbacks
 */

export const ACUPUNCTURE_CONSENT = {
  name: 'acupuncture_consent',
  title: 'Acupuncture Consent Form',
  content: `Acupuncture Consent Form

Intended benefits of treatment 
•	Reduction of pain 
•	Alleviation of muscle spasm and tension
•	Facilitation of the healing process
•	Induction of local and general relaxation
•	Promotion of general well-being
•	Improvement of sleep pattern 

Possible adverse effects
The following are the known (based on research evidence) possible adverse effects associated with acupuncture, your Therapist will discuss these with you and explain if you are at any enhanced risk.
•	Bleeding and Bruising (3%)
•	Mild aggravation of symptoms (3%, of which 70-85% show subsequent improvement)
•	Mild Pain at the needle site (1%)
•	Drowsiness (1%)
•	Dizziness (0.6%)
•	Pain not at needle site (0.5%)
•	Nausea (0.3%)
•	Feeling faint (0.3%)
•	Stuck or bent needle (0.1%)
•	Headache (0.1%)
•	Allergy or infection (up to 0.2%)
•	Pneumothorax (0.0002%/ less than 2 per 1 million)
Although acupuncture in an established procedure, there may be other adverse effects that have not been recorded. If you experience any of the above or notice anything unusual about your health following your treatment, then you should contact your Therapist or GP straight away.

Consent
I understand that acupuncture involves the insertion of fine needles into the skin and may cause minor side effects such as bruising, bleeding, or temporary discomfort. I confirm that:
•	I have disclosed all relevant health information
•	I understand the nature of acupuncture treatment
•	I understand I can withdraw from the treatment at any time
•	I give my consent to receiving acupuncture
`,
version: '1.0',
};

export const MASSAGE_CONSENT = {
  name: 'massage_consent',
  title: 'Massage Consent Form',
  content: `Massage Treatment Consent Form

Purpose of Massage Therapy
Massage therapy is intended to promote relaxation, improve circulation, relieve muscular tension, and support overall well-being. It is not a substitute for medical treatment or diagnosis.

Consent to Treatment
•	I understand that massage therapy involves physical touch and manipulation of soft tissues.
•	I acknowledge that massage therapists do not diagnose illness, prescribe medication, or perform medical procedures.
•	I understand that I may stop the session at any time for any reason.
•	I agree to communicate immediately if I experience discomfort or pain during treatment.
•	I release the therapist and practice from liability for any unintentional injury, except in cases of negligence.

Privacy & Confidentiality
All personal and health information provided will be kept confidential and used only for treatment purposes, in accordance with applicable data protection laws.

Acknowledgment
By signing below, I confirm that:
•	I have read and understood the information above.
•	I confirm that I have disclosed all relevant health information to my therapist.
•	I understand my rights and responsibilities as a client.
•	I give my consent to receive massage therapy.`,
  version: '1.0',
};

export const HEALTH_CHECK_CONSENT = {
  name: 'health_check_consent',
  title: 'Massage Health Check Form',
  content: `Massage Health Check Form

[Content to be provided]

This is a placeholder for the Health Check Form. Please provide the specific text you would like to include for this consent form.`,
  version: '1.0',
};

export const ACUPUNCTURE_HEALTH_CHECK_CONSENT = {
  name: 'acupuncture_health_check_consent',
  title: 'Acupuncture Health Check Form',
  content: `Acupuncture Health Check Form

Medical History
Please tick or note if you have ever experienced the following:
- Heart conditions / pacemaker
- High or low blood pressure
- Circulatory problems (e.g., varicose veins, thrombosis)
- Diabetes
- Epilepsy or seizures
- Infectious diseases (e.g., hepatitis, HIV)
- Skin conditions or infections
- Pregnancy (current or recent)
- Allergies (please specify)
- Other medical conditions

Current Health
- Are you currently under medical care?
- Are you taking any prescribed medications?
  If yes, please list medications
- Do you have any recent injuries, fractures, or surgeries?
  If yes, please list injuries, fractures, or surgeries
- Do you have any areas of pain, stiffness, or restricted movement?
  If yes, please specify areas
- Do you have any concerns about receiving acupuncture therapy?

Lifestyle
- Do you smoke?
- Do you drink alcohol?
- Do you exercise regularly?

Consent
I understand that acupuncture involves the insertion of fine needles into the skin and may cause minor side effects such as bruising, bleeding, or temporary discomfort. I confirm that:
•	I have disclosed all relevant health information
•	I understand the nature of acupuncture treatment
•	I understand I can withdraw from the treatment at any time
•	I give my consent to receiving acupuncture`,
  version: '1.0',
};

export const GENERAL_MEDICAL_CONSENT = {
  name: 'general_medical_consent',
  title: 'General Medical Consent Form',
  content: `GENERAL MEDICAL CONSENT FORM

I, the undersigned, hereby give my informed consent for medical treatment and procedures as deemed necessary by the healthcare provider.

UNDERSTANDING OF TREATMENT
I understand that:
• The practice of medicine is not an exact science
• No guarantee has been made to me as to the outcome of the examination or treatment
• I have the right to ask questions about my treatment at any time
• I may refuse treatment or withdraw consent at any time

AUTHORIZATION FOR TREATMENT
I authorize the healthcare provider to perform such diagnostic procedures, medical treatments, and therapeutic procedures as may be deemed advisable for my care and well-being.

PRIVACY AND CONFIDENTIALITY
I understand that my medical information will be kept confidential in accordance with HIPAA regulations and applicable privacy laws. My information may be shared with:
• Healthcare providers involved in my care
• Insurance companies for billing purposes
• Other parties as required by law

I acknowledge that I have received the Notice of Privacy Practices and understand how my health information may be used and disclosed.

FINANCIAL RESPONSIBILITY
I understand that I am financially responsible for all charges whether or not they are covered by insurance. I agree to:
• Pay for services rendered
• Provide accurate insurance information
• Pay any deductibles, co-payments, or non-covered services
• Notify the clinic of any changes to my insurance coverage

MEDICAL INFORMATION
I confirm that I have provided complete and accurate information regarding:
• My medical history
• Current medications and supplements
• Known allergies
• Previous surgeries or hospitalizations
• Family medical history
• Current symptoms or concerns

RELEASE OF LIABILITY
I release the clinic, its staff, and healthcare providers from liability for any adverse outcomes that may occur despite reasonable care, except in cases of negligence or malpractice.

PATIENT ACKNOWLEDGMENT
By signing below, I acknowledge that:
• I have read and understood this consent form
• I have had the opportunity to ask questions
• All my questions have been answered to my satisfaction
• I voluntarily consent to treatment
• I am of legal age and mentally competent to provide consent (or am the legal guardian of the patient)

This consent remains in effect for all future visits unless revoked in writing.`,
  version: '1.0',
};

/**
 * Array of all available consent templates
 */
export const CONSENT_TEMPLATES = [
  ACUPUNCTURE_CONSENT,
  MASSAGE_CONSENT,
  HEALTH_CHECK_CONSENT,
  ACUPUNCTURE_HEALTH_CHECK_CONSENT,
];

/**
 * Template display names for UI
 */
export const TEMPLATE_DISPLAY_NAMES: Record<string, string> = {
  'acupuncture_consent': 'Acupuncture Consent Form',
  'massage_consent': 'Massage Consent Form',
  'health_check_consent': 'Massage Health Check Form',
  'acupuncture_health_check_consent': 'Acupuncture Health Check Form',
};
