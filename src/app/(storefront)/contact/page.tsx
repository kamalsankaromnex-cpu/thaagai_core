"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      subject: formData.get("subject")?.toString() || "",
      message: formData.get("message")?.toString() || "",
      website: formData.get("website")?.toString() || "", // Honeypot
    };

    if (!payload.name.trim() || payload.name.trim().length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      setSubmitting(false);
      return;
    }
    const cleanPhone = payload.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      setSubmitting(false);
      return;
    }
    if (!payload.subject.trim()) {
      setErrorMessage("Please select an inquiry topic.");
      setSubmitting(false);
      return;
    }
    if (!payload.message.trim() || payload.message.trim().length < 5) {
      setErrorMessage("Please enter a message of at least 5 characters.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit message. Please try again or WhatsApp us.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      form.reset();
    } catch {
      setErrorMessage("Network error. Please check your internet connection or reach out on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>WE ARE HERE FOR YOU</p>
            <h1>Contact Us</h1>
            <p>
              Have a question about an order or a custom design? We&apos;d love to hear from you.
            </p>
          </div>

          <div className={styles.heroImage}>
            <Image
              src="/images/contact-hero.png"
              alt="Thaagai traditional Indian clothing"
              fill
              priority
              sizes="(max-width: 700px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center 35%" }}
            />
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.formCard}>
            <h2>Send us a Message</h2>
            <p>Fill in your details and we&apos;ll get back to you.</p>

            {success ? (
              <div className={styles.alertSuccess} role="alert">
                <strong>Thank you! Message received with care.</strong>
                <p>Thank you for reaching out to Thaagai. Our team will review your inquiry and get back to you shortly.</p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className={styles.btnSecondary}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form action="/api/contact" method="POST" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className={styles.alertError} role="alert">
                    {errorMessage}
                  </div>
                )}

                {/* Spam Honeypot Field */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className={styles.honeypot}
                  aria-hidden="true"
                />

                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  disabled={submitting}
                />

                <label htmlFor="phone">Mobile Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  pattern="[6-9][0-9]{9}"
                  title="Enter a valid 10-digit Indian mobile number"
                  required
                  disabled={submitting}
                />

                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={submitting}
                />

                <label htmlFor="subject">Subject *</label>
                <select id="subject" name="subject" required defaultValue="" disabled={submitting}>
                  <option value="" disabled>Select a topic</option>
                  <option value="Order Enquiry">Order Enquiry</option>
                  <option value="Custom-Made">Custom-Made Enquiry</option>
                  <option value="Product Enquiry">Product Enquiry</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Returns">Returns or Exchange</option>
                  <option value="Other">Other</option>
                </select>

                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="How can we help you?"
                  required
                  disabled={submitting}
                />

                <button type="submit" disabled={submitting}>
                  {submitting ? "Sending Message..." : "Send Message →"}
                </button>
              </form>
            )}
          </div>

          <div className={styles.contactInfo}>
            <h2>Other Ways to Reach Us</h2>

            <div className={styles.contactGrid}>
              <article className={styles.contactCard}>
                <span className={styles.icon}>◉</span>
                <div>
                  <h3>WhatsApp Us</h3>
                  <p>Quick help with orders and custom designs.</p>
                  <a
                    href="https://wa.me/919876543210?text=Hello%20Thaagai%20team!%20I%20have%20an%20enquiry%20regarding%20your%20churidar%20collection."
                    target="_blank"
                    rel="noreferrer"
                  >
                    Chat on WhatsApp ↗
                  </a>
                </div>
              </article>

              <article className={styles.contactCard}>
                <span className={styles.icon}>☎</span>
                <div>
                  <h3>Call Us</h3>
                  <p>Speak with our boutique team.</p>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </div>
              </article>

              <article className={styles.contactCard}>
                <span className={styles.icon}>✉</span>
                <div>
                  <h3>Email Us</h3>
                  <p>For enquiries and customer support.</p>
                  <a href="mailto:care@thaagai.com">care@thaagai.com</a>
                </div>
              </article>

              <article className={styles.contactCard}>
                <span className={styles.icon}>◇</span>
                <div>
                  <h3>Order Support</h3>
                  <p>Need help with an existing order?</p>
                  <Link href="/account/orders">View Orders →</Link>
                </div>
              </article>
            </div>

            <div className={styles.store}>
              <h2>We&apos;re Here to Help</h2>
              <p>
                Questions about sizing, fabrics, stitching or custom designs? Contact us and we&apos;ll help you find the right outfit.
              </p>
              <p className={styles.note}>
                THAAGAI · Tradition in Every You
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
