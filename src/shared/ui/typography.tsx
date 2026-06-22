import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib/cn'

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-[4.5rem] leading-none font-semibold tracking-tight text-era-fg',
      h2: 'text-[3rem] leading-tight font-semibold text-era-fg',
      h3: 'text-2xl leading-snug font-semibold text-era-fg',
      h4: 'text-xl leading-snug font-semibold text-era-fg-dim',
      body: 'text-base leading-normal font-normal text-era-fg-dim',
      bodySmall: 'text-body-small leading-normal font-normal text-era-fg-mute',
      label: 'text-sm font-medium tracking-wide text-era-fg-mute uppercase',
      mono: 'font-mono text-sm font-normal text-era-accent-2',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

const defaultElement: Record<
  NonNullable<VariantProps<typeof typographyVariants>['variant']>,
  React.ElementType
> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  bodySmall: 'p',
  label: 'span',
  mono: 'span',
}

type TypographyProps = React.ComponentPropsWithoutRef<'p'> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType
    asChild?: boolean
  }

function Typography({
  className,
  variant = 'body',
  as,
  asChild = false,
  ...props
}: TypographyProps) {
  const resolvedVariant = variant ?? 'body'
  const Comp = asChild ? Slot.Root : (as ?? defaultElement[resolvedVariant])

  return (
    <Comp
      data-slot="typography"
      data-variant={resolvedVariant}
      className={cn(
        typographyVariants({ variant: resolvedVariant, className }),
      )}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
