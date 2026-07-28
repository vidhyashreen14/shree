'use client';

<<<<<<< HEAD
import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, Plus } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";
=======
import * as React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Plus } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { cn } from '@/lib/utils';
>>>>>>> a821a0c (second update)

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
<<<<<<< HEAD
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";
=======
  <AccordionPrimitive.Item ref={ref} className={cn('border-b', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';
>>>>>>> a821a0c (second update)

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

interface AccordionItemData {
  id: string;
  number: string;
  title: string;
  content: string;
}

const items: AccordionItemData[] = [
  {
<<<<<<< HEAD
    id: "discovery",
    number: "01",
    title: "Discovery",
    content:
      "We dive deep into your business goals, target audience, and competitive landscape to uncover what truly drives growth and shapes a clear product direction.",
  },
  {
    id: "design",
    number: "02",
    title: "Design",
    content:
      "Our designers craft pixel-perfect interfaces that blend aesthetics with functionality, translating research into intuitive experiences users love at first interaction.",
  },
  {
    id: "engineering",
    number: "03",
    title: "Engineering",
    content:
      "We build robust, performant solutions with modern tech stacks — clean architecture, test coverage, and a codebase that scales as confidently as your product does.",
  },
  {
    id: "launch",
    number: "04",
    title: "Launch",
    content:
      "From staging to production, we handle deployment pipelines, monitoring setup, and rollout strategies so your release day is smooth, stable, and celebrated.",
=======
    id: 'discovery',
    number: '01',
    title: 'Discovery',
    content:
      'We dive deep into your business goals, target audience, and competitive landscape to uncover what truly drives growth and shapes a clear product direction.',
  },
  {
    id: 'design',
    number: '02',
    title: 'Design',
    content:
      'Our designers craft pixel-perfect interfaces that blend aesthetics with functionality, translating research into intuitive experiences users love at first interaction.',
  },
  {
    id: 'engineering',
    number: '03',
    title: 'Engineering',
    content:
      'We build robust, performant solutions with modern tech stacks — clean architecture, test coverage, and a codebase that scales as confidently as your product does.',
  },
  {
    id: 'launch',
    number: '04',
    title: 'Launch',
    content:
      'From staging to production, we handle deployment pipelines, monitoring setup, and rollout strategies so your release day is smooth, stable, and celebrated.',
>>>>>>> a821a0c (second update)
  },
];

const AccordionMotionServices = () => {
<<<<<<< HEAD
  const [openItem, setOpenItem] = useState<string>("discovery");
=======
  const [openItem, setOpenItem] = useState<string>('discovery');
>>>>>>> a821a0c (second update)
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center px-4 py-8 w-full">
      <div className="w-full max-w-lg">
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={(v) => setOpenItem(v)}
          className="w-full"
        >
          {items.map((item) => {
            const isActive = openItem === item.id;
            const isHovered = hoveredId === item.id;

            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="relative border-none"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <AccordionTrigger className="hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden px-1 py-5 cursor-pointer">
                  <div className="flex items-center gap-6 w-full">
                    {/* Number bubble */}
                    <div className="relative flex h-10 w-10 items-center justify-center shrink-0">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-foreground"
                        initial={false}
                        animate={{
                          scale: isActive ? 1 : isHovered ? 0.85 : 0,
                          opacity: isActive ? 1 : isHovered ? 0.1 : 0,
                        }}
<<<<<<< HEAD
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
=======
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>>>>>>> a821a0c (second update)
                      />
                      <motion.span
                        className="relative z-10 text-sm font-medium tracking-wide"
                        animate={{
                          color: isActive
<<<<<<< HEAD
                            ? "var(--color-primary-foreground)"
                            : "var(--color-muted-foreground)",
=======
                            ? 'var(--color-primary-foreground)'
                            : 'var(--color-muted-foreground)',
>>>>>>> a821a0c (second update)
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.number}
                      </motion.span>
                    </div>

                    {/* Title */}
                    <motion.span
                      className="text-base font-medium"
                      animate={{
                        x: isActive || isHovered ? 4 : 0,
                        color:
                          isActive || isHovered
<<<<<<< HEAD
                            ? "var(--color-foreground)"
                            : "var(--color-muted-foreground)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
=======
                            ? 'var(--color-foreground)'
                            : 'var(--color-muted-foreground)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
>>>>>>> a821a0c (second update)
                    >
                      {item.title}
                    </motion.span>

                    {/* Plus / X icon */}
                    <motion.div
                      className="ml-auto flex h-8 w-8 items-center justify-center shrink-0"
                      animate={{
                        rotate: isActive ? 45 : 0,
                        opacity: isActive || isHovered ? 1 : 0.4,
                      }}
<<<<<<< HEAD
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
=======
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>>>>>>> a821a0c (second update)
                    >
                      <Plus className="size-4 text-foreground" />
                    </motion.div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pl-16 pr-4 pb-6 text-sm text-muted-foreground leading-relaxed">
                  {item.content}
                </AccordionContent>

                {/* Static border */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

                {/* Animated active/hover line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-px origin-left bg-foreground"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isActive ? 1 : isHovered ? 0.3 : 0 }}
<<<<<<< HEAD
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
=======
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>>>>>>> a821a0c (second update)
                />
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionMotionServices };
export default AccordionMotionServices;
