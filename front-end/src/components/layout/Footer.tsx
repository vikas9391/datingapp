import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

interface FooterLink {
  id: number;
  title: string;
  url: string;
  link_type: "internal" | "external";
  open_new_tab: boolean;
}

interface FooterSection {
  id: number;
  title: string;
  links: FooterLink[];
}

interface FooterSettings {
  copyright_text: string;
  tagline: string;
  show_copyright: boolean;
  show_tagline: boolean;
}

interface FooterData {
  sections: FooterSection[];
  settings: FooterSettings;
}

const footerStyle = {
  background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
  border: "1px solid rgba(249,115,22,0.18)",
  boxShadow: "0 -4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(249,115,22,0.1)",
};

const SectionLinks = ({ sections }: { sections: FooterSection[] }) => (
  <div
    className={`grid grid-cols-2 md:grid-cols-${Math.min(sections.length, 4)} gap-8 mb-12`}
  >
    {sections.map((section) => (
      <div key={section.id}>
        <h4
          className="font-black mb-4 text-sm md:text-base uppercase tracking-widest"
          style={{ color: "#fb923c" }}
        >
          {section.title}
        </h4>
        <ul className="space-y-2.5 text-xs md:text-sm">
          {section.links.map((link) => (
            <li key={link.id}>
              {link.link_type === "internal" ? (
                <Link
                  to={link.url}
                  className="transition-colors duration-200"
                  style={{ color: "#8a6540" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#f0e8de")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#8a6540")
                  }
                >
                  {link.title}
                </Link>
              ) : (
                <a
                  href={link.url}
                  target={link.open_new_tab ? "_blank" : undefined}
                  rel={link.open_new_tab ? "noreferrer" : undefined}
                  className="transition-colors duration-200"
                  style={{ color: "#8a6540" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#f0e8de")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#8a6540")
                  }
                >
                  {link.title}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const DefaultSections = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
    {[
      {
        title: "Company",
        links: [
          { label: "About Us", to: "/about" },
          { label: "Careers", to: "/careers" },
          { label: "Press", to: "/press" },
          { label: "Blog", to: "/blog" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", to: "/help" },
          { label: "Safety Center", to: "/safety" },
          { label: "Guidelines", to: "/guidelines" },
          { label: "Contact Us", to: "/contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", to: "/privacy" },
          { label: "Terms of Service", to: "/terms" },
          { label: "Cookie Policy", to: "/cookies" },
          { label: "Intellectual Property", to: "/ip" },
        ],
      },
      {
        title: "Social",
        links: [
          { label: "Instagram", to: "https://instagram.com", external: true },
          { label: "Twitter / X", to: "https://twitter.com", external: true },
          { label: "Facebook", to: "https://facebook.com", external: true },
          { label: "TikTok", to: "https://tiktok.com", external: true },
        ],
      },
    ].map((section) => (
      <div key={section.title}>
        <h4
          className="font-black mb-4 text-sm md:text-base uppercase tracking-widest"
          style={{ color: "#fb923c" }}
        >
          {section.title}
        </h4>
        <ul className="space-y-2.5 text-xs md:text-sm">
          {section.links.map((link) => (
            <li key={link.label}>
              {(link as any).external ? (
                <a
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-200"
                  style={{ color: "#8a6540" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#f0e8de")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#8a6540")
                  }
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.to}
                  className="transition-colors duration-200"
                  style={{ color: "#8a6540" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#f0e8de")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#8a6540")
                  }
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const FooterBottom = ({
  copyrightText,
  tagline,
}: {
  copyrightText?: string;
  tagline?: string;
}) => (
  <div
    className="pt-8 text-center text-xs md:text-sm"
    style={{ borderTop: "1px solid rgba(249,115,22,0.14)" }}
  >
    <div className="flex items-center justify-center gap-2 mb-2">
      <Flame
        className="w-4 h-4"
        fill="currentColor"
        style={{ color: "#f97316", opacity: 0.7 }}
      />
      <p style={{ color: "#8a6540" }}>
        {copyrightText ?? "© 2026 The Dating App. All rights reserved."}
      </p>
    </div>
    <p style={{ color: "#4a3520" }}>
      {tagline ?? "Made in Hyderabad, India ❤️ for genuine connections."}
    </p>
  </div>
);

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/footer/`);
        if (response.ok) {
          const data = await response.json();
          setFooterData(data);
        }
      } catch (error) {
        console.error("Failed to fetch footer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFooterData();
  }, []);

  const inner = loading || !footerData ? (
    <>
      <DefaultSections />
      <FooterBottom />
    </>
  ) : (
    <>
      {footerData.sections.length > 0 && (
        <SectionLinks sections={footerData.sections} />
      )}
      {(footerData.settings.show_copyright ||
        footerData.settings.show_tagline) && (
        <FooterBottom
          copyrightText={
            footerData.settings.show_copyright
              ? footerData.settings.copyright_text
              : undefined
          }
          tagline={
            footerData.settings.show_tagline
              ? footerData.settings.tagline
              : undefined
          }
        />
      )}
    </>
  );

  return (
    <footer
      className="relative text-white rounded-t-[32px] md:rounded-[32px] p-8 md:p-12 mt-12 mx-0 md:mx-4 mb-0 md:mb-8 overflow-hidden"
      style={footerStyle}
    >
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.4) 50%, transparent 92%)",
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative">{inner}</div>
    </footer>
  );
};

export default Footer;