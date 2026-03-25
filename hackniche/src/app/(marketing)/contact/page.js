"use client";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion-variants";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div style={{ paddingTop: 72 }}>
      <section
        style={{
          padding: "96px 32px 64px",
          background: "var(--color-bg-alt)",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>
            Contact
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "var(--color-text-h)",
              marginBottom: 16,
            }}
          >
            Let&apos;s talk about your venue
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "var(--color-text-muted)",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Get a personalized demo or ask us anything.
          </p>
        </motion.div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1000 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}
          >
            {/* Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                  marginBottom: 24,
                }}
              >
                Send us a message
              </h2>
              <form
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <input className="input" placeholder="First Name" />
                  <input className="input" placeholder="Last Name" />
                </div>
                <input
                  className="input"
                  placeholder="Email Address"
                  type="email"
                />
                <input
                  className="input"
                  placeholder="Phone Number"
                  type="tel"
                />
                <input className="input" placeholder="Venue Name" />
                <select className="select">
                  <option value="">Select a topic</option>
                  <option>Product Demo</option>
                  <option>Pricing Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
                <textarea
                  className="input"
                  placeholder="Your message..."
                  rows={5}
                  style={{ resize: "vertical" }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ alignSelf: "flex-start" }}
                >
                  <Send size={16} /> Send Message
                </button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                  marginBottom: 24,
                }}
              >
                Get in touch
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  marginBottom: 40,
                }}
              >
                <div
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--color-primary-ghost)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-h)",
                        marginBottom: 4,
                      }}
                    >
                      Email
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--color-text-muted)" }}
                    >
                      support@codinggurus.com
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--color-primary-ghost)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-h)",
                        marginBottom: 4,
                      }}
                    >
                      Phone
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--color-text-muted)" }}
                    >
                      +91-9000000000
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--color-primary-ghost)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-h)",
                        marginBottom: 4,
                      }}
                    >
                      Address
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--color-text-muted)" }}
                    >
                      Banjara Hills, Hyderabad
                      <br />
                      Telangana, India 500034
                    </div>
                  </div>
                </div>
              </div>

              {/* Card */}
              <div className="card" style={{ padding: 28 }}>
                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 8,
                  }}
                >
                  Schedule a Demo
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  See BanquetEase in action with a personalized walkthrough
                  tailored to your venue.
                </p>
                <button className="btn btn-outline btn-sm">Book a Call</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
