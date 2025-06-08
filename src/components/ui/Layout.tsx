import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn, getContainerClasses, animations } from "../../lib/theme";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  animated?: boolean;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
}

interface HeaderProps {
  children?: ReactNode;
  className?: string;
}

interface FooterProps {
  children?: ReactNode;
  className?: string;
}

// Default Header Component
export function DefaultHeader({ children, className }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black"
          >
            <MessageSquare className="h-5 w-5 text-white" />
          </motion.div>
          <span className="text-2xl font-bold">CHATIT</span>
        </div>
        {children}
      </div>
    </motion.header>
  );
}

// Default Footer Component
export function DefaultFooter({ children, className }: FooterProps) {
  return (
    <footer className={cn("py-12 border-t border-gray-200", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">CHATIT</span>
          </div>
          {children || (
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ChatIt. All rights reserved.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

// Main Layout Component
export function Layout({
  children,
  className,
  containerSize = 'lg',
  showHeader = true,
  showFooter = true,
  animated = true,
  headerContent,
  footerContent
}: LayoutProps) {
  const content = animated ? (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations.fadeIn}
      className={cn(getContainerClasses(containerSize), className)}
    >
      {children}
    </motion.div>
  ) : (
    <div className={cn(getContainerClasses(containerSize), className)}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {showHeader && <DefaultHeader>{headerContent}</DefaultHeader>}
      
      <main className="flex-1">
        {content}
      </main>
      
      {showFooter && <DefaultFooter>{footerContent}</DefaultFooter>}
    </div>
  );
}

// Page Wrapper for authenticated pages
interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  animated?: boolean;
}

export function PageWrapper({ 
  children, 
  title, 
  subtitle, 
  className, 
  animated = true 
}: PageWrapperProps) {
  const content = (
    <div className={cn("py-8", className)}>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={animations.fadeInUp}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Section Component for consistent spacing
interface SectionProps {
  children: ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  background?: 'white' | 'gray' | 'black';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function Section({
  children,
  className,
  containerSize = 'lg',
  background = 'white',
  padding = 'lg',
  animated = false
}: SectionProps) {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    black: 'bg-black text-white'
  };

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
  };

  const content = (
    <section className={cn(bgClasses[background], paddingClasses[padding], className)}>
      <div className={getContainerClasses(containerSize)}>
        {children}
      </div>
    </section>
  );

  if (animated) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={animations.fadeIn}
      >
        {content}
      </motion.div>
    );
  }

  return content;
} 