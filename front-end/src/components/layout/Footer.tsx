import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

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

/* ─── Sub-components receive isDark via prop to avoid extra hook calls ─── */

const SectionLinks = ({
  sections,
  isDark,
}: {
  sections: FooterSection[];
  isDark: boolean;
}) => {
  const linkColor      = isDark ? "#8a6540" : "#64748b";
  const linkHoverColor = isDark ? "#f0e8de" : "#1e293b";
  const headingColor   = isDark ? "#fb923c" : "#1d4ed8";

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${Math.min(sections.length, 4)} gap-8 mb-12`}>
      {sections.map((section) => (
        <div key={section.id}>
          <h4
            className="font-black mb-4 text-sm md:text-base uppercase tracking-widest transition-colors duration-300"
            style={{ color: headingColor }}
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
                    style={{ color: linkColor }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = linkHoverColor)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = linkColor)}
                  >
                    {link.title}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    target={link.open_new_tab ? "_blank" : undefined}
                    rel={link.open_new_tab ? "noreferrer" : undefined}
                    className="transition-colors duration-200"
                    style={{ color: linkColor }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = linkHoverColor)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = linkColor)}
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
};

const DefaultSections = ({ isDark }: { isDark: boolean }) => {
  const linkColor      = isDark ? "#8a6540" : "#64748b";
  const linkHoverColor = isDark ? "#f0e8de" : "#1e293b";
  const headingColor   = isDark ? "#fb923c" : "#1d4ed8";

  const sections = [
    {
      title: "Company",
      links: [
        { label: "About Us",  to: "/about",    external: false },
        { label: "Careers",   to: "/careers",  external: false },
        { label: "Press",     to: "/press",    external: false },
        { label: "Blog",      to: "/blog",     external: false },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center",    to: "/help",       external: false },
        { label: "Safety Center",  to: "/safety",     external: false },
        { label: "Guidelines",     to: "/guidelines", external: false },
        { label: "Contact Us",     to: "/contact",    external: false },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy",        to: "/privacy",  external: false },
        { label: "Terms of Service",      to: "/terms",    external: false },
        { label: "Cookie Policy",         to: "/cookies",  external: false },
        { label: "Intellectual Property", to: "/ip",       external: false },
      ],
    },
    {
      title: "Social",
      links: [
        { label: "Instagram", to: "https://instagram.com", external: true },
        { label: "Twitter / X", to: "https://twitter.com", external: true },
        { label: "Facebook",  to: "https://facebook.com",  external: true },
        { label: "TikTok",    to: "https://tiktok.com",    external: true },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      {sections.map((section) => (
        <div key={section.title}>
          <h4
            className="font-black mb-4 text-sm md:text-base uppercase tracking-widest transition-colors duration-300"
            style={{ color: headingColor }}
          >
            {section.title}
          </h4>
          <ul className="space-y-2.5 text-xs md:text-sm">
            {section.links.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.to}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors duration-200"
                    style={{ color: linkColor }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = linkHoverColor)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = linkColor)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="transition-colors duration-200"
                    style={{ color: linkColor }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = linkHoverColor)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = linkColor)}
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
};

const FooterBottom = ({
  copyrightText,
  tagline,
  isDark,
}: {
  copyrightText?: string;
  tagline?: string;
  isDark: boolean;
}) => (
  <div
    className="pt-8 text-center text-xs md:text-sm transition-all duration-300"
    style={{
      borderTop: isDark
        ? "1px solid rgba(249,115,22,0.14)"
        : "1px solid rgba(29,78,216,0.1)",
    }}
  >
    <div className="flex items-center justify-center gap-2 mb-2">
      <Flame
        className="w-4 h-4 transition-colors duration-300"
        fill="currentColor"
        style={{ color: isDark ? "#f97316" : "#1d4ed8", opacity: 0.7 }}
      />
      <p className="transition-colors duration-300" style={{ color: isDark ? "#8a6540" : "#64748b" }}>
        {copyrightText ?? "© 2026 The Dating App. All rights reserved."}
      </p>
    </div>
    <p className="transition-colors duration-300" style={{ color: isDark ? "#4a3520" : "#94a3b8" }}>
      {tagline ?? "Made in Hyderabad, India ❤️ for genuine connections."}
    </p>
  </div>
);

const Footer = () => {
  const { isDark } = useTheme();
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

  /* ─── Theme-aware footer shell styles ─── */
  const footerStyle = isDark ? {
    background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
    border: "1px solid rgba(249,115,22,0.18)",
    boxShadow: "0 -4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(249,115,22,0.1)",
  } : {
    background: "linear-gradient(145deg, #f8faff 0%, #f8f9fc 100%)",
    border: "1px solid rgba(29,78,216,0.12)",
    boxShadow: "0 -4px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(29,78,216,0.06)",
  };

  const topAccent = isDark
    ? "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.4) 50%, transparent 92%)"
    : "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.25) 50%, transparent 92%)";

  const ambientGlow = isDark
    ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)"
    : "radial-gradient(ellipse, rgba(29,78,216,0.04) 0%, transparent 70%)";

  const inner = loading || !footerData ? (
    <>
      <DefaultSections isDark={isDark} />
      <FooterBottom isDark={isDark} />
    </>
  ) : (
    <>
      {footerData.sections.length > 0 && (
        <SectionLinks sections={footerData.sections} isDark={isDark} />
      )}
      {(footerData.settings.show_copyright || footerData.settings.show_tagline) && (
        <FooterBottom
          copyrightText={footerData.settings.show_copyright ? footerData.settings.copyright_text : undefined}
          tagline={footerData.settings.show_tagline ? footerData.settings.tagline : undefined}
          isDark={isDark}
        />
      )}
    </>
  );

  return (
    <footer
      className="relative text-white rounded-t-[32px] md:rounded-[32px] p-8 md:p-12 mt-12 mx-0 md:mx-4 mb-0 md:mb-8 overflow-hidden transition-all duration-300"
      style={footerStyle}
    >
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: topAccent }}
      />
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 pointer-events-none"
        style={{ background: ambientGlow }}
      />
      <div className="relative">{inner}</div>
    </footer>
  );
};

export default Footer;