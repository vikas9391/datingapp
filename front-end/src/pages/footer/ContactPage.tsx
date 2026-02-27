import React, { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { Mail, MapPin, MessageSquare, Send, Loader2 } from "lucide-react";

const SUBJECTS = [
  "General Inquiry",
  "Bug Report",
  "Account Issue",
  "Premium / Billing",
  "Safety Concern",
  "Feature Request",
  "Press / Media",
  "Other",
];

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex flex-col">
      <TopBar />

      <div className="flex-1 max-w-6xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Contact Info */}
        <div className="space-y-8 md:space-y-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Get in touch</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Have a question about the app? Running into a bug? Or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-teal-600 border border-gray-100">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Email Us</h3>
                <p className="text-gray-500">support@thedatingapp.com</p>
                <p className="text-gray-500">press@thedatingapp.com</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-teal-600 border border-gray-100">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Visit Us</h3>
                <p className="text-gray-500">The Dating App HQ</p>
                <p className="text-gray-500">Mindspace IT Park, Hitech City</p>
                <p className="text-gray-500">Hyderabad, Telangana 500081</p>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
            <p className="text-sm text-teal-700 font-medium">
              ⏱ We typically respond within <strong>24 hours</strong> on business days.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
          {submitted ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500">We'll get back to you within 24 hours.</p>
              <button
                onClick={handleReset}
                className="mt-8 text-teal-600 font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;