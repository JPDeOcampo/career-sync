import { NAV_LINKS, loginHref, signupHref } from "@/constant/landingPage";
import { Brand } from "@/components/shared/Logo";
import usePublicPageHooks from "@/hooks/usePublicPage";
import Link from "next/link";

const linkBase =
  "text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3.5">
    {children}
  </p>
);

const FooterLink = ({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}) => (
  <Link href={href} onClick={onClick} className={linkBase}>
    {children}
  </Link>
);

const PublicFooter = () => {
  const { handleScroll } = usePublicPageHooks();

  return (
    <footer className="bg-background border-t border-foreground/10 transition-colors">
      <div className="px-4 lg:px-6 py-12 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2">
          <Link
            href="/"
            onClick={(e) => handleScroll(e, "")}
            className="flex items-center gap-2 mb-4"
          >
            <Brand descriptionClassName="block" />
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Your job search, organized.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <SectionTitle>Product</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <FooterLink
                key={link.href}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
              >
                {link.label}
              </FooterLink>
            ))}
          </div>
        </div>

        {/* Account Links */}
        <div>
          <SectionTitle>Account</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <FooterLink href={loginHref}>Sign In</FooterLink>
            <FooterLink href={signupHref}>Create account</FooterLink>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-4">
        <div className="border-t border-foreground/10 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
            © 2026 CareerSync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
