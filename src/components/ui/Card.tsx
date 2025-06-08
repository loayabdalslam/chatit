import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn, getCardClasses, animations } from "../../lib/theme";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  animated?: boolean;
  hover?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', animated = false, hover = false, children, ...props }, ref) => {
    const cardClasses = cn(
      getCardClasses(variant),
      hover && "group",
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={animations.fadeIn}
          whileHover={hover ? { y: -2 } : undefined}
          transition={{ duration: 0.2 }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pb-4", className)}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
);

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter"; 