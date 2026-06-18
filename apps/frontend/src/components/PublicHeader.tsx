import { useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Brand } from "@/components/shared/Logo";
import { loginHref, signupHref, NAV_LINKS } from "@/constant/landingPage";
import useGlobalHooks from "@/hooks/useGlobal";
import DarkModeButton from "@/components/shared/DarkModeButton";
import { cn } from "@/utils/cn";

const navLinkClass =
  "text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md transition-colors";

const menuVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const PublicHeader = () => {
  const { navOpen, setNavOpen, handleScroll } = useGlobalHooks();

  const handleMobileNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    handleScroll(e, href);
    setNavOpen(false);
  };

  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [navOpen]);

  return (
    <header
      onClick={() => {
        if (navOpen) setNavOpen(false);
      }}
      className={cn(
        "fixed w-full top-0 z-50 bg-white/80 dark:bg-[#0b111e]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors",
        navOpen && "inset-0",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            setNavOpen(false);
          }}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <Brand descriptionClassName="block" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className={navLinkClass}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <DarkModeButton />

          <a href={loginHref} className={navLinkClass}>
            Sign in
          </a>

          <a
            href={signupHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Get started <ArrowRight size={18} />
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1.5 md:hidden">
          <DarkModeButton />

          <button
            type="button"
            aria-label={
              navOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={navOpen}
            aria-controls="mobile-navigation"
            className="p-1 text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            onClick={() => setNavOpen((prev) => !prev)}
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Flyout Menu */}

      {navOpen && (
        <motion.div
          id="mobile-navigation"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 md:hidden border-t border-foreground/10 overflow-hidden"
        >
          {/* NAV LINKS */}
          <motion.ul
            className="pb-4 space-y-3"
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            {NAV_LINKS.map((link) => (
              <motion.li key={link.href} variants={itemVariants}>
                <motion.a
                  href={link.href}
                  onClick={(e) => handleMobileNavigation(e, link.href)}
                  className="text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100"
                  whileTap={{ scale: 0.98 }}
                >
                  {link.label}
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>

          {/* DIVIDER */}
          <div className="border-t border-foreground/40 mt-1 mb-4" />

          {/* ACTIONS */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <a
              href={loginHref}
              onClick={() => setNavOpen(false)}
              className="text-md font-medium text-slate-600 dark:text-slate-400"
            >
              Sign in
            </a>

            <a
              href={signupHref}
              onClick={() => setNavOpen(false)}
              className="max-w-37.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-white text-md font-semibold px-4 py-2 flex-1"
            >
              Get started <ArrowRight size={18} />
            </a>
          </motion.div>
        </motion.div>
      )}
    </header>
  );
};

export default PublicHeader;
