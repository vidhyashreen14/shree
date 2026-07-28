"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  ChevronDown,
  Menu,
  X,
  Heart,
  Brain,
  Activity,
  Bone,
  Stethoscope,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceItem {
  icon: any;
  title: string;
  description: string;
  href: string;
}

const medicalServices: ServiceItem[] = [
  {
    icon: Heart,
    title: "Cardiology",
    description: "Comprehensive heart care and diagnostic testing.",
    href: "/services/cardiology",
  },
  {
    icon: Brain,
    title: "Neurology",
    description: "Expert treatment for brain and nervous system conditions.",
    href: "/services/neurology",
  },
  {
    icon: Bone,
    title: "Orthopedics",
    description: "Bone, joint, and muscle care from top specialists.",
    href: "/services/orthopedics",
  },
  {
    icon: Activity,
    title: "General Medicine",
    description: "Primary care, health screenings, and annual wellness visits.",
    href: "/services/general",
  },
  {
    icon: Stethoscope,
    title: "Pediatrics",
    description: "Dedicated compassionate healthcare for children and infants.",
    href: "/services/pediatrics",
  },
  {
    icon: Sparkles,
    title: "Dermatology",
    description: "Skin checkups, acne treatments, and cosmetic care.",
    href: "/services/dermatology",
  },
];

export default function Navbar03() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <div className="w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="relative flex items-center gap-2 group">
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-foreground/90 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative z-10 font-display text-xl font-bold tracking-tight text-background dark:text-foreground pl-1.5 group-hover:text-background transition-colors duration-300">
                shad
                <span className="text-foreground dark:text-background group-hover:text-foreground">
                  cnspace.
                </span>
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </a>
              <a
                href="/find-doctor"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Find a Doctor
              </a>

              {/* Dropdown Link */}
              <div
                className="relative"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
                >
                  Services
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      isServicesOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Mega Menu */}
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full z-50 w-[560px] rounded-xl border border-border bg-popover p-5 shadow-lg"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {medicalServices.map((service) => {
                          const Icon = service.icon;
                          return (
                            <a
                              key={service.title}
                              href={service.href}
                              className="group flex gap-3.5 items-start p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="p-2 bg-primary/5 text-primary rounded-lg shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Icon className="size-4.5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                                  {service.title}
                                  <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </p>
                                <p className="text-xs text-muted-foreground leading-normal">
                                  {service.description}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between bg-muted/30 -mx-5 -mb-5 p-5 rounded-b-xl">
                        <div className="flex items-center gap-2">
                          <Shield className="size-4 text-emerald-500" />
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            Certified Medical Excellence
                          </span>
                        </div>
                        <a
                          href="/services"
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          View All Services
                          <ArrowRight className="size-3" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href="/blogs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Health Blogs
              </a>
            </nav>
          </div>

          {/* Contact Actions */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="tel:5122030405"
              className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-85 transition-opacity"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Phone className="size-4" />
              </div>
              <span>(512) 203-0405</span>
            </a>
            <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-6 cursor-pointer">
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            >
              {isOpen ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="space-y-1.5 px-4 py-4">
              <a
                href="/about"
                className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
              >
                About Us
              </a>
              <a
                href="/find-doctor"
                className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
              >
                Find a Doctor
              </a>

              {/* Mobile Services Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Services
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      isServicesOpen && "rotate-180"
                    )}
                  />
                </button>
                {isServicesOpen && (
                  <div className="mt-1 pl-4 space-y-1">
                    {medicalServices.map((service) => (
                      <a
                        key={service.title}
                        href={service.href}
                        className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {service.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/blogs"
                className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
              >
                Health Blogs
              </a>

              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <a
                  href="tel:5122030405"
                  className="flex items-center gap-3 px-3 py-2 text-base font-semibold text-foreground"
                >
                  <Phone className="size-4.5 text-primary" />
                  (512) 203-0405
                </a>
                <Button className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold py-6 cursor-pointer">
                  Contact Us
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
