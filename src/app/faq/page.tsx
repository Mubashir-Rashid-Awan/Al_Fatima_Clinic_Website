import type { Metadata } from "next";
import { getClinicSettings } from "@/lib/data";
import { FaqAccordion } from "@/components/site/faq-accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about booking appointments, insurance, cancellations, and what to expect during your visit.",
};

export default async function FaqPage() {
  const settings = await getClinicSettings();

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer:
        "Use the Book Appointment button anywhere on the site. Choose a service and doctor, pick an available date and time, fill in your details, and you'll get instant confirmation plus a confirmation email.",
    },
    {
      question: "Do I need to create an account to book?",
      answer:
        "No account is required. You can book an appointment directly with just your name, email, and phone number.",
    },
    {
      question: "Can I reschedule or cancel my appointment?",
      answer: `Yes. Please call us at ${settings.phone} or email ${settings.email} as early as possible so we can offer the slot to another patient.`,
    },
    {
      question: "What should I bring to my first visit?",
      answer:
        "A valid ID, any previous medical records or test results relevant to your visit, and a list of any medications you are currently taking.",
    },
    {
      question: "Do you accept walk-ins?",
      answer:
        "We prioritize patients with confirmed appointments to keep wait times short, but walk-ins are accommodated when a slot is available. Booking online is the fastest way to guarantee a time.",
    },
    {
      question: "How will I know my appointment is confirmed?",
      answer:
        "You will see an on-screen confirmation immediately after booking, and a confirmation email will be sent to the address you provide.",
    },
    {
      question: "Is my personal information kept private?",
      answer:
        "Yes. Your details are stored securely and are only accessible to authorized clinic staff for the purpose of managing your care.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Can't find what you're looking for? Reach out on our Contact page.
        </p>
      </div>

      <div className="mt-12">
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}
