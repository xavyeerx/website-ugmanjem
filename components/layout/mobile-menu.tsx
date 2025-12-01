"use client";

import { sections } from "@/data/navigation";
import { WHATSAPP_ORDER_URL } from "@/lib/constants";

interface MobileMenuProps {
  isOpen: boolean;
  activeSection: string;
  onNavClick: (sectionId: string) => void;
  onClose: () => void;
}

export default function MobileMenu({
  isOpen,
  activeSection,
  onNavClick,
  onClose,
}: MobileMenuProps) {
  const handleNavClick = (sectionId: string) => {
    onNavClick(sectionId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
      />

      {/* Mobile Menu */}
      <div className="fixed top-0 right-0 h-full w-3/4 max-w-sm bg-card z-50 md:hidden shadow-2xl overflow-hidden border-l border-border">
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-bold text-accent">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavClick(section.id)}
                className={`w-full text-left px-6 py-4 font-semibold transition-colors ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {section.name}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-border">
            <a
              href={WHATSAPP_ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 rounded-full bg-accent text-white text-center font-bold hover:bg-accent/90 transition-colors"
            >
              Order Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
